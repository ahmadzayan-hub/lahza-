// عقل وصال لسطح المكتب (Node/Electron main process).
// كله محلي: الإعدادات والأشخاص والتعلّم في ملفات JSON داخل مجلد بيانات المستخدم.
// المزوّد الوحيد الخارجي هو Groq وقت التوليد بس.
'use strict';
const fs = require('fs');
const path = require('path');

// safeStorage متاح في عملية main بتاعة Electron بس؛ برّاها بنشتغل من غيره.
let safeStorage = null;
try { safeStorage = require('electron').safeStorage; } catch (e) { safeStorage = null; }
function canEncrypt() { return !!(safeStorage && safeStorage.isEncryptionAvailable()); }

let DATA_DIR = '.';
function init(dir) {
  DATA_DIR = dir;
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) { /* ignore */ }
}

function fileFor(name) { return path.join(DATA_DIR, name); }
function readJson(name, def) {
  const file = fileFor(name);
  if (!fs.existsSync(file)) return def;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    // ملف تالف ≠ نمسح تعلّم المستخدم بصمت: بنحجره جنباً ونبدأ نظيف.
    try { fs.renameSync(file, `${file}.corrupt-${Date.now()}`); } catch (e2) { /* ignore */ }
    return def;
  }
}
function writeJson(name, obj) {
  // كتابة ذرّية + رمي الخطأ عشان الواجهة تعرف إن الحفظ فشل بدل ✅ كاذبة.
  const file = fileFor(name);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, file);
}

// ---------- الإعدادات ----------
const DEFAULT_SETTINGS = {
  groqKey: '', myName: '', model: 'llama-3.3-70b-versatile',
  humor: false, emoji: true, messageLength: 'short',
  theme: 'light', selectedRecipientId: '', onboarded: false,
};
function getSettings() {
  const s = Object.assign({}, DEFAULT_SETTINGS, readJson('settings.json', {}));
  if (s.groqKeyEnc && canEncrypt()) {
    try { s.groqKey = safeStorage.decryptString(Buffer.from(s.groqKeyEnc, 'base64')); }
    catch (e) { s.groqKey = ''; }
  }
  return s;
}
function setSettings(patch) {
  const s = Object.assign(getSettings(), patch || {});
  const persisted = Object.assign({}, s);
  if (persisted.groqKey && canEncrypt()) {
    // المفتاح يتخزّن مشفّر عبر مخزن مفاتيح النظام؛ النص الصريح ولا يتكتب.
    persisted.groqKeyEnc = safeStorage.encryptString(persisted.groqKey).toString('base64');
    persisted.groqKey = '';
  }
  writeJson('settings.json', persisted);
  return s;
}

// ---------- الأشخاص ----------
function getPeople() { return readJson('people.json', []); }
function setPeople(list) { writeJson('people.json', Array.isArray(list) ? list : []); return getPeople(); }
function currentRecipient() {
  const s = getSettings(); const p = getPeople();
  return p.find((x) => x.id === s.selectedRecipientId) || p[0] || null;
}

// ---------- العلاقات ----------
const RELATIONS = [
  { id: 'partner_wife', label: 'زوجتي', toAddr: 'لمراتي', tone: 'حب رومانسي دافئ وصادق، حنية وشوق من غير مبالغة', emoji: '💗' },
  { id: 'partner_husband', label: 'زوجي', toAddr: 'لجوزي', tone: 'حب رومانسي دافئ وصادق، حنية وشوق من غير مبالغة', emoji: '💗' },
  { id: 'son', label: 'ابني', toAddr: 'لابني', tone: 'حنان وفخر وتشجيع وأمان', emoji: '👦' },
  { id: 'daughter', label: 'بنتي', toAddr: 'لبنتي', tone: 'حنان وفخر ولطف وحماية دافئة', emoji: '👧' },
  { id: 'mother', label: 'أمي', toAddr: 'لأمي', tone: 'احترام وحب عميق وامتنان وحنية', emoji: '👩' },
  { id: 'father', label: 'أبويا', toAddr: 'لأبويا', tone: 'احترام وحب وتقدير وامتنان', emoji: '👨' },
  { id: 'brother', label: 'أخويا', toAddr: 'لأخويا', tone: 'ود وسند وأخوّة وروح مرحة خفيفة', emoji: '🧑' },
  { id: 'sister', label: 'أختي', toAddr: 'لأختي', tone: 'ود وسند وحنية وأخوّة', emoji: '👩‍🦰' },
  { id: 'group_family', label: 'العيلة', toAddr: 'للعيلة', tone: 'دفء أسري جامع', emoji: '👨‍👩‍👧‍👦' },
  { id: 'group_friends', label: 'الأصحاب', toAddr: 'للأصحاب', tone: 'ود وروح مرحة وصداقة حلوة', emoji: '🧑‍🤝‍🧑' },
];
function relationById(id) { return RELATIONS.find((r) => r.id === id) || RELATIONS[0]; }

const DIALECTS = [
  { id: 'egyptian', label: 'مصري' }, { id: 'gulf', label: 'خليجي' },
  { id: 'levantine', label: 'شامي' }, { id: 'msa', label: 'فصحى' },
];
function dialectPhrase(id) {
  if (id === 'gulf') return 'اللهجة الخليجية';
  if (id === 'levantine') return 'اللهجة الشامية';
  if (id === 'msa') return 'العربية الفصحى البسيطة';
  return 'اللهجة المصرية العامية';
}

// ---------- النيّات ----------
const INTENTS = [
  { id: 'apology', label: 'اعتذار', emoji: '🕊️', hint: 'رسالة اعتذار صادقة بتصالح وتكسر الزعل من غير تبرير زيادة.' },
  { id: 'congrats', label: 'تهنئة', emoji: '🎉', hint: 'تهنئة فرحانة بمناسبة سعيدة.' },
  { id: 'comfort', label: 'مواساة', emoji: '🤍', hint: 'مواساة وتخفيف في وقت صعب، حضور وسند.' },
  { id: 'thanks', label: 'شكر', emoji: '🙏', hint: 'شكر وامتنان على حاجة عملها.' },
  { id: 'longing', label: 'اشتياق', emoji: '💭', hint: 'اشتياق ولهفة ودفء، إنه وحشك.' },
  { id: 'reassure', label: 'طمأنة', emoji: '🫂', hint: 'طمأنة وتهدئة قلق، إنك جنبه.' },
  { id: 'support', label: 'دعم', emoji: '💪', hint: 'تشجيع ودعم وثقة في قدراته.' },
  { id: 'dua', label: 'دعاء', emoji: '🤲', hint: 'دعاء من القلب بالخير والصحة.' },
];
function intentById(id) { return INTENTS.find((i) => i.id === id) || null; }

const THEMES = ['امتنان', 'اشتياق', 'تمني يوم جميل', 'تقدير', 'دعم', 'دعاء', 'كلمة من القلب'];

// ---------- المخزن والتعلّم ----------
function getStore() {
  return readJson('store.json', { styleExamples: [], themeWeights: {}, feedback: [], favorites: [], lastContacted: {} });
}
function saveStore(s) { writeJson('store.json', s); }

function styleExamplesFor(recipientId) {
  return getStore().styleExamples.filter((e) => e.recipientId === recipientId).slice(-30);
}
function addStyleExample(text, theme, recipientId) {
  const s = getStore();
  s.styleExamples.push({ text: (text || '').trim(), theme: theme || null, recipientId: recipientId || '' });
  // سقف 30 لكل شخص
  let count = s.styleExamples.filter((e) => e.recipientId === recipientId).length;
  while (count > 30) {
    const idx = s.styleExamples.findIndex((e) => e.recipientId === recipientId);
    if (idx >= 0) { s.styleExamples.splice(idx, 1); count--; } else break;
  }
  saveStore(s);
}
function addFeedback(fb) {
  const s = getStore();
  s.feedback.push(fb);
  if (s.feedback.length > 500) s.feedback = s.feedback.slice(-500); // سقف للتاريخ
  saveStore(s);
}
function bumpTheme(theme, delta) {
  if (!theme) return; const s = getStore();
  let n = (s.themeWeights[theme] || 1) + delta;
  s.themeWeights[theme] = Math.max(0.2, Math.min(5, n)); saveStore(s);
}
function toggleFavorite(text) {
  const s = getStore(); const i = s.favorites.indexOf(text);
  if (i >= 0) s.favorites.splice(i, 1); else s.favorites.push(text);
  saveStore(s); return s.favorites;
}
function deleteHistory(date, text) {
  const s = getStore();
  s.feedback = s.feedback.filter((f) => !(f.date === date && f.finalText === text));
  saveStore(s);
}
function markContacted(recipientId) {
  if (!recipientId) return; const s = getStore();
  s.lastContacted[recipientId] = new Date().toISOString().slice(0, 10); saveStore(s);
}

// ---------- Groq ----------
async function groqComplete(messages, temperature) {
  const s = getSettings();
  if (!s.groqKey) throw new Error('no-key');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  let res;
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + s.groqKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: s.model, temperature: temperature || 0.8, max_tokens: 400, messages }),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error('groq-' + res.status);
  const j = await res.json();
  const c = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!c) throw new Error('empty');
  return String(c).trim();
}

// ---------- بناء البرومبت ----------
function buildSystem(recipient, intent) {
  const rel = relationById(recipient ? recipient.relation : 'partner_wife');
  const s = getSettings();
  const tone = (recipient && recipient.tone) ? recipient.tone : rel.tone;
  const dialect = dialectPhrase(recipient ? recipient.dialect : 'egyptian');
  const lines = [
    'انت بتساعد شخص يكتب رسالة قصيرة ' + rel.toAddr + ' (' + rel.label + ') بـ' + dialect + '.',
    'النبرة المناسبة: ' + tone + '.',
    'اكتب كإنسان حقيقي بمشاعر صادقة ودفء - مش كلام آلة.',
    s.messageLength === 'medium' ? '- الرسالة من سطرين لـ 3 أسطر.' : '- الرسالة قصيرة: سطر أو سطرين بحد أقصى.',
    '- ' + dialect + ' طبيعية، كأنه هو اللي كتبها.',
    '- صدق وبساطة من غير مبالغة ولا كلام مصنوع.',
    s.emoji ? '- استخدم إيموجي أو اتنين معبّرين بذوق.' : '- من غير إيموجي خالص.',
  ];
  if (s.humor) lines.push('- لمسة خفيفة من الدُعابة اللطيفة.');
  if (intent) lines.push('نوع الرسالة المطلوب: ' + intent.label + '. ' + intent.hint);
  return lines.join('\n');
}

function buildUser(recipient, themes, intent, context) {
  const s = getSettings();
  const parts = [];
  const examples = styleExamplesFor(recipient ? recipient.id : '');
  if (examples.length) {
    parts.push('دي أمثلة من أسلوبي، قلّد روحها من غير نسخ حرفي:');
    parts.push(examples.map((e, i) => (i + 1) + ') ' + e.text).join('\n'));
  } else {
    parts.push('لسه مفيش أمثلة، اكتب بنبرة دافئة بسيطة.');
  }
  if (s.myName) parts.push('\nاسم اللي بيبعت: ' + s.myName + '.');
  if (recipient && recipient.name) parts.push('اسم اللي بيتبعتله: ' + recipient.name + ' - نادِه باسمه.');
  if (recipient && recipient.notes) parts.push('حاجات عنه: ' + recipient.notes + '.');
  if (context && context.trim()) parts.push('\nسياق مهم عن الموقف (خلّي الرسالة تتكلم عنه طبيعي): ' + context.trim());
  const themeLine = intent
    ? 'الاتنين عن: ' + intent.label + '، كل واحدة بزاوية مختلفة.'
    : 'الاقتراح الأول موضوعه: ' + themes[0] + '. الاقتراح التاني موضوعه: ' + themes[1] + '.';
  parts.push('\nاكتب اقتراحين مختلفين تماماً، وكإنهم من قلبه.', themeLine, '',
    'رجّع بالظبط بالصيغة دي ومن غير أي كلام زيادة:', '١- <الاقتراح الأول>', '٢- <الاقتراح التاني>');
  return parts.join('\n');
}

function pickThemes() {
  const w = getStore().themeWeights || {};
  const pool = THEMES.slice();
  const out = [];
  for (let k = 0; k < 2 && pool.length; k++) {
    const total = pool.reduce((a, t) => a + (w[t] || 1), 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) { r -= (w[pool[i]] || 1); if (r <= 0) { idx = i; break; } }
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function parseTwo(raw, themes) {
  const lines = String(raw).split('\n').map((l) => l.trim()).filter(Boolean);
  const re = /^[١٢12]\s*[-.)]\s*(.+)$/;
  const nums = lines.map((l) => { const m = l.match(re); return m ? m[1].trim() : null; }).filter(Boolean);
  let a, b;
  if (nums.length >= 2) { a = nums[0]; b = nums[1]; }
  else if (nums.length === 1) {
    // سطر مرقّم واحد + تمهيد: الاقتراح هو المرقّم، مش التمهيد.
    a = nums[0];
    const clean = lines.map((l) => l.replace(/^[١٢12]\s*[-.)]\s*/, '').trim())
      .filter((l) => l && l !== a);
    b = clean[clean.length - 1] || null;
  } else {
    const clean = lines.map((l) => l.replace(/^[١٢12]\s*[-.)]\s*/, '').trim()).filter(Boolean);
    a = clean[0] || String(raw).trim(); b = clean[1] || null;
  }
  const items = [{ text: a, theme: themes[0] || '' }];
  if (b && b !== a) items.push({ text: b, theme: themes[1] || themes[0] || '' });
  return items;
}

// بنك احتياطي لو مفيش نت/مفتاح
function fallbackTwo(recipient, intent) {
  const name = recipient && recipient.name ? recipient.name : '';
  const base = intent ? [
    'آسف بجد لو زعّلتك، إنت أغلى من أي خناقة 🕊️',
    'مبروك من قلبي، تستاهل كل خير 🎉',
  ] : [
    'وجودك في حياتي نعمة، بحبك وبشكر ربنا عليك كل يوم ❤️',
    'فاكرك دايماً وقلبي معاك، ربنا يخليك ليا 💗',
  ];
  const theme = intent ? intent.label : 'كلمة من القلب';
  return base.slice(0, 2).map((t) => ({ text: name ? ('يا ' + name + '، ' + t) : t, theme }));
}

async function generate(opts) {
  const recipient = currentRecipient();
  const intent = intentById(opts && opts.intentId);
  const themes = intent ? [intent.label, intent.label] : pickThemes();
  try {
    const raw = await groqComplete([
      { role: 'system', content: buildSystem(recipient, intent) },
      { role: 'user', content: buildUser(recipient, themes, intent, (opts && opts.context) || '') },
    ]);
    return { items: parseTwo(raw, themes), themes, offline: false, note: null };
  } catch (e) {
    const hasKey = !!getSettings().groqKey;
    const msg = String(e && e.message || '');
    let note;
    if (!hasKey) note = 'ضيف مفتاح Groq من الإعدادات عشان اقتراحات أذكى ✨';
    else if (msg === 'groq-401' || msg === 'groq-403') note = 'مفتاح Groq غير صالح 🔑 راجع الإعدادات.';
    else if (msg === 'groq-429') note = 'وصلنا حد الاستخدام مؤقتاً ⏳ جرّب بعد دقيقة.';
    else note = 'النت مش متاح 📴 دي رسائل جاهزة تقدر تعدّلها.';
    return { items: fallbackTwo(recipient, intent), themes, offline: true, note };
  }
}

async function refine(text, styleId) {
  const recipient = currentRecipient();
  const rel = relationById(recipient ? recipient.relation : 'partner_wife');
  const hint = ({
    longer: 'أطول شوية وأدفى من غير حشو', shorter: 'أقصر وأكثف',
    romantic: 'أرومانسي وأحنّ', simpler: 'أبسط وأوضح بكلمات يومية',
  })[styleId] || 'أحلى وأصدق';
  const sys = 'انت بتعيد صياغة رسالة قصيرة باللهجة المصرية، حافظ على المعنى والصدق، ورجّع النص بس.';
  const user = 'أعد صياغة الرسالة دي بحيث تبقى ' + hint + ' (نبرة تناسب ' + rel.label + '):\n\n' + text;
  return groqComplete([{ role: 'system', content: sys }, { role: 'user', content: user }], 0.7);
}

async function giftIdeas(occasionLabel) {
  const r = currentRecipient();
  const rel = relationById(r ? r.relation : 'partner_wife');
  const who = r && r.name ? r.name : rel.label;
  const sys = 'انت مستشار لطيف بتقترح أفكار عملية لمناسبة. اكتب مصري بسيط. ماتخترعش أسعار حقيقية، اكتب أفكار وفئة سعرية تقريبية (رخيّص/متوسط) بس.';
  const user = ['المناسبة: ' + occasionLabel, 'الشخص: ' + who + ' (' + rel.label + ').',
    r && r.notes ? 'حاجات عنه: ' + r.notes : '', '',
    'اقترح 3 أو 4 أفكار (هدية/كارت/ورد/لفتة) تناسب شخصيته، كل فكرة في سطر بإيموجي ومعاها فئة سعرية تقريبية بين قوسين.'].join('\n');
  return groqComplete([{ role: 'system', content: sys }, { role: 'user', content: user }], 0.8);
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

// ملخّص حالة للنظام (شريط الحالة + تبويبات Memory/Brain).
function stats() {
  const s = getSettings(); const st = getStore(); const p = getPeople();
  return {
    model: s.model,
    people: p.length,
    styleExamples: (st.styleExamples || []).length,
    feedback: (st.feedback || []).length,
    favorites: (st.favorites || []).length,
    hasKey: !!s.groqKey,
  };
}

module.exports = {
  init, getSettings, setSettings, getPeople, setPeople, currentRecipient,
  RELATIONS, DIALECTS, INTENTS, relationById,
  getStore, addStyleExample, addFeedback, bumpTheme, toggleFavorite, deleteHistory, markContacted,
  generate, refine, giftIdeas, todayISO, stats,
};
