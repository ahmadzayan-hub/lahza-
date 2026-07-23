// =====================================================================
// index.js — نقطة التشغيل.
// بيشغّل البوت (long polling)، بيجدول الخانات (صباح/مساء)، بيفحص المناسبة
// قبل اقتراح الصباح، وبيبعت التقرير الأسبوعي. وبيربط الدورة المغلقة كلها.
//
// تنبيه: لازم الجهاز يفضل شغّال عشان الجدولة وأزرار التغذية الراجعة تشتغل.
// استخدم pm2 للتشغيل الدائم (شوف README).
// =====================================================================

require('dotenv').config();
const cron = require('node-cron');
const config = require('./config');
const { setupHandlers, sendSuggestions, Telegraf } = require('./bot');
const { getTodaysOccasion } = require('./occasions');
const review = require('./review');
const store = require('./store');

// تأكيد وجود التوكن.
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN مش موجود في .env. خد توكن من @BotFather الأول.');
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
setupHandlers(bot);

// ---- خانة الصباح: تفحص المناسبة الأول، لو فيه مناسبة تقترح لها ----
async function runMorning() {
  try {
    const occasion = getTodaysOccasion();
    if (occasion) {
      console.log(`🎉 النهاردة مناسبة: ${occasion.label}`);
      await sendSuggestions(bot, { slot: 'occasion', occasion });
    } else {
      await sendSuggestions(bot, { slot: 'morning' });
    }
  } catch (err) {
    console.error('خطأ في اقتراح الصباح:', err.message);
  }
}

// ---- خانة المساء ----
async function runEvening() {
  try {
    await sendSuggestions(bot, { slot: 'evening' });
  } catch (err) {
    console.error('خطأ في اقتراح المساء:', err.message);
  }
}

// ---- التقرير الأسبوعي ----
async function runWeeklyReview() {
  try {
    const { text } = review.buildReport();
    if (config.dryRun) {
      console.log('\n[dryRun] التقرير الأسبوعي:\n' + text + '\n');
      store.markWeeklyReviewSent();
      return;
    }
    if (config.chatId) {
      // بدون parse_mode: أسماء المواضيع ممكن تكسر Markdown وترمي 400.
      await bot.telegram.sendMessage(config.chatId, text);
      store.markWeeklyReviewSent();
    }
  } catch (err) {
    console.error('خطأ في التقرير الأسبوعي:', err.message);
  }
}

// ---- الجدولة بتوقيت Asia/Dubai ----
const cronOpts = { timezone: config.timezone };
cron.schedule(config.morningCron, runMorning, cronOpts);
cron.schedule(config.eveningCron, runEvening, cronOpts);
cron.schedule(config.weeklyReviewCron, runWeeklyReview, cronOpts);

// قائمة الأوامر اللي بتظهر في تيليجرام لما تدوس /.
const BOT_COMMANDS = [
  { command: 'suggest', description: 'اقتراح فوري' },
  { command: 'occasion', description: 'اقتراح مناسبة (أو /occasion عيد جوازنا)' },
  { command: 'morning', description: 'اقتراح صباحي فوري' },
  { command: 'evening', description: 'اقتراح مسائي فوري' },
  { command: 'stats', description: 'ملخّص الأداء' },
  { command: 'reset', description: 'تصفير التعلّم' },
];

// ---- تشغيل البوت ----
bot.launch().then(() => {
  // نسجّل قائمة الأوامر (مش بلوكنج — لو فشلت بسبب النت مش هتوقف البوت).
  bot.telegram.setMyCommands(BOT_COMMANDS).catch((e) =>
    console.warn('⚠️ تعذّر ضبط قائمة الأوامر:', e.message)
  );
  console.log('✅ البوت شغّال (long polling).');
  console.log(`   التوقيت: ${config.timezone}`);
  console.log(`   الصباح: ${config.morningCron} · المساء: ${config.eveningCron}`);
  console.log(`   dryRun = ${config.dryRun}  ${config.dryRun ? '(هيطبع مش هيبعت)' : '(هيبعت فعلاً)'}`);
  if (!config.chatId) {
    console.log('ℹ️  chatId فاضي — ابعت /start للبوت عشان ياخد الـ id ويطبعه.');
  }
}).catch((err) => {
  // فشل التشغيل (غالباً توكن غلط أو النت محجوب) — رسالة واضحة بدل ما يقع فجأة.
  console.error('❌ تعذّر تشغيل البوت:', err.message);
  console.error('   اتأكد إن TELEGRAM_BOT_TOKEN صح وإن الجهاز بيوصل لـ api.telegram.org.');
  process.exit(1);
});

// إغلاق نظيف.
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
