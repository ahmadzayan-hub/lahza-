// Masaar operations assistant.
// Bring-your-own key: Groq, Gemini, OpenAI, Anthropic, OpenRouter.
// Tools operate on the loaded data; state changes always ask the user.

import { KPIS, PROJECTS, RISKS, THREATS, CONTROLS, detectGaps } from './data.js';

const PROVIDERS = {
  groq: {
    label:'Groq (free, fast)',
    endpoint:'https://api.groq.com/openai/v1/chat/completions',
    defaultModel:'llama-3.3-70b-versatile',
    models:['llama-3.3-70b-versatile','llama-3.1-8b-instant','mixtral-8x7b-32768'],
    style:'openai'
  },
  openai: {
    label:'OpenAI',
    endpoint:'https://api.openai.com/v1/chat/completions',
    defaultModel:'gpt-4o-mini',
    models:['gpt-4o-mini','gpt-4o','gpt-4.1-mini'],
    style:'openai'
  },
  anthropic: {
    label:'Anthropic',
    endpoint:'https://api.anthropic.com/v1/messages',
    defaultModel:'claude-3-5-haiku-latest',
    models:['claude-3-5-haiku-latest','claude-3-5-sonnet-latest'],
    style:'anthropic'
  },
  gemini: {
    label:'Google Gemini (free tier)',
    endpoint:'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel:'gemini-1.5-flash',
    models:['gemini-1.5-flash','gemini-1.5-pro'],
    style:'gemini'
  },
  openrouter: {
    label:'OpenRouter',
    endpoint:'https://openrouter.ai/api/v1/chat/completions',
    defaultModel:'meta-llama/llama-3.3-70b-instruct:free',
    models:['meta-llama/llama-3.3-70b-instruct:free','mistralai/mistral-7b-instruct:free'],
    style:'openai'
  }
};

const SYSTEM_PROMPT = `You are the Masaar operations assistant. You read the rail maintenance operational plan, watch its KPIs, its projects, its risks, and its security posture. You answer briefly, in the user's language, without filler.

Rules:
- Never invent operational figures. If a value is missing, say so.
- Every state change must be proposed as a call to a tool. The user confirms.
- Prefer one clear next step over a long list.
- If asked in Arabic, answer in Arabic. If in English, answer in English.
- If the user's question mixes both, follow the last sentence.
- If a tool result is empty or unclear, say what would fix it.

Tools available:
- get_kpis(): return all KPI definitions and their current values.
- get_projects({priority?, status?}): return the project list, optionally filtered.
- get_risks({rating?}): return the risk register, optionally filtered.
- get_security(): return the threat model, controls, and live gaps.
- propose_kpi_update({id, value}): propose a new KPI value; user must confirm.
- add_note({subject, text}): append a note to the audit log.
- health_scan(): run the same live scan the Security tab runs.`;

export class Agent {
  constructor(app){
    this.app = app;
    this.provider = localStorage.getItem('masaar.agent.provider') || 'groq';
    this.model = localStorage.getItem('masaar.agent.model') || PROVIDERS[this.provider].defaultModel;
    this.key = sessionStorage.getItem('masaar.agent.key') || '';
    this.history = [];
    this.loopTimer = null;
    this.loopMinutes = 15;
    this.busy = false;
    this.pending = null;
  }

  hasKey(){ return !!this.key }
  maskedKey(){ if(!this.key) return ''; return '••••••' + this.key.slice(-4); }
  providerLabel(){ return PROVIDERS[this.provider].label; }
  providerList(){ return Object.entries(PROVIDERS).map(([id, p]) => ({id, label:p.label})); }
  modelList(){ return PROVIDERS[this.provider].models; }

  setProvider(p){
    if (!PROVIDERS[p]) return;
    this.provider = p;
    this.model = PROVIDERS[p].defaultModel;
    localStorage.setItem('masaar.agent.provider', p);
    localStorage.setItem('masaar.agent.model', this.model);
  }
  setModel(m){ this.model = m; localStorage.setItem('masaar.agent.model', m); }
  setKey(k){ this.key = k.trim(); if (this.key) sessionStorage.setItem('masaar.agent.key', this.key); else sessionStorage.removeItem('masaar.agent.key'); }
  clearMemory(){ this.history = []; localStorage.removeItem('masaar.agent.mem'); }

  loadMemory(){
    try {
      const raw = localStorage.getItem('masaar.agent.mem');
      if (raw) this.history = JSON.parse(raw).slice(-40);
    } catch { this.history = []; }
  }
  saveMemory(){
    try { localStorage.setItem('masaar.agent.mem', JSON.stringify(this.history.slice(-40))); } catch {}
  }

  // --------------- Tools ---------------
  runTool(name, args){
    const kpis = this.app.getKpiState();
    switch (name) {
      case 'get_kpis':
        return KPIS.map(k => ({
          id: k.id, name: k.name_en, target: k.target_en, impact: k.impact,
          value: kpis[k.id]?.value ?? null,
          updated: kpis[k.id]?.updated ?? null
        }));
      case 'get_projects': {
        let list = PROJECTS;
        if (args?.priority) list = list.filter(p => p.priority === args.priority);
        if (args?.status)   list = list.filter(p => p.status === args.status);
        return list.map(p => ({
          name:p.name_en, category:p.cat_en, priority:p.priority, status:p.status,
          estimated:p.est, approved2026:p.b26, action:p.action_en
        }));
      }
      case 'get_risks': {
        let list = RISKS;
        if (args?.rating) list = list.filter(r => r.rating === args.rating);
        return list.map(r => ({ risk:r.risk_en, likelihood:r.like, impact:r.impact, rating:r.rating, mitigation:r.mit_en }));
      }
      case 'get_security': {
        const runtime = this.app.getRuntimeContext();
        return { threats: THREATS, controls: CONTROLS, gaps: detectGaps(runtime) };
      }
      case 'health_scan': {
        return detectGaps(this.app.getRuntimeContext());
      }
      case 'propose_kpi_update': {
        this.pending = { type:'kpi_update', id: args?.id, value: args?.value };
        return { pending:'The user must confirm this change in the KPI view.' };
      }
      case 'add_note': {
        this.app.appendAuditNote(args?.subject || 'note', args?.text || '');
        return { logged: true };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  // --------------- LLM call ---------------
  async ask(userText){
    if (!this.key) throw new Error('No provider key set.');
    if (this.busy) return;
    this.busy = true;
    try {
      this.history.push({ role:'user', content:userText });
      const context = this.buildContext();
      const messages = [
        { role:'system', content: SYSTEM_PROMPT + '\n\nLIVE CONTEXT:\n' + context },
        ...this.history
      ];
      const reply = await this.callProvider(messages);
      const { text, toolCalls } = this.parseReply(reply);
      const toolOutputs = [];
      for (const call of toolCalls) {
        const out = this.runTool(call.name, call.args);
        toolOutputs.push({ tool: call.name, args: call.args, out });
      }
      const finalText = text || (toolOutputs.length ? 'Ran ' + toolOutputs.map(t => t.tool).join(', ') + '.' : '');
      this.history.push({ role:'assistant', content: finalText });
      this.saveMemory();
      return { text: finalText, tools: toolOutputs };
    } finally {
      this.busy = false;
    }
  }

  buildContext(){
    const kpis = this.app.getKpiState();
    const filled = Object.entries(kpis).filter(([,v]) => v?.value != null);
    const lines = [];
    lines.push(`kpis_filled: ${filled.length} / ${KPIS.length}`);
    filled.slice(0,5).forEach(([id,v]) => lines.push(`  ${id}=${v.value}`));
    lines.push(`red_risks: ${RISKS.filter(r=>r.rating==='red').length}`);
    lines.push(`critical_projects: ${PROJECTS.filter(p=>p.priority==='critical').length}`);
    lines.push(`open_gaps: ${detectGaps(this.app.getRuntimeContext()).length}`);
    return lines.join('\n');
  }

  async callProvider(messages){
    const p = PROVIDERS[this.provider];
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 45000);
    try {
      if (p.style === 'openai') {
        const res = await fetch(p.endpoint, {
          method:'POST',
          signal: controller.signal,
          headers:{ 'content-type':'application/json', 'authorization': 'Bearer ' + this.key },
          body: JSON.stringify({ model:this.model, messages, temperature:0.3, max_tokens:800 })
        });
        if (!res.ok) throw new Error(await this.readError(res));
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      }
      if (p.style === 'anthropic') {
        const sys = messages.find(m => m.role==='system')?.content || '';
        const rest = messages.filter(m => m.role !== 'system');
        const res = await fetch(p.endpoint, {
          method:'POST',
          signal: controller.signal,
          headers:{
            'content-type':'application/json',
            'x-api-key': this.key,
            'anthropic-version':'2023-06-01',
            'anthropic-dangerous-direct-browser-access':'true'
          },
          body: JSON.stringify({ model:this.model, system:sys, messages:rest, max_tokens:800 })
        });
        if (!res.ok) throw new Error(await this.readError(res));
        const data = await res.json();
        return (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n');
      }
      if (p.style === 'gemini') {
        const url = `${p.endpoint}/${this.model}:generateContent?key=${encodeURIComponent(this.key)}`;
        const sys = messages.find(m=>m.role==='system')?.content || '';
        const contents = messages.filter(m=>m.role!=='system').map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
        const res = await fetch(url, {
          method:'POST',
          signal: controller.signal,
          headers:{ 'content-type':'application/json' },
          body: JSON.stringify({ systemInstruction:{ parts:[{ text:sys }] }, contents, generationConfig:{ temperature:0.3, maxOutputTokens:800 } })
        });
        if (!res.ok) throw new Error(await this.readError(res));
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } finally {
      clearTimeout(t);
    }
    return '';
  }

  async readError(res){
    try { const t = await res.text(); return `HTTP ${res.status}: ${t.slice(0,240)}`; }
    catch { return `HTTP ${res.status}`; }
  }

  // Parse tool calls in the form: <tool name="..." args="{...}"/>
  parseReply(reply){
    const toolCalls = [];
    const re = /<tool\s+name="([a-z_]+)"(?:\s+args='([^']*)')?\s*\/?>/gi;
    let match;
    let text = reply;
    while ((match = re.exec(reply)) !== null) {
      let args = {};
      if (match[2]) { try { args = JSON.parse(match[2]); } catch {} }
      toolCalls.push({ name: match[1], args });
      text = text.replace(match[0], '');
    }
    return { text: text.trim(), toolCalls };
  }

  // --------------- Loop mode ---------------
  startLoop(minutes){
    this.stopLoop();
    this.loopMinutes = Math.max(3, parseInt(minutes,10) || 15);
    const tick = async () => {
      if (!this.key) return;
      const prompt = 'Run a short status pass. Report only what changed since the last check, using at most three lines.';
      try {
        const { text } = await this.ask(prompt);
        this.app.onLoopReport?.(text);
      } catch (e) {
        this.app.onLoopReport?.('Loop error: ' + e.message);
      }
    };
    tick();
    this.loopTimer = setInterval(tick, this.loopMinutes * 60_000);
    return this.loopMinutes;
  }
  stopLoop(){ if (this.loopTimer) { clearInterval(this.loopTimer); this.loopTimer = null; } }
  isLooping(){ return !!this.loopTimer; }
}

export { PROVIDERS };
