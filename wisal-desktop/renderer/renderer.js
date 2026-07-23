'use strict';
// واجهة وصال لسطح المكتب. بتنادي العقل عبر window.wisal.invoke بس.

async function call(ch, payload) {
  const r = await window.wisal.invoke(ch, payload);
  if (!r || !r.ok) throw new Error((r && r.error) || 'خطأ');
  return r.data;
}
const $ = (s, r = document) => r.querySelector(s);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let S = {}; // settings
let META = { relations: [], dialects: [], intents: [] };
let PEOPLE = [];
let currentSuggestions = null; // {items, themes, slot}
let selIntent = null;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2600);
}
function relLabel(id) { const r = META.relations.find((x) => x.id === id); return r ? r.label : id; }
function relEmoji(id) { const r = META.relations.find((x) => x.id === id); return r ? r.emoji : '👤'; }
function currentRecipient() { return PEOPLE.find((p) => p.id === S.selectedRecipientId) || PEOPLE[0] || null; }
function whoName(p) { return p ? (p.name || relLabel(p.relation)) : ''; }

function daysUntil(mmdd) {
  const m = /^(\d{2})-(\d{2})$/.exec(mmdd || ''); if (!m) return null;
  const now = new Date(); const y = now.getFullYear();
  let next = new Date(y, +m[1] - 1, +m[2]);
  const t0 = new Date(y, now.getMonth(), now.getDate());
  if (next < t0) next = new Date(y + 1, +m[1] - 1, +m[2]);
  return Math.round((next - t0) / 86400000);
}

// ---------- التنقّل ----------
function show(view) {
  ['home', 'skills', 'tools', 'people', 'history', 'settings', 'onboard'].forEach((v) => {
    $('#view-' + v).classList.toggle('hidden', v !== view);
  });
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  if (view === 'home') renderHome();
  if (view === 'skills') renderSkills();
  if (view === 'tools') renderTools();
  if (view === 'people') renderPeople();
  if (view === 'history') renderHistory();
  if (view === 'settings') renderSettings();
  updateStatus();
}

// شريط حالة النظام (LLM / Brain / Memory).
async function updateStatus() {
  const bar = $('#statusbar'); if (!bar) return;
  let st = {};
  try { st = await call('stats:get'); } catch (e) { st = {}; }
  bar.innerHTML = '';
  const pill = (html) => bar.appendChild(el('<span class="pill">' + html + '</span>'));
  pill(`<span class="dot ${st.hasKey ? '' : 'off'}"></span> LLM: <b>${esc((st.model || '').replace('-versatile', '').replace('-instant', ''))}</b>`);
  pill(`🧠 Brain: <b>${st.people || 0}</b> شخص`);
  pill(`🗄️ Memory: <b>${st.styleExamples || 0}</b> أمثلة أسلوب`);
  pill(`⭐ <b>${st.favorites || 0}</b> مفضّلة`);
}

// 🧩 Skills — عرض المهارات (نيّات + تحرير).
function renderSkills() {
  const host = $('#view-skills'); host.innerHTML = '';
  host.appendChild(el('<h1>🧩 Skills — المهارات</h1><p class="sub">المهارات اللي الوكيل بيطبّقها على الرسالة. استخدمها من شاشة Agents.</p>'));
  host.appendChild(el('<h2>نيّات الرسالة</h2>'));
  const g1 = el('<div class="mod-grid"></div>'); host.appendChild(g1);
  META.intents.forEach((it) => {
    g1.appendChild(el(`<div class="mod"><div class="mod-top"><span class="mod-ico">${it.emoji}</span> ${esc(it.label)}</div><p>${esc(it.hint)}</p><span class="tag">Intent Skill</span></div>`));
  });
  host.appendChild(el('<h2>مهارات التحرير التكراري</h2>'));
  const g2 = el('<div class="mod-grid"></div>'); host.appendChild(g2);
  [['➕', 'أطول', 'يوسّع الرسالة ويدفّيها من غير حشو'], ['➖', 'أقصر', 'يكثّف في سطر أو اتنين'], ['💘', 'أرومانسي', 'يزوّد الحنية من غير مبالغة'], ['🌿', 'أبسط', 'كلمات يومية أوضح']].forEach(([e2, l, d]) => {
    g2.appendChild(el(`<div class="mod"><div class="mod-top"><span class="mod-ico">${e2}</span> ${l}</div><p>${d}</p><span class="tag">Refine Skill</span></div>`));
  });
}

// 🔧 Tools (MCP) — عرض الأدوات.
function renderTools() {
  const host = $('#view-tools'); host.innerHTML = '';
  host.appendChild(el('<h1>🔧 Tools — أدوات الوكيل</h1><p class="sub">الأدوات اللي الوكيل بينفّذ بيها، كلها بضغطة منك ومفيش إرسال تلقائي.</p>'));
  const g = el('<div class="mod-grid"></div>'); host.appendChild(g);
  const tools = [
    ['💬', 'WhatsApp', 'يفتح الشات والرسالة جاهزة، وانت تبعت', 'مفعّلة'],
    ['📋', 'Clipboard', 'نسخ الرسالة لأي مكان', 'مفعّلة'],
    ['🌐', 'Browser', 'يفتح روابط الإرسال في متصفحك', 'مفعّلة'],
    ['📇', 'Contacts', 'استيراد + بثّ مخصّص (على الموبايل)', 'موبايل'],
    ['📅', 'Calendar', 'مناسبة من أجندتك (على الموبايل)', 'موبايل'],
    ['🔔', 'Reminders', 'تذكير بالمواعيد (على الموبايل)', 'موبايل'],
  ];
  tools.forEach(([e2, n, d, s]) => {
    g.appendChild(el(`<div class="mod"><div class="mod-top"><span class="mod-ico">${e2}</span> ${n}</div><p>${d}</p><span class="tag">${s}</span></div>`));
  });
}

function applyTheme() { document.documentElement.setAttribute('data-theme', S.theme === 'dark' ? 'dark' : 'light'); }
function updateWhoBadge() {
  const r = currentRecipient();
  $('#whoBadge').textContent = r ? ('✍️ بتكتب لـ ' + whoName(r)) : 'ضيف شخص عشان تبدأ';
}

// ---------- الرئيسية ----------
function renderHome() {
  const host = $('#view-home'); host.innerHTML = '';
  const r = currentRecipient();
  host.appendChild(el(`<div class="banner"><h1>🤖 Composer Agent</h1><p>${r ? 'الوكيل بيقترحلك رسالة لـ' + esc(whoName(r)) + '، تعدّلها وتبعتها بضغطة' : 'ضيف شخص في Brain عشان الوكيل يبدأ'}</p></div>`));

  // منتقي الأشخاص
  if (PEOPLE.length) {
    const bar = el('<div class="card"><div class="muted" style="margin-bottom:8px">بتكتب لـ</div><div class="chips" id="peopleChips"></div></div>');
    host.appendChild(bar);
    PEOPLE.forEach((p) => {
      const c = el(`<button class="chip person ${p.id === (r && r.id) ? 'sel' : ''}">${relEmoji(p.relation)} ${esc(whoName(p))}</button>`);
      c.onclick = async () => { S = await call('settings:set', { selectedRecipientId: p.id }); currentSuggestions = null; updateWhoBadge(); renderHome(); };
      $('#peopleChips', bar).appendChild(c);
    });
  }

  // مناسبات جاية
  const up = [];
  PEOPLE.forEach((p) => (p.occasions || []).forEach((o) => { const d = daysUntil(o.date); if (d != null && d <= 45) up.push({ p, o, d }); }));
  up.sort((a, b) => a.d - b.d);
  if (up.length) {
    const box = el('<div class="card"><h2 style="margin-top:0">🎀 مناسبات جايّة</h2><div id="upList"></div></div>');
    host.appendChild(box);
    up.slice(0, 4).forEach((u) => {
      const when = u.d === 0 ? 'النهاردة' : u.d === 1 ? 'بكرة' : 'بعد ' + u.d + ' يوم';
      const line = el(`<div class="row" style="margin-bottom:6px"><span class="grow">${esc(u.o.label)} لـ${esc(whoName(u.p))} · ${when}</span></div>`);
      const w = el('<button class="chip">✍️ اكتب</button>'); w.onclick = async () => { S = await call('settings:set', { selectedRecipientId: u.p.id }); await doGenerate('occasion', u.o.label); };
      const g = el('<button class="chip">🎁 أفكار</button>'); g.onclick = async () => { S = await call('settings:set', { selectedRecipientId: u.p.id }); openGiftIdeas(u.o.label); };
      line.appendChild(w); line.appendChild(g);
      $('#upList', box).appendChild(line);
    });
  }

  // النيّة + السياق + التوليد
  const gen = el('<div class="card"></div>');
  gen.appendChild(el('<div class="muted" style="margin-bottom:6px">نيّة الرسالة (اختياري)</div>'));
  const ichips = el('<div class="chips" style="margin-bottom:12px"></div>');
  META.intents.forEach((it) => {
    const c = el(`<button class="chip ${selIntent === it.id ? 'sel' : ''}">${it.emoji} ${esc(it.label)}</button>`);
    c.onclick = () => { selIntent = selIntent === it.id ? null : it.id; renderHome(); };
    ichips.appendChild(c);
  });
  gen.appendChild(ichips);
  gen.appendChild(el('<label class="field"><span>إيه المناسبة أو اللي حصل؟ (اختياري)</span><textarea id="ctx"></textarea></label>'));
  const btns = el('<div class="row"></div>');
  const b1 = el(`<button class="btn">${selIntent ? '✨ اكتب الرسالة' : '✨ اقتراح فوري'}</button>`); b1.onclick = () => doGenerate('manual');
  const b2 = el('<button class="ghost">🌅 صباحي</button>'); b2.onclick = () => doGenerate('morning');
  const b3 = el('<button class="ghost">🌙 مسائي</button>'); b3.onclick = () => doGenerate('evening');
  btns.append(b1, b2, b3);
  gen.appendChild(btns);
  host.appendChild(gen);
  if ($('#ctx')) $('#ctx').value = renderHome._ctx || '';

  // الاقتراحات
  const out = el('<div id="sugOut"></div>');
  host.appendChild(out);
  if (currentSuggestions) renderSuggestions();
  updateWhoBadge();
}

async function doGenerate(slot, occasionLabel) {
  renderHome._ctx = $('#ctx') ? $('#ctx').value : '';
  const out = $('#sugOut'); if (out) out.innerHTML = '<div class="card"><span class="spin"></span> بكتب لك اقتراحين...</div>';
  try {
    const res = await call('generate', { slot, intentId: occasionLabel ? null : selIntent, context: renderHome._ctx });
    currentSuggestions = { items: res.items, themes: res.themes, slot };
    if (res.note) toast(res.note);
    renderSuggestions();
  } catch (e) { if (out) out.innerHTML = ''; toast('حصل خطأ: ' + e.message); }
}

function renderSuggestions() {
  const out = $('#sugOut'); if (!out) return; out.innerHTML = '';
  const r = currentRecipient();
  const isGroup = r && /^group/.test(r.relation);
  currentSuggestions.items.forEach((item, idx) => {
    const card = el(`<div class="suggestion"><span class="theme">${idx + 1}️⃣ ${esc(item.theme)}</span><div class="text">${esc(item.text)}</div></div>`);
    const refine = el('<div class="chips" style="margin-bottom:10px"></div>');
    [['longer', '➕ أطول'], ['shorter', '➖ أقصر'], ['romantic', '💘 أرومانسي'], ['simpler', '🌿 أبسط']].forEach(([sid, lbl]) => {
      const c = el(`<button class="chip">${lbl}</button>`);
      c.onclick = async () => {
        c.disabled = true;
        try { const nt = await call('refine', { text: item.text, styleId: sid }); item.text = nt; renderSuggestions(); }
        catch (e) { toast('التعديل مش متاح دلوقتي'); c.disabled = false; }
      };
      refine.appendChild(c);
    });
    card.appendChild(refine);
    const actions = el('<div class="row tight"></div>');
    const wa = el(`<button class="btn">${isGroup ? '📣 ابعت للجروب' : '📲 ابعت لـ' + esc(whoName(r))}</button>`);
    wa.onclick = () => sendWhatsApp(item.text, r, isGroup);
    const copy = el('<button class="ghost">📋 نسخ</button>'); copy.onclick = async () => { try { await navigator.clipboard.writeText(item.text); toast('اتنسخت ✅'); } catch (e) { toast('تعذّر النسخ ⚠️'); } };
    const pick = el('<button class="ghost">👍 اختار</button>');
    pick.onclick = async () => {
      await call('learn:choose', { text: item.text, theme: item.theme, recipientId: r ? r.id : '', slot: currentSuggestions.slot, themesShown: currentSuggestions.themes });
      toast('حفظت أسلوبك من الاختيار ده 👌');
    };
    actions.append(wa, copy, pick);
    card.appendChild(actions);
    out.appendChild(card);
  });
  // تعديل يدوي
  const edit = el('<div class="card"><label class="field"><span>عدّل بنفسك واحفظه لأسلوبك</span><textarea id="editBox"></textarea></label></div>');
  const save = el('<button class="btn">💾 احفظ نسختي المعدّلة</button>');
  save.onclick = async () => {
    const t = $('#editBox').value.trim(); if (!t) return;
    await call('learn:edit', { text: t, theme: currentSuggestions.themes[0], recipientId: r ? r.id : '', slot: currentSuggestions.slot, themesShown: currentSuggestions.themes });
    $('#editBox').value = ''; toast('سجّلت نسختك وضفتها لأسلوبي 🌟');
  };
  edit.appendChild(save);
  out.appendChild(edit);
}

function sendWhatsApp(text, r, isGroup) {
  const enc = encodeURIComponent(text);
  const num = r && r.number ? String(r.number).replace(/\D/g, '') : '';
  const url = (!isGroup && num) ? ('https://wa.me/' + num + '?text=' + enc) : ('https://wa.me/?text=' + enc);
  call('openExternal', { url });
}

async function openGiftIdeas(label) {
  $('#modalTitle').textContent = '🎁 أفكار لـ' + label;
  $('#modalBody').innerHTML = '<span class="spin"></span> بجهّزلك أفكار...';
  $('#modal').classList.remove('hidden');
  try {
    const txt = await call('giftIdeas', { occasionLabel: label });
    $('#modalBody').innerHTML = esc(txt) + '<div class="muted" style="margin-top:10px">دي أفكار وفئة تقريبية، مش أسعار حقيقية لحظية.</div>';
  } catch (e) { $('#modalBody').textContent = 'الأفكار مش متاحة دلوقتي (محتاج نت + مفتاح Groq).'; }
}

// ---------- الأشخاص ----------
let editingId = null;
function renderPeople() {
  const host = $('#view-people'); host.innerHTML = '';
  host.appendChild(el('<h1>🧠 Brain — العقل الثاني</h1><p class="sub">معرفة الوكيل عن كل شخص: العلاقة، النبرة، اللهجة، الملاحظات، المناسبات.</p>'));

  // فورمة
  const f = el('<div class="card"></div>');
  f.appendChild(el(`<h2 style="margin-top:0">${editingId ? 'تعديل شخص' : 'إضافة شخص'}</h2>`));
  f.appendChild(el('<label class="field"><span>الاسم أو الدلع</span><input type="text" id="pName"></label>'));
  f.appendChild(el('<div class="muted" style="margin-bottom:4px">العلاقة</div>'));
  const rchips = el('<div class="chips" style="margin-bottom:10px" id="relChips"></div>');
  f.appendChild(rchips);
  f.appendChild(el('<label class="field"><span>رقم واتساب (اختياري، دولي بأرقام)</span><input type="text" id="pNum"></label>'));
  f.appendChild(el('<label class="field"><span>حاجات عنه (بيحب إيه، ذكريات)</span><textarea id="pNotes"></textarea></label>'));
  f.appendChild(el('<label class="field"><span>مناسباته (سطر لكل واحدة: عيد ميلاد=08-24)</span><textarea id="pOcc"></textarea></label>'));
  f.appendChild(el('<div class="muted" style="margin-bottom:4px">اللهجة</div>'));
  const dchips = el('<div class="chips" style="margin-bottom:10px" id="dChips"></div>');
  f.appendChild(dchips);
  f.appendChild(el('<label class="field"><span>نبرة خاصة بيه (اختياري)</span><input type="text" id="pTone"></label>'));
  const actions = el('<div class="row"></div>');
  const saveBtn = el(`<button class="btn">${editingId ? '💾 حفظ التعديل' : '➕ إضافة'}</button>`);
  actions.appendChild(saveBtn);
  if (editingId) { const cancel = el('<button class="ghost">إلغاء</button>'); cancel.onclick = () => { editingId = null; formState = defForm(); renderPeople(); }; actions.appendChild(cancel); }
  f.appendChild(actions);
  host.appendChild(f);

  // شيبس العلاقة واللهجة
  META.relations.forEach((rel) => {
    const c = el(`<button class="chip ${formState.relation === rel.id ? 'sel' : ''}">${rel.emoji} ${esc(rel.label)}</button>`);
    c.onclick = () => { formState.relation = rel.id; syncForm(); renderRelChips(); };
    rchips.appendChild(c);
  });
  META.dialects.forEach((d) => {
    const c = el(`<button class="chip ${formState.dialect === d.id ? 'sel' : ''}">${esc(d.label)}</button>`);
    c.onclick = () => { formState.dialect = d.id; syncForm(); renderDialectChips(); };
    dchips.appendChild(c);
  });
  function renderRelChips() { Array.from(rchips.children).forEach((c, i) => c.classList.toggle('sel', META.relations[i].id === formState.relation)); }
  function renderDialectChips() { Array.from(dchips.children).forEach((c, i) => c.classList.toggle('sel', META.dialects[i].id === formState.dialect)); }

  // تعبئة الحقول
  $('#pName', f).value = formState.name; $('#pNum', f).value = formState.number;
  $('#pNotes', f).value = formState.notes; $('#pOcc', f).value = formState.occText; $('#pTone', f).value = formState.tone;
  syncFromInputs(f);

  saveBtn.onclick = async () => {
    syncFromInputs(f);
    if (!formState.name.trim()) { toast('اكتب الاسم الأول'); return; }
    const occs = parseOcc(formState.occText);
    const list = PEOPLE.slice();
    if (editingId) {
      const i = list.findIndex((x) => x.id === editingId);
      if (i >= 0) list[i] = Object.assign({}, list[i], { name: formState.name.trim(), relation: formState.relation, number: formState.number.trim(), notes: formState.notes.trim(), occasions: occs, tone: formState.tone.trim(), dialect: formState.dialect });
    } else {
      list.push({ id: 'p' + Date.now(), name: formState.name.trim(), relation: formState.relation, number: formState.number.trim(), notes: formState.notes.trim(), occasions: occs, tone: formState.tone.trim(), dialect: formState.dialect });
    }
    PEOPLE = await call('people:set', list);
    if (!S.selectedRecipientId && PEOPLE[0]) S = await call('settings:set', { selectedRecipientId: PEOPLE[0].id });
    editingId = null; formState = defForm(); updateWhoBadge(); renderPeople(); toast('اتحفظ ✅');
  };

  // القائمة
  host.appendChild(el('<h2>أشخاصك</h2>'));
  if (!PEOPLE.length) host.appendChild(el('<p class="muted">لسه مفيش حد. ضيف أول شخص فوق.</p>'));
  PEOPLE.forEach((p) => {
    const sel = p.id === S.selectedRecipientId;
    const item = el(`<div class="list-item"><div class="person-card"><div class="name">${sel ? '✅ ' : ''}${relEmoji(p.relation)} ${esc(whoName(p))} · ${esc(relLabel(p.relation))}</div><div class="row tight"></div></div></div>`);
    const acts = $('.row', item);
    const ch = el('<button class="ghost small">اختار</button>'); ch.onclick = async () => { S = await call('settings:set', { selectedRecipientId: p.id }); updateWhoBadge(); show('home'); };
    const ed = el('<button class="ghost small">تعديل</button>'); ed.onclick = () => { editingId = p.id; formState = { name: p.name || '', relation: p.relation, number: p.number || '', notes: p.notes || '', occText: (p.occasions || []).map((o) => o.label + '=' + o.date).join('\n'), tone: p.tone || '', dialect: p.dialect || 'egyptian' }; renderPeople(); };
    const del = el('<button class="ghost small">حذف</button>'); del.onclick = async () => { const list = PEOPLE.filter((x) => x.id !== p.id); PEOPLE = await call('people:set', list); if (S.selectedRecipientId === p.id) S = await call('settings:set', { selectedRecipientId: (PEOPLE[0] && PEOPLE[0].id) || '' }); updateWhoBadge(); renderPeople(); };
    acts.append(ch, ed, del);
    host.appendChild(item);
  });
}
function defForm() { return { name: '', relation: (META.relations[0] || {}).id || 'partner_wife', number: '', notes: '', occText: '', tone: '', dialect: 'egyptian' }; }
let formState = defForm();
function syncForm() {}
function syncFromInputs(f) { formState.name = $('#pName', f).value; formState.number = $('#pNum', f).value; formState.notes = $('#pNotes', f).value; formState.occText = $('#pOcc', f).value; formState.tone = $('#pTone', f).value; }
function parseOcc(text) {
  return String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.lastIndexOf('='); if (i <= 0) return null;
    const label = l.slice(0, i).trim(); const date = l.slice(i + 1).trim();
    return (label && /^\d{2}-\d{2}$/.test(date)) ? { label, date } : null;
  }).filter(Boolean);
}

// ---------- السجل ----------
async function renderHistory() {
  const host = $('#view-history'); host.innerHTML = '';
  host.appendChild(el('<h1>🗄️ Memory — سجل الرسائل</h1><p class="sub">ذاكرة الوكيل من اختياراتك: كل رسالة عدّلتها أو اخترتها.</p>'));
  const store = await call('store:get');
  const all = (store.feedback || []).filter((f) => f.finalText).reverse();
  const favs = new Set(store.favorites || []);
  const bar = el('<div class="card"><label class="field" style="margin:0"><input type="text" id="q" placeholder="دوّر في رسايلك"></label></div>');
  host.appendChild(bar);
  const listHost = el('<div id="histList"></div>'); host.appendChild(listHost);
  const draw = () => {
    const q = ($('#q').value || '').trim();
    listHost.innerHTML = '';
    const items = all.filter((f) => !q || f.finalText.includes(q));
    if (!items.length) { listHost.appendChild(el('<p class="muted">مفيش رسايل بالفلتر ده.</p>')); return; }
    items.forEach((f) => {
      const fav = favs.has(f.finalText);
      const who = (PEOPLE.find((p) => p.id === f.recipientId) || {}).name || '';
      const card = el(`<div class="list-item"><div class="muted">${esc(f.date)}${who ? ' · ' + esc(who) : ''}</div><div style="margin:6px 0">${esc(f.finalText)}</div><div class="row tight"></div></div>`);
      const acts = $('.row', card);
      const star = el(`<button class="ghost small">${fav ? '⭐' : '☆'}</button>`); star.onclick = async () => { const list = await call('favorite:toggle', { text: f.finalText }); favs.clear(); list.forEach((x) => favs.add(x)); draw(); };
      const cp = el('<button class="ghost small">📋</button>'); cp.onclick = async () => { try { await navigator.clipboard.writeText(f.finalText); toast('اتنسخت ✅'); } catch (e) { toast('تعذّر النسخ ⚠️'); } };
      const wa = el('<button class="ghost small">📲</button>'); wa.onclick = () => { const r = currentRecipient(); sendWhatsApp(f.finalText, r, false); };
      const del = el('<button class="ghost small">🗑️</button>'); del.onclick = async () => { await call('history:delete', { date: f.date, text: f.finalText }); const idx = all.indexOf(f); if (idx >= 0) all.splice(idx, 1); draw(); };
      acts.append(star, cp, wa, del);
      listHost.appendChild(card);
    });
  };
  $('#q', bar).oninput = draw;
  draw();
}

// ---------- الإعدادات ----------
function renderSettings() {
  const host = $('#view-settings'); host.innerHTML = '';
  host.appendChild(el('<h1>✨ LLM — المحرّك والإعدادات</h1><p class="sub">مفتاح Groq، الموديل، النبرة، والمظهر. المفتاح بيتخزّن على جهازك بس.</p>'));
  const c = el('<div class="card"></div>');
  c.appendChild(el(`<label class="field"><span>مفتاح Groq (console.groq.com/keys)</span><input type="password" id="sKey" value="${esc(S.groqKey)}"></label>`));
  c.appendChild(el(`<label class="field"><span>اسمك</span><input type="text" id="sName" value="${esc(S.myName)}"></label>`));
  c.appendChild(el('<div class="muted" style="margin-bottom:4px">الموديل</div>'));
  const models = [['llama-3.3-70b-versatile', 'لاما 3.3 (الأفضل للعربي)'], ['llama-3.1-8b-instant', 'لاما 3.1 (أسرع)']];
  const mchips = el('<div class="chips" style="margin-bottom:12px"></div>');
  models.forEach(([id, lbl]) => { const b = el(`<button class="chip ${S.model === id ? 'sel' : ''}">${lbl}</button>`); b.onclick = () => { S.model = id; renderSettings(); }; mchips.appendChild(b); });
  c.appendChild(mchips);
  c.appendChild(el('<div class="muted" style="margin-bottom:4px">طول الرسالة</div>'));
  const lchips = el('<div class="chips" style="margin-bottom:12px"></div>');
  [['short', 'قصيرة'], ['medium', 'متوسطة']].forEach(([id, lbl]) => { const b = el(`<button class="chip ${S.messageLength === id ? 'sel' : ''}">${lbl}</button>`); b.onclick = () => { S.messageLength = id; renderSettings(); }; lchips.appendChild(b); });
  c.appendChild(lchips);
  const toggles = el('<div class="row" style="margin-bottom:12px"></div>');
  const hEmo = el(`<button class="chip ${S.emoji ? 'sel' : ''}">😊 إيموجي</button>`); hEmo.onclick = () => { S.emoji = !S.emoji; renderSettings(); };
  const hHum = el(`<button class="chip ${S.humor ? 'sel' : ''}">😄 دُعابة خفيفة</button>`); hHum.onclick = () => { S.humor = !S.humor; renderSettings(); };
  toggles.append(hEmo, hHum);
  c.appendChild(toggles);
  c.appendChild(el('<div class="muted" style="margin-bottom:4px">المظهر</div>'));
  const tchips = el('<div class="chips" style="margin-bottom:12px"></div>');
  [['light', 'فاتح'], ['dark', 'غامق']].forEach(([id, lbl]) => { const b = el(`<button class="chip ${S.theme === id ? 'sel' : ''}">${lbl}</button>`); b.onclick = () => { S.theme = id; applyTheme(); renderSettings(); }; tchips.appendChild(b); });
  c.appendChild(tchips);
  const save = el('<button class="btn">💾 حفظ</button>');
  save.onclick = async () => { S = await call('settings:set', { groqKey: $('#sKey').value.trim(), myName: $('#sName').value.trim(), model: S.model, messageLength: S.messageLength, emoji: S.emoji, humor: S.humor, theme: S.theme }); applyTheme(); toast('اتحفظ ✅'); };
  c.appendChild(save);
  host.appendChild(c);
}

// ---------- Onboarding ----------
function renderOnboard() {
  const host = $('#view-onboard'); host.innerHTML = '';
  host.appendChild(el('<div class="banner"><h1>أهلاً بيك في وصال 💗</h1><p>مساعدك عشان تفضل قريّب من اللي بتحبهم.</p></div>'));
  const c = el('<div class="card"></div>');
  c.appendChild(el('<p class="sub">حط مفتاح Groq المجاني واسمك عشان نبدأ. كله بيتخزّن على جهازك بس.</p>'));
  c.appendChild(el(`<label class="field"><span>مفتاح Groq (console.groq.com/keys)</span><input type="password" id="oKey"></label>`));
  c.appendChild(el(`<label class="field"><span>اسمك</span><input type="text" id="oName"></label>`));
  const b = el('<button class="btn block">يلا نبدأ ✨</button>');
  b.onclick = async () => { S = await call('settings:set', { groqKey: $('#oKey').value.trim(), myName: $('#oName').value.trim(), onboarded: true }); $('#view-onboard').classList.add('hidden'); show('people'); };
  c.appendChild(b);
  host.appendChild(c);
  ['home', 'skills', 'tools', 'people', 'history', 'settings'].forEach((v) => $('#view-' + v).classList.add('hidden'));
  $('#view-onboard').classList.remove('hidden');
}

// ---------- تشغيل ----------
async function boot() {
  S = await call('settings:get');
  META = await call('meta:get');
  PEOPLE = await call('people:get');
  formState = defForm();
  applyTheme();
  updateWhoBadge();
  document.querySelectorAll('.nav-item').forEach((b) => (b.onclick = () => show(b.dataset.view)));
  $('#themeBtn').onclick = async () => { S = await call('settings:set', { theme: S.theme === 'dark' ? 'light' : 'dark' }); applyTheme(); };
  $('#modalClose').onclick = () => $('#modal').classList.add('hidden');
  updateStatus();
  if (!S.onboarded) renderOnboard(); else show('home');
}
boot();
