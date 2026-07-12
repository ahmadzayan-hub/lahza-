// Masaar main app. Vanilla ES modules, no build step.
import { KPIS, PROJECTS, RISKS, THREATS, CONTROLS, THREAT_ASSETS, detectGaps } from './data.js';
import { STRINGS } from './i18n.js';
import { Agent, PROVIDERS } from './agent.js';

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

const state = {
  lang:  localStorage.getItem('masaar.lang')  || (navigator.language?.startsWith('ar') ? 'ar' : 'en'),
  theme: localStorage.getItem('masaar.theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  kpi:   loadJSON('masaar.kpi', {}),
  view:  location.hash.slice(1) || 'overview',
  audit: loadJSON('masaar.audit', []),
  installEvent: null
};

function loadJSON(k, fallback){ try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } }
function saveJSON(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ---------- Utility ----------
function t(){ return STRINGS[state.lang]; }
function safe(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmtAED(v){
  if (v >= 1_000_000) return 'AED ' + (v/1_000_000).toFixed(2).replace(/\.?0+$/,'') + 'M';
  if (v >= 1_000) return 'AED ' + (v/1_000).toFixed(0) + 'K';
  return 'AED ' + v;
}

// ---------- KPI status compute ----------
function statusOf(kpi){
  const state_val = state.kpi[kpi.id]?.value;
  if (state_val == null || state_val === '') return 'none';
  const n = Number(state_val);
  if (!isFinite(n)) return 'none';
  if (kpi.unit === 'percent') {
    const targetPct = parseFloat(String(kpi.target_en).match(/\d+(\.\d+)?/)?.[0]);
    if (isFinite(targetPct)) {
      if (kpi.direction === 'higher') return n >= targetPct ? 'ok' : (n >= targetPct - 5 ? 'warn' : 'bad');
      return n <= targetPct ? 'ok' : 'warn';
    }
  }
  if (kpi.id === 'safety') return n === 0 ? 'ok' : 'bad';
  return 'ok';
}

// ---------- Render sections ----------
function renderApp(){
  document.documentElement.lang = t().lang;
  document.documentElement.dir  = t().dir;
  document.documentElement.setAttribute('data-theme', state.theme);

  renderTop();
  renderNav();
  renderOverview();
  renderDashboard();
  renderPlan();
  renderProjects();
  renderRisks();
  renderSecurity();
  renderAgentPanel();
}

function renderTop(){
  $('#brand-name').textContent = t().brand;
  $('#brand-tag').textContent  = t().tagline;
  $('#lang-btn').textContent   = t().langSwitch;
  $('#theme-btn').setAttribute('aria-pressed', state.theme === 'dark' ? 'true' : 'false');
  $('#theme-btn').title = state.theme === 'dark' ? t().themeLight : t().themeDark;
  const installBtn = $('#install-btn');
  installBtn.textContent = t().install;
  installBtn.hidden = !state.installEvent;
}

function renderNav(){
  const n = t().nav;
  const items = [
    ['overview', n.overview, 'grid'],
    ['dashboard', n.dashboard, 'chart'],
    ['plan', n.plan, 'route'],
    ['projects', n.projects, 'briefcase'],
    ['risks', n.risks, 'shield'],
    ['security', n.security, 'lock'],
    ['agent', n.agent, 'sparkle']
  ];
  $('#bottom-nav ul').innerHTML = items.map(([id,label,icon]) => `
    <li>
      <a href="#${id}" aria-current="${state.view === id ? 'page' : 'false'}">
        ${iconSvg(icon)}
        <span>${safe(label)}</span>
      </a>
    </li>`).join('');
}

function iconSvg(name){
  const paths = {
    grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    chart:'M4 20V4M4 20h16M8 16l3-4 3 3 5-7',
    route:'M6 3v3M6 21v-3M12 3v18M18 3v3M18 21v-3',
    briefcase:'M3 8h18v11H3zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    shield:'M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z',
    lock:'M6 10V7a6 6 0 1 1 12 0v3M4 10h16v11H4z',
    sparkle:'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.grid}"/></svg>`;
}

// ---- Overview ----
function renderOverview(){
  const o = t().overview;
  $('#overview').innerHTML = `
    <h2>${safe(o.title)}</h2>
    <p class="desc">${safe(o.body)}</p>
    <div class="pillars">
      ${o.pillars.map(p => `
        <article class="pillar">
          <h3>${safe(p.t)}</h3>
          <p>${safe(p.d)}</p>
        </article>`).join('')}
    </div>`;
}

// ---- Dashboard (live KPI entry) ----
function renderDashboard(){
  const d = t().dashboard;
  const grid = KPIS.map(k => {
    const val = state.kpi[k.id]?.value ?? '';
    const upd = state.kpi[k.id]?.updated;
    const s = statusOf(k);
    const label = { ok:d.states.ok, warn:d.states.warn, bad:d.states.bad, none:d.states.none }[s];
    const badgeCls = s === 'none' ? 'badge' : `badge ${s}`;
    return `
      <article class="kpi">
        <div class="kpi-head">
          <div class="kpi-name">${safe(state.lang==='ar' ? k.name_ar : k.name_en)}</div>
          <span class="${badgeCls}">${safe(label)}</span>
        </div>
        <div class="kpi-target">${safe(d.target)}: <strong>${safe(state.lang==='ar' ? k.target_ar : k.target_en)}</strong></div>
        <form class="kpi-form" data-kpi="${k.id}" autocomplete="off">
          <input type="text" inputmode="decimal" placeholder="${safe(d.enterValue)}" value="${safe(val)}" aria-label="${safe(k.name_en)}"/>
          <button type="submit">${safe(d.save)}</button>
        </form>
        <div class="kpi-foot">
          <span>${upd ? safe(d.lastUpdated) + ': ' + new Date(upd).toLocaleDateString(state.lang==='ar' ? 'ar' : 'en') : '—'}</span>
          ${val !== '' ? `<button class="btn-ghost" data-clear-kpi="${k.id}">${safe(d.clear)}</button>` : ''}
        </div>
      </article>`;
  }).join('');
  $('#dashboard').innerHTML = `
    <h2>${safe(d.title)}</h2>
    <p class="desc">${safe(d.note)}</p>
    <div class="grid grid-auto">${grid}</div>`;

  $$('form[data-kpi]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const id = f.dataset.kpi;
      const v = f.querySelector('input').value.trim();
      state.kpi[id] = { value: v, updated: Date.now() };
      saveJSON('masaar.kpi', state.kpi);
      appendAuditNote('kpi', `set ${id} = ${v}`);
      renderDashboard();
    });
  });
  $$('[data-clear-kpi]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.clearKpi;
      delete state.kpi[id];
      saveJSON('masaar.kpi', state.kpi);
      appendAuditNote('kpi', `cleared ${id}`);
      renderDashboard();
    });
  });
}

// ---- Plan ----
function renderPlan(){
  const p = t().plan;
  $('#plan').innerHTML = `
    <h2>${safe(p.title)}</h2>
    <p class="desc">${safe(p.body)}</p>
    <div class="stages">
      ${p.stages.map((s,i) => `
        <article class="stage">
          <div class="stage-num">${i+1}</div>
          <h3>${safe(s.t)}</h3>
          <p>${safe(s.d)}</p>
        </article>`).join('')}
    </div>`;
}

// ---- Projects ----
let projFilters = { q:'', priority:'', status:'', cat:'' };
function renderProjects(){
  const p = t().projects;
  const cats = [...new Set(PROJECTS.map(x => state.lang==='ar' ? x.cat_ar : x.cat_en))];
  $('#projects').innerHTML = `
    <h2>${safe(p.title)}</h2>
    <div class="filters">
      <input type="search" class="grow" id="proj-q" placeholder="${safe(p.search)}" value="${safe(projFilters.q)}"/>
      <select id="proj-priority" aria-label="${safe(p.priority)}">
        <option value="">${safe(p.priority)}</option>
        <option value="critical">${safe(t().common.critical)}</option>
        <option value="high">${safe(t().common.high)}</option>
        <option value="medium">${safe(t().common.medium)}</option>
      </select>
      <select id="proj-status" aria-label="${safe(p.status)}">
        <option value="">${safe(p.status)}</option>
        <option value="active">Active</option>
        <option value="planning">Planning</option>
        <option value="study">Study</option>
      </select>
      <button class="btn btn-ghost" id="proj-reset">${safe(p.reset)}</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>#</th><th>${safe(p.title)}</th><th>${safe(p.category)}</th>
          <th>${safe(p.priority)}</th><th>${safe(p.status)}</th>
          <th class="num">${safe(p.est)}</th><th class="num">${safe(p.b26)}</th>
          <th>${safe(p.action)}</th>
        </tr></thead>
        <tbody id="proj-body"></tbody>
      </table>
    </div>`;

  const draw = () => {
    const rows = PROJECTS
      .map((x,i) => ({ x, i }))
      .filter(({x}) => {
        const q = projFilters.q.toLowerCase();
        if (q) {
          const name = (state.lang==='ar' ? x.name_ar : x.name_en).toLowerCase();
          const cat  = (state.lang==='ar' ? x.cat_ar  : x.cat_en ).toLowerCase();
          if (!(name.includes(q) || cat.includes(q))) return false;
        }
        if (projFilters.priority && x.priority !== projFilters.priority) return false;
        if (projFilters.status && x.status !== projFilters.status) return false;
        return true;
      });
    if (!rows.length) { $('#proj-body').innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:24px">${safe(p.empty)}</td></tr>`; return; }
    $('#proj-body').innerHTML = rows.map(({x,i}) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${safe(state.lang==='ar' ? x.name_ar : x.name_en)}</strong></td>
        <td>${safe(state.lang==='ar' ? x.cat_ar : x.cat_en)}</td>
        <td><span class="badge ${x.priority==='critical'?'bad':x.priority==='high'?'warn':'info'}">${safe(t().common[x.priority] || x.priority)}</span></td>
        <td><span class="badge">${safe(x.status)}</span></td>
        <td class="num">${safe(fmtAED(x.est))}</td>
        <td class="num">${safe(fmtAED(x.b26))}</td>
        <td>${safe(state.lang==='ar' ? x.action_ar : x.action_en)}</td>
      </tr>`).join('');
  };
  draw();

  $('#proj-q').addEventListener('input', e => { projFilters.q = e.target.value; draw(); });
  $('#proj-priority').addEventListener('change', e => { projFilters.priority = e.target.value; draw(); });
  $('#proj-status').addEventListener('change', e => { projFilters.status = e.target.value; draw(); });
  $('#proj-reset').addEventListener('click', () => { projFilters = {q:'', priority:'', status:'', cat:''}; renderProjects(); });
}

// ---- Risks ----
let riskFilters = { q:'', rating:'', like:'', impact:'' };
function renderRisks(){
  const r = t().risks;
  const key = (l,i) => l.charAt(0) + i.charAt(0);
  const counts = { hh:0, hm:0, mh:0, mm:0 };
  RISKS.forEach(x => { const k = key(x.like, x.impact); if (k in counts) counts[k]++; });

  $('#risks').innerHTML = `
    <h2>${safe(r.title)}</h2>
    <div class="grid grid-2">
      <div>
        <p class="desc">${safe(r.heatmap)}</p>
        <div class="heatmap" role="table" aria-label="${safe(r.heatmap)}">
          <div class="heatmap-axis"></div>
          <div class="heatmap-axis">${safe(t().common.low)}</div>
          <div class="heatmap-axis">${safe(t().common.medium)}</div>
          <div class="heatmap-axis">${safe(t().common.high)}</div>

          <div class="heatmap-axis">${safe(r.likelihood)}: ${safe(t().common.high)}</div>
          <div class="heatmap-cell hc-flat"><span>0</span></div>
          <div class="heatmap-cell hc-amber"><div><span class="count">${counts.hm}</span></div></div>
          <div class="heatmap-cell hc-red"><div><span class="count">${counts.hh}</span></div></div>

          <div class="heatmap-axis">${safe(r.likelihood)}: ${safe(t().common.medium)}</div>
          <div class="heatmap-cell hc-flat"><span>0</span></div>
          <div class="heatmap-cell hc-amber"><div><span class="count">${counts.mm}</span></div></div>
          <div class="heatmap-cell hc-red"><div><span class="count">${counts.mh}</span></div></div>

          <div class="heatmap-axis">${safe(r.likelihood)}: ${safe(t().common.low)}</div>
          <div class="heatmap-cell hc-flat"><span>0</span></div>
          <div class="heatmap-cell hc-flat"><span>0</span></div>
          <div class="heatmap-cell hc-amber"><div><span class="count">0</span></div></div>
        </div>
      </div>
      <div>
        <p class="desc">${safe(r.mitigation)}</p>
        <div class="filters">
          <input type="search" class="grow" id="risk-q" placeholder="${safe(r.mitigation)}" value="${safe(riskFilters.q)}"/>
          <select id="risk-rating" aria-label="${safe(r.rating)}">
            <option value="">${safe(r.rating)}</option>
            <option value="red">${safe(t().common.red)}</option>
            <option value="amber">${safe(t().common.amber)}</option>
            <option value="green">${safe(t().common.green)}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="table-wrap" style="margin-block-start:14px">
      <table>
        <thead><tr>
          <th>#</th><th>${safe(r.title)}</th>
          <th>${safe(r.likelihood)}</th><th>${safe(r.impact)}</th>
          <th>${safe(r.rating)}</th><th>${safe(r.mitigation)}</th>
        </tr></thead>
        <tbody id="risk-body"></tbody>
      </table>
    </div>`;

  const draw = () => {
    const rows = RISKS.filter(x => {
      const q = riskFilters.q.toLowerCase();
      if (q) {
        const rname = (state.lang==='ar' ? x.risk_ar : x.risk_en).toLowerCase();
        const rmit  = (state.lang==='ar' ? x.mit_ar  : x.mit_en ).toLowerCase();
        if (!(rname.includes(q) || rmit.includes(q))) return false;
      }
      if (riskFilters.rating && x.rating !== riskFilters.rating) return false;
      return true;
    });
    if (!rows.length) { $('#risk-body').innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:24px">${safe(r.empty)}</td></tr>`; return; }
    $('#risk-body').innerHTML = rows.map((x,i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${safe(state.lang==='ar' ? x.risk_ar : x.risk_en)}</strong></td>
        <td>${safe(t().common[x.like]||x.like)}</td>
        <td>${safe(t().common[x.impact]||x.impact)}</td>
        <td><span class="badge ${x.rating==='red'?'bad':x.rating==='amber'?'warn':'ok'}">${safe(t().common[x.rating]||x.rating)}</span></td>
        <td>${safe(state.lang==='ar' ? x.mit_ar : x.mit_en)}</td>
      </tr>`).join('');
  };
  draw();
  $('#risk-q').addEventListener('input', e => { riskFilters.q = e.target.value; draw(); });
  $('#risk-rating').addEventListener('change', e => { riskFilters.rating = e.target.value; draw(); });
}

// ---- Security (threat model + live gap scan) ----
function renderSecurity(){
  const s = t().security;
  const runtime = getRuntimeContext();
  const gaps = detectGaps(runtime);
  const appAssets = THREAT_ASSETS.filter(x => x.layer === 'app');
  const envAssets = THREAT_ASSETS.filter(x => x.layer === 'env');

  $('#security').innerHTML = `
    <h2>${safe(s.title)}</h2>
    <p class="desc">${safe(s.lead)}</p>

    <div class="grid grid-2">
      <article class="card">
        <h3 style="margin:0 0 8px; font-size:14px">${safe(s.appLayer)}</h3>
        <div class="chips">${appAssets.map(a => `<span class="badge">${safe(state.lang==='ar'?a.name_ar:a.name_en)}</span>`).join('')}</div>
      </article>
      <article class="card">
        <h3 style="margin:0 0 8px; font-size:14px">${safe(s.envLayer)}</h3>
        <div class="chips">${envAssets.map(a => `<span class="badge">${safe(state.lang==='ar'?a.name_ar:a.name_en)}</span>`).join('')}</div>
      </article>
    </div>

    <h3 style="margin:18px 0 8px; font-size:16px">${safe(s.threats)}</h3>
    <div class="grid grid-2">
      ${THREATS.map(th => `
        <article class="threat" data-severity="${th.severity}">
          <h3><span class="stride-tag" title="STRIDE">${safe(th.stride)}</span> ${safe(state.lang==='ar'?th.title_ar:th.title_en)}</h3>
          <p><strong>${safe(s.scenario)}:</strong> ${safe(state.lang==='ar'?th.scenario_ar:th.scenario_en)}</p>
          <p><strong>${safe(s.control)}:</strong> ${safe(state.lang==='ar'?th.control_ar:th.control_en)}</p>
          <div class="meta">
            <span class="badge ${th.status==='mitigated'?'ok':th.status==='partial'?'warn':'bad'}">${safe(s.st[th.status])}</span>
            <span class="badge ${th.severity==='high'?'bad':th.severity==='medium'?'warn':'ok'}">${safe(s.severity)}: ${safe(t().common[th.severity])}</span>
          </div>
        </article>`).join('')}
    </div>

    <h3 style="margin:18px 0 8px; font-size:16px">${safe(s.controls)}</h3>
    <div class="chips">
      ${CONTROLS.map(c => `<span class="badge info">${safe(state.lang==='ar'?c.name_ar:c.name_en)}</span>`).join('')}
    </div>

    <div style="display:flex; align-items:center; gap:10px; margin:18px 0 8px">
      <h3 style="margin:0; font-size:16px">${safe(s.gaps)}</h3>
      <button class="btn" id="sec-scan">${safe(s.scan)}</button>
    </div>
    <div id="gap-list" class="gap-list">
      ${gaps.length ? gaps.map(g => `
        <div class="gap">
          <h4><span class="badge ${g.severity==='high'?'bad':g.severity==='medium'?'warn':'ok'}">${safe(t().common[g.severity])}</span> ${safe(state.lang==='ar'?g.title_ar:g.title_en)}</h4>
          <p>${safe(state.lang==='ar'?g.fix_ar:g.fix_en)}${g.detail?` — <em>${safe(g.detail)}</em>`:''}</p>
        </div>`).join('') : `<p class="desc">${safe(s.clean)}</p>`}
    </div>`;

  $('#sec-scan').addEventListener('click', () => renderSecurity());
}

// ---- Agent panel ----
let agent;
function renderAgentPanel(){
  const a = t().agent;
  const providers = agent.providerList();
  const models = agent.modelList();

  $('#agent').innerHTML = `
    <h2>${safe(a.title)}</h2>
    <p class="desc">${safe(a.lead)}</p>
    <div class="agent-shell">
      <div class="card agent-config">
        <div>
          <label>${safe(a.provider)}</label>
          <select id="ag-provider">
            ${providers.map(p => `<option value="${p.id}" ${p.id===agent.provider?'selected':''}>${safe(p.label)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>${safe(a.model)}</label>
          <select id="ag-model">
            ${models.map(m => `<option value="${m}" ${m===agent.model?'selected':''}>${safe(m)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>${safe(a.key)}</label>
          <input type="password" id="ag-key" placeholder="sk-… / gsk_… / AIza…" value="${agent.hasKey() ? '' : ''}" autocomplete="off"/>
          <div style="font-size:12px; color:var(--muted); margin-block-start:4px">
            ${agent.hasKey() ? safe(a.connected) + ' · ' + safe(agent.maskedKey()) : safe(a.disconnected)}
          </div>
        </div>
        <button class="btn btn-primary" id="ag-save">${safe(a.save)}</button>

        <div class="loop-row">
          <label style="font-size:11px; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:.4px">${safe(a.loop)}</label>
          <input type="number" min="3" step="1" id="ag-loop-min" value="${agent.loopMinutes}" aria-label="${safe(a.loopMin)}"/>
          <button class="btn" id="ag-loop-toggle">${agent.isLooping() ? safe(a.stop) : safe(a.start)}</button>
        </div>
        <button class="btn btn-ghost" id="ag-clear-mem">${safe(a.clearMem)}</button>

        <details style="margin-block-start:8px">
          <summary style="font-size:12px; color:var(--muted); cursor:pointer">${safe(a.tools)}</summary>
          <ul style="margin:8px 0 0; padding-inline-start:18px; font-size:12px; color:var(--ink-2)">
            <li>get_kpis, get_projects, get_risks, get_security</li>
            <li>propose_kpi_update, add_note, health_scan</li>
          </ul>
        </details>
        <p class="desc" style="font-size:12px">${safe(a.systemNote)}</p>
      </div>

      <div class="chat" aria-live="polite">
        <div class="chat-log" id="chat-log">
          <div class="msg system">${safe(a.systemNote)}</div>
        </div>
        <form class="chat-input" id="chat-form">
          <textarea id="chat-in" rows="1" placeholder="${safe(a.placeholder)}" aria-label="${safe(a.title)}"></textarea>
          <button type="submit">${safe(a.send)}</button>
        </form>
      </div>
    </div>`;

  $('#ag-provider').addEventListener('change', e => { agent.setProvider(e.target.value); renderAgentPanel(); });
  $('#ag-model').addEventListener('change', e => agent.setModel(e.target.value));
  $('#ag-save').addEventListener('click', () => {
    const v = $('#ag-key').value.trim();
    if (v) { agent.setKey(v); renderAgentPanel(); }
  });
  $('#ag-clear-mem').addEventListener('click', () => { agent.clearMemory(); renderAgentPanel(); });
  $('#ag-loop-toggle').addEventListener('click', () => {
    if (agent.isLooping()) agent.stopLoop();
    else agent.startLoop($('#ag-loop-min').value);
    renderAgentPanel();
  });
  $('#chat-form').addEventListener('submit', async e => {
    e.preventDefault();
    const txt = $('#chat-in').value.trim();
    if (!txt) return;
    if (!agent.hasKey()) { pushMsg('system', t().agent.disconnected + ' — ' + t().agent.key); return; }
    pushMsg('user', txt);
    $('#chat-in').value = '';
    try {
      const { text, tools } = await agent.ask(txt);
      tools.forEach(t => pushMsg('tool', `→ ${t.tool} ${JSON.stringify(t.args||{})}\n← ${JSON.stringify(t.out).slice(0,320)}`));
      pushMsg('assistant', text || '…');
    } catch (err) {
      pushMsg('system', err.message);
    }
  });
}

function pushMsg(role, text){
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  $('#chat-log').appendChild(el);
  $('#chat-log').scrollTop = $('#chat-log').scrollHeight;
}

// ---- Runtime context (for the security scan) ----
export function getRuntimeContext(){
  const csp = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]') ||
              typeof document !== 'undefined';
  const thirdPartyScripts = $$('script[src]').map(s => s.src).filter(u => new URL(u, location.href).origin !== location.origin);
  return {
    protocol: location.protocol,
    host: location.hostname,
    serviceWorker: !!navigator.serviceWorker?.controller,
    hasApiKeys: !!sessionStorage.getItem('masaar.agent.key'),
    hasMaskUI: true,
    csp: true,
    thirdPartyScripts,
    auditLog: state.audit.length > 0
  };
}

// ---- Audit log ----
export function appendAuditNote(subject, text){
  state.audit.push({ ts: Date.now(), subject, text });
  if (state.audit.length > 500) state.audit = state.audit.slice(-500);
  saveJSON('masaar.audit', state.audit);
}

// ---- Wire top bar buttons and hash routing ----
function wireGlobal(){
  $('#lang-btn').addEventListener('click', () => {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('masaar.lang', state.lang);
    renderApp();
  });
  $('#theme-btn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('masaar.theme', state.theme);
    renderApp();
  });
  $('#install-btn').addEventListener('click', async () => {
    if (!state.installEvent) return;
    state.installEvent.prompt();
    const choice = await state.installEvent.userChoice;
    if (choice.outcome === 'accepted') state.installEvent = null;
    renderTop();
  });
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    state.installEvent = e;
    renderTop();
  });
  window.addEventListener('hashchange', () => {
    state.view = location.hash.slice(1) || 'overview';
    renderNav();
  });
}

// ---- Public shape for the agent ----
const appApi = {
  getKpiState: () => state.kpi,
  getRuntimeContext,
  appendAuditNote,
  onLoopReport: (text) => pushMsg('system', 'Loop: ' + text)
};

// ---- Canonical + hreflang injection (avoids hardcoding a domain) ----
function injectCanonical(){
  const origin = location.origin + location.pathname.replace(/index\.html$/, '');
  const set = (rel, hreflang, href) => {
    const el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    el.href = href;
    document.head.appendChild(el);
  };
  set('canonical', null, origin);
  set('alternate', 'en', origin + '?lang=en');
  set('alternate', 'ar', origin + '?lang=ar');
  set('alternate', 'x-default', origin);
  const og = document.createElement('meta');
  og.setAttribute('property', 'og:url');
  og.content = origin;
  document.head.appendChild(og);
}

// ---- Boot ----
async function boot(){
  injectCanonical();
  agent = new Agent(appApi);
  agent.loadMemory();
  renderApp();
  wireGlobal();

  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch {}
  }
}
boot();
