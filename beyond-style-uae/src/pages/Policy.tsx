import { useI18n } from "@/lib/i18n";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/components/WhatsAppFab";

type PolicyKey = "about" | "shipping" | "returns" | "payment" | "privacy" | "terms" | "contact";

const COPY: Record<PolicyKey, { titleKey: Parameters<ReturnType<typeof useI18n>["t"]>[0]; en: string; ar: string }> = {
  about: {
    titleKey: "page.about.title",
    en: `Beyond Style UAE offers elegant fashion accessories and gift-ready pieces inspired by Arabic design. We focus on clear pricing, fast WhatsApp ordering, and delivery across the UAE.

Beyond Style UAE is a brand operated by BEYOND CONNECT GENERAL TRADING L.L.C, a company registered in Dubai under Trade License No. 1498624.`,
    ar: `Beyond Style UAE تقدم إكسسوارات أزياء وهدايا أنيقة بتفاصيل عربية، مع التركيز على وضوح السعر، سرعة الطلب عبر واتساب، والتوصيل داخل الإمارات.

Beyond Style UAE علامة تجارية تابعة لشركة بيوند كونكت للتجارة العامة ذ.م.م، مسجلة في إمارة دبي برخصة تجارية رقم 1498624.`,
  },
  shipping: {
    titleKey: "page.shipping.title",
    en: `• Free delivery in Dubai for orders above AED 200.
• Inside Dubai under AED 200: standard delivery fee applies.
• Outside Dubai (other emirates): shipping is calculated by area at checkout or via WhatsApp.
• Standard delivery window: 2–5 working days after order confirmation.
• For Cash on Delivery, we confirm the order by WhatsApp before dispatch.`,
    ar: `• توصيل مجاني داخل دبي للطلبات فوق ٢٠٠ درهم.
• داخل دبي تحت ٢٠٠ درهم: تُطبَّق رسوم التوصيل القياسية.
• خارج دبي (باقي الإمارات): يُحتسب التوصيل حسب المنطقة عند الدفع أو عبر واتساب.
• مدة التوصيل القياسية: ٢ إلى ٥ أيام عمل بعد تأكيد الطلب.
• لطلبات الدفع عند الاستلام: نؤكد الطلب عبر واتساب قبل الشحن.`,
  },
  returns: {
    titleKey: "page.returns.title",
    en: `• You may request a return or exchange within 7 days of receiving the order.
• The item must be unused, in its original packaging, and in its original condition.
• Earrings and personalised pieces are non-returnable for hygiene reasons.
• Refunds are issued to the original payment method within 7–14 working days after we receive the returned item.
• To start a return, message us on WhatsApp with your order number.`,
    ar: `• يمكنكِ طلب استبدال أو استرجاع خلال ٧ أيام من استلام الطلب.
• يجب أن تكون القطعة غير مستخدمة وداخل العبوة الأصلية وبحالتها الأولى.
• الأقراط والقطع المخصصة غير قابلة للاسترجاع لأسباب صحية.
• تتم إعادة المبلغ على وسيلة الدفع الأصلية خلال ٧ إلى ١٤ يوم عمل من استلامنا القطعة.
• لبدء عملية الاسترجاع: راسلينا على واتساب مع رقم الطلب.`,
  },
  payment: {
    titleKey: "page.payment.title",
    en: `We accept:
• Cash on Delivery (confirmed by WhatsApp before dispatch)
• Bank card via secure Stripe checkout
• Apple Pay / Google Pay when supported by your device

Prices are shown in AED and include VAT where applicable.`,
    ar: `طرق الدفع المتاحة:
• الدفع عند الاستلام (يتم تأكيد الطلب عبر واتساب قبل الشحن)
• بطاقة بنكية عبر بوابة Stripe الآمنة
• Apple Pay و Google Pay حيث يدعمهما جهازك

الأسعار معروضة بالدرهم الإماراتي وتشمل ضريبة القيمة المضافة عند الاقتضاء.`,
  },
  privacy: {
    titleKey: "page.privacy.title",
    en: `We collect only the information needed to fulfil your order: your name, phone number, and delivery address.
We use this information to process orders, deliver items, and contact you about your purchase.
We do not sell or share your personal data with third parties for marketing purposes.
Payment data is processed directly by Stripe and never touches our servers.`,
    ar: `نجمع فقط البيانات اللازمة لتنفيذ الطلب: الاسم ورقم الجوال وعنوان التوصيل.
نستخدم هذه البيانات لمعالجة الطلب وتوصيله والتواصل معكِ بشأنه.
لا نبيع بياناتكِ الشخصية ولا نشاركها مع أطراف خارجية لأغراض تسويقية.
بيانات الدفع تتم معالجتها مباشرة عبر Stripe ولا تُخزَّن لدينا.`,
  },
  terms: {
    titleKey: "page.terms.title",
    en: `By placing an order, you confirm that the information provided is correct and that you accept our shipping, return and privacy policies.
Prices are shown in AED and include VAT where applicable.
We reserve the right to refuse or cancel any order in case of incorrect pricing, suspected fraud, or unavailability of items.`,
    ar: `بإتمام الطلب، تؤكدين صحة البيانات وموافقتكِ على سياسات التوصيل والاسترجاع والخصوصية.
الأسعار بالدرهم الإماراتي وتشمل ضريبة القيمة المضافة عند الاقتضاء.
نحتفظ بحق رفض أو إلغاء أي طلب في حال وجود خطأ في السعر أو شبهة احتيال أو عدم توفر القطعة.`,
  },
  contact: {
    titleKey: "page.contact.title",
    en: `The fastest way to reach us is on WhatsApp.

WhatsApp: ${WHATSAPP_DISPLAY}
Operator: BEYOND CONNECT GENERAL TRADING L.L.C
Trade License No. 1498624
Dubai, United Arab Emirates`,
    ar: `أسرع وسيلة للتواصل معنا هي عبر واتساب.

واتساب: ${WHATSAPP_DISPLAY}
المُشغِّل: شركة بيوند كونكت للتجارة العامة ذ.م.م
رخصة تجارية رقم 1498624
دبي، الإمارات العربية المتحدة`,
  },
};

export function policyPage(key: PolicyKey) {
  return function PolicyPage() {
    const { t, locale } = useI18n();
    const data = COPY[key];
    const body = locale === "ar" ? data.ar : data.en;
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-6 font-display text-3xl gold-text">{t(data.titleKey)}</h1>
        <article className="whitespace-pre-line text-cream/80 leading-relaxed">{body}</article>
        {key === "contact" && (
          <a
            href={whatsappLink(locale === "ar" ? "مرحباً" : "Hello")}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-cta mt-6 inline-block"
          >
            {locale === "ar" ? "افتحي واتساب" : "Open WhatsApp"}
          </a>
        )}
      </div>
    );
  };
}

export const AboutPage = policyPage("about");
export const ShippingPage = policyPage("shipping");
export const ReturnsPage = policyPage("returns");
export const PaymentPage = policyPage("payment");
export const PrivacyPage = policyPage("privacy");
export const TermsPage = policyPage("terms");
export const ContactPage = policyPage("contact");
