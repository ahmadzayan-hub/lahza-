// =====================================================================
// review.js — التقييم الذاتي الدوري.
// بيحسب ملخص من التغذية الراجعة: نسبة القبول، أعلى المواضيع نجاحاً،
// الخانة الأكتر تجاهلاً، وعدد أمثلة الأسلوب المتجمّعة.
// يُستعمل في أمر /stats وفي التقرير الأسبوعي.
// =====================================================================

const store = require('./store');

// هل التفاعل ده يعتبر "قبول"؟ (اختار 1 أو 2 أو عدّل بنص حر)
function isAccepted(choice) {
  return choice === 'pick1' || choice === 'pick2' || choice === 'edited';
}

/**
 * buildReport — يحسب الإحصاءات ويرجّع نص جاهز للإرسال على تيليجرام.
 * @returns {{ text: string, data: object }}
 */
function buildReport() {
  const feedback = store.getFeedback();
  const styleExamples = store.getStyleExamples();

  // بنحسب "جولات" حقيقية بس: نتجاهل "جديد" (regen) لأنها وسط الجولة.
  const decisions = feedback.filter((f) => f.choice !== 'regen');
  const total = decisions.length;
  const accepted = decisions.filter((f) => isAccepted(f.choice)).length;
  const acceptRate = total ? Math.round((accepted / total) * 100) : 0;

  // أعلى 3 مواضيع نجاحاً (المواضيع اللي اخترتها أكتر).
  const themeWins = {};
  for (const f of decisions) {
    if (isAccepted(f.choice) && Array.isArray(f.themesShown)) {
      // الموضوع المختار حسب الاختيار.
      const idx = f.choice === 'pick2' ? 1 : 0;
      const theme = f.themesShown[idx] || f.themesShown[0];
      if (theme) themeWins[theme] = (themeWins[theme] || 0) + 1;
    }
  }
  const topThemes = Object.entries(themeWins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // الخانة الأكتر تجاهلاً.
  const slotStats = {}; // slot -> { total, ignored }
  for (const f of decisions) {
    const s = (slotStats[f.slot] = slotStats[f.slot] || { total: 0, ignored: 0 });
    s.total++;
    if (f.choice === 'ignore') s.ignored++;
  }
  let worstSlot = null;
  for (const [slot, s] of Object.entries(slotStats)) {
    const rate = s.ignored / s.total;
    if (!worstSlot || rate > worstSlot.rate) worstSlot = { slot, rate, ...s };
  }

  // ---- بناء النص العربي ----
  const slotName = (s) =>
    s === 'morning' ? 'الصباحية' : s === 'evening' ? 'المسائية' : s === 'occasion' ? 'المناسبات' : s;

  const lines = [];
  lines.push('📊 ملخّص المساعد');
  lines.push('');
  lines.push(`✅ نسبة القبول: ${acceptRate}% (اخترت ${accepted} من ${total})`);

  if (topThemes.length) {
    lines.push('');
    lines.push('🏆 أكتر 3 مواضيع نجاحاً:');
    topThemes.forEach(([t, n], i) => lines.push(`   ${i + 1}. ${t} (${n})`));
  }

  lines.push('');
  lines.push(`📚 أمثلة الأسلوب المتجمّعة: ${styleExamples.length}`);

  // اقتراح لو خانة بتتجاهل بنسبة عالية (≥60% وعندها 3 تفاعلات على الأقل).
  if (worstSlot && worstSlot.total >= 3 && worstSlot.rate >= 0.6) {
    lines.push('');
    lines.push(
      `⚠️ الخانة ${slotName(worstSlot.slot)} بتتجاهل كتير ` +
        `(${Math.round(worstSlot.rate * 100)}%). تحب توقفها أو تغيّر ميعادها؟`
    );
  }

  return {
    text: lines.join('\n'),
    data: { acceptRate, accepted, total, topThemes, slotStats, worstSlot },
  };
}

module.exports = { buildReport, isAccepted };
