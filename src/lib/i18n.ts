// Pure Wasl dictionary + lookup helper. No server-only imports so it can be
// used from both server components and client components. For the current
// locale in a server component, import getLocale from ./i18n-server.

import type { Locale } from "./config";
import { SITE } from "./config";

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}

type Dict = Record<string, { en: string; ar: string }>;

export const T: Dict = {
  brand_name:               { en: SITE.name,     ar: SITE.nameArabic },
  brand_role:               { en: "Order Control Console", ar: "لوحة تشغيل الطلبات" },
  nav_group_operate:        { en: "Operate",     ar: "التشغيل" },
  nav_group_records:        { en: "Records",     ar: "السجلات" },
  nav_group_insight:        { en: "Insight",     ar: "التحليلات" },
  nav_group_admin:          { en: "Admin",       ar: "الإدارة" },
  nav_dashboard:            { en: "Dashboard",   ar: "لوحة التحكم" },
  nav_new_conversation:     { en: "New conversation", ar: "محادثة جديدة" },
  nav_inbox:                { en: "Customer inbox",   ar: "صندوق العملاء" },
  nav_customers:            { en: "Customers",   ar: "العملاء" },
  nav_orders:               { en: "Orders",      ar: "الطلبات" },
  nav_payments:             { en: "Payments",    ar: "الدفعات" },
  nav_couriers:             { en: "Couriers and delivery", ar: "الشحن والتوصيل" },
  nav_inventory:            { en: "Inventory",   ar: "المخزون" },
  nav_offers:               { en: "Offers",      ar: "العروض" },
  nav_suppliers:            { en: "Suppliers",   ar: "المورّدون" },
  nav_reviews:              { en: "Reviews",     ar: "المراجعات" },
  nav_reports:              { en: "Reports and reviews", ar: "التقارير والمراجعات" },
  nav_integrations:         { en: "Integrations", ar: "الربط الخارجي" },
  nav_settings:             { en: "Settings",    ar: "الإعدادات" },
  nav_prompts:              { en: "Prompt management", ar: "إدارة التعليمات" },
  nav_audit:                { en: "Audit log",   ar: "سجل التدقيق" },
  nav_note_title:           { en: "AI drafts. You approve.", ar: "الذكاء يكتب. أنت توافق." },
  nav_note_body:            {
    en:  "Every reply is guardrail-checked. Owner approval gates money, dispatch, and claims.",
    ar:  "كل رد يمر عبر فحوصات أمان. موافقتك شرط لأي دفعة أو شحنة أو مطالبة.",
  },
  greeting_working_late:    { en: "Working late", ar: "دوام متأخر" },
  greeting_morning:         { en: "Good morning",  ar: "صباح الخير" },
  greeting_afternoon:       { en: "Good afternoon", ar: "مساء الخير" },
  greeting_evening:         { en: "Good evening",  ar: "مساء الخير" },
  dashboard_title:          { en: "Control tower", ar: "برج التحكم" },
  dashboard_subtitle:       {
    en: "Live conversion, payment, delivery and margin in one glance.",
    ar: "التحويل والدفع والتوصيل وهامش الربح في نظرة واحدة.",
  },
  dashboard_cta_new:        { en: "Add new conversation", ar: "أضف محادثة جديدة" },
  dashboard_revenue_today:  { en: "Revenue today (AED)", ar: "إيرادات اليوم بالدرهم" },
  dashboard_revenue_7d:     { en: "Revenue last 7 days",  ar: "إيرادات آخر 7 أيام" },
  dashboard_awaiting_pay:   { en: "Awaiting payment",     ar: "بانتظار الدفع" },
  dashboard_open_disputes:  { en: "Open disputes",        ar: "شكاوى مفتوحة" },
  dashboard_hot_leads:      { en: "Hot leads",            ar: "عملاء جادّون" },
  dashboard_new_today:      { en: "New today",            ar: "جديد اليوم" },
  dashboard_price_inq:      { en: "Price inquiries",      ar: "استفسارات السعر" },
  dashboard_delivered:      { en: "Delivered",            ar: "تم التوصيل" },
  dashboard_conv_rate:      { en: "Lead to payment",      ar: "نسبة التحويل للدفع" },
  dashboard_revenue_trend:  { en: "Revenue trend (14 days)", ar: "منحنى الإيرادات (14 يوم)" },
  dashboard_attention:      { en: "Needs your attention", ar: "بحاجة انتباهك" },
  dashboard_all_clear:      { en: "Inbox is clear. Enjoy a quiet moment.", ar: "الصندوق فاضي. تمتّع بلحظة هدوء." },
  dashboard_status_14d:     { en: "Order status (14 days)", ar: "حالة الطلبات (14 يوم)" },
  dashboard_funnel:         { en: "Conversion funnel",    ar: "قمع التحويل" },
  dashboard_top_products:   { en: "Top products (paid)",  ar: "المنتجات الأكثر مبيعاً" },
  dashboard_platforms:      { en: "Where leads come from", ar: "من أين يأتي العملاء" },
  dashboard_latest_orders:  { en: "Latest orders",        ar: "أحدث الطلبات" },
  dashboard_recent_reviews: { en: "Recent reviews",       ar: "أحدث التقييمات" },
  dashboard_latest_convs:   { en: "Latest conversations", ar: "أحدث المحادثات" },
  dashboard_open_inbox:     { en: "Open inbox",           ar: "افتح الصندوق" },
  dashboard_view_all:       { en: "View all",             ar: "عرض الكل" },
  demo_banner_title:        { en: "Demo mode",     ar: "وضع تجريبي" },
  demo_banner_body:         {
    en: "Sample customers, orders, payments and reviews so you can explore every feature instantly. Connect Supabase to switch to live data.",
    ar: "عملاء وطلبات ودفعات وتقييمات تجريبية لتستكشف كل الميزات فوراً. اربط Supabase للانتقال إلى البيانات الحقيقية.",
  },
  language_english:         { en: "English",         ar: "الإنجليزية" },
  language_arabic:          { en: "Arabic",          ar: "العربية" },
  install_app:              { en: "Install the app", ar: "ثبّت التطبيق" },
  install_hint:             {
    en:  "Add Wasl to your home screen for a full-screen, offline-capable operations app.",
    ar:  "أضف وصل إلى الشاشة الرئيسية للحصول على تطبيق تشغيل بملء الشاشة يعمل بدون إنترنت.",
  },
};

export function t(key: string, locale: Locale): string {
  const entry = T[key];
  if (!entry) return key;
  return entry[locale] ?? entry.en;
}
