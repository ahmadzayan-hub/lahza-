// =====================================================================
// store.js — المخزن المحلي (ملف JSON واحد).
// بيحتفظ بـ:
//   - feedback[]:        سجل كل تفاعل (تاريخ، خانة، مواضيع، اختيار، نص نهائي)
//   - styleExamples[]:   آخر ≤30 رسالة انت اخترتها/عدّلتها = "ملف الأسلوب"
//   - themeWeights{}:    أوزان المواضيع للترجيح (المختار يزيد، المتجاهَل يقل)
//   - lastSentPerSlot{}: آخر يوم اتبعت فيه كل خانة (عشان ما نكررش في نفس اليوم)
//
// كله ملف بسيط، سهل تراجعه وتاخد منه نسخة احتياطية بإيدك.
// =====================================================================

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { todayISO, daysAgoISO } = require('./util');

// مسار المخزن. افتراضياً data/store.json جنب المشروع، ويمكن تغييره عبر
// متغيّر البيئة WIFE_ASSISTANT_STORE_FILE (بنستخدمه في الاختبارات عشان ما
// نلمسش بياناتك الحقيقية).
const STORE_PATH = process.env.WIFE_ASSISTANT_STORE_FILE
  ? path.resolve(process.env.WIFE_ASSISTANT_STORE_FILE)
  : path.join(__dirname, 'data', 'store.json');
const DATA_DIR = path.dirname(STORE_PATH);

// الشكل الافتراضي لأول تشغيل.
function defaultStore() {
  const themeWeights = {};
  for (const t of config.themes) themeWeights[t] = 1; // وزن مبدئي متساوي
  return {
    feedback: [], // [{ id, date, slot, themesShown, choice, finalText }]
    styleExamples: [], // [{ text, theme, date }]
    themeWeights, // { 'امتنان': 1.4, ... }
    lastSentPerSlot: {}, // { morning: '2026-06-21', evening: '...' }
    review: { lastWeeklyAt: null }, // حالة المراجعة الأسبوعية
  };
}

// قراءة المخزن (يصلّح نفسه لو الملف ناقص حقول).
function read() {
  try {
    if (!fs.existsSync(STORE_PATH)) return defaultStore();
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    // دمج مع الافتراضي عشان أي حقل جديد ما يبوّظش الملفات القديمة.
    return { ...defaultStore(), ...parsed };
  } catch (err) {
    // ملف بايظ ≠ نبدأ من الصفر بصمت: بنحطه جنباً عشان تقدر تستعيده يدوياً.
    try {
      const quarantine = `${STORE_PATH}.corrupt-${Date.now()}`;
      fs.renameSync(STORE_PATH, quarantine);
      console.error(`⚠️ المخزن تالف — اتنقل إلى ${quarantine} وهنبدأ بنسخة جديدة:`, err.message);
    } catch (renameErr) {
      console.error('⚠️ تعذّر قراءة المخزن، هنبدأ بنسخة جديدة:', err.message);
    }
    return defaultStore();
  }
}

// كتابة المخزن على القرص.
function write(store) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  // كتابة ذرّية: ملف مؤقّت ثم rename، عشان انقطاع الكهرباء ما يبوّظش المخزن.
  const tmp = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmp, STORE_PATH);
}

// تاريخ النهاردة YYYY-MM-DD (مصدره util عشان يبقى موحّد مع باقي المشروع).
const today = todayISO;

// ---- ثبات الحالة: هل اتبعت الخانة دي النهاردة قبل كده؟ ----
function wasSlotSentToday(slot) {
  const store = read();
  return store.lastSentPerSlot[slot] === today();
}

function markSlotSentToday(slot) {
  const store = read();
  store.lastSentPerSlot[slot] = today();
  write(store);
}

// ---- ملف الأسلوب: إضافة مثال جديد (مع سقف 30، الأقدم يخرج) ----
function addStyleExample(text, theme) {
  const store = read();
  store.styleExamples.push({ text: text.trim(), theme: theme || null, date: today() });
  // قص على آخر styleExamplesMax مثال.
  const max = config.styleExamplesMax;
  if (store.styleExamples.length > max) {
    store.styleExamples = store.styleExamples.slice(-max);
  }
  write(store);
}

function getStyleExamples() {
  return read().styleExamples;
}

// ---- ترجيح المواضيع ----
// المختار: نزوّد وزنه. المتجاهَل: نقلّل وزنه (مع حد أدنى عشان ما يختفيش خالص).
function bumpThemeWeight(theme, delta) {
  if (!theme) return;
  const store = read();
  const current = store.themeWeights[theme] ?? 1;
  let next = current + delta;
  if (next < 0.2) next = 0.2; // حد أدنى: الموضوع يفضل وارد بنسبة صغيرة
  if (next > 5) next = 5; // حد أقصى: ما يطغاش على الباقي
  store.themeWeights[theme] = Number(next.toFixed(3));
  write(store);
}

function getThemeWeights() {
  return read().themeWeights;
}

// ---- المواضيع المستخدمة في آخر N يوم (للتنويع) ----
function recentThemes(days) {
  const store = read();
  const cutoffStr = daysAgoISO(days);
  const themes = new Set();
  for (const fb of store.feedback) {
    if (fb.date >= cutoffStr && Array.isArray(fb.themesShown)) {
      for (const t of fb.themesShown) themes.add(t);
    }
  }
  return [...themes];
}

// ---- تسجيل تغذية راجعة ----
function addFeedback(entry) {
  const store = read();
  store.feedback.push({ id: Date.now(), date: today(), ...entry });
  write(store);
}

function getFeedback() {
  return read().feedback;
}

// ---- المراجعة الأسبوعية: ختم آخر مرة اتبعت ----
function markWeeklyReviewSent() {
  const store = read();
  store.review.lastWeeklyAt = new Date().toISOString();
  write(store);
}

// ---- /reset: تصفير التعلّم بالكامل (الأمثلة + الأوزان + التغذية الراجعة) ----
function resetLearning() {
  const fresh = defaultStore();
  // نحافظ على lastSentPerSlot عشان ما نبعتش مرتين في نفس اليوم بعد الريسيت.
  const store = read();
  fresh.lastSentPerSlot = store.lastSentPerSlot;
  write(fresh);
}

module.exports = {
  read,
  write,
  today,
  wasSlotSentToday,
  markSlotSentToday,
  addStyleExample,
  getStyleExamples,
  bumpThemeWeight,
  getThemeWeights,
  recentThemes,
  addFeedback,
  getFeedback,
  markWeeklyReviewSent,
  resetLearning,
  STORE_PATH,
};
