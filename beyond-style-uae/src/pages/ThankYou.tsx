import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatsappLink } from "@/components/WhatsAppFab";

export default function ThankYou() {
  const [params] = useSearchParams();
  const { locale } = useI18n();
  const order = params.get("order");

  const trackingMessage =
    locale === "ar"
      ? `مرحباً، أود متابعة الطلب رقم: ${order ?? ""}`
      : `Hi, I'd like to track order: ${order ?? ""}`;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto text-gold" size={56} />
      <h1 className="mt-4 font-display text-2xl gold-text">
        {locale === "ar" ? "شكراً لطلبك!" : "Thank you for your order!"}
      </h1>
      <p className="mt-3 text-cream/70">
        {locale === "ar"
          ? "تم استلام طلبك. لطلبات الدفع عند الاستلام سنؤكد عبر واتساب قبل الشحن."
          : "Your order is received. For Cash on Delivery, we'll confirm by WhatsApp before dispatch."}
      </p>
      {order && (
        <p className="mt-3 inline-block rounded-full border border-gold/30 px-3 py-1 font-mono text-xs text-cream/60">
          #{order}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="gold-cta">
          {locale === "ar" ? "متابعة التسوق" : "Continue shopping"}
        </Link>
        <a
          href={whatsappLink(trackingMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-5 py-3 text-sm text-gold hover:bg-gold/10"
        >
          <MessageCircle size={16} />
          {locale === "ar" ? "تتبع الطلب عبر واتساب" : "Track on WhatsApp"}
        </a>
      </div>
    </div>
  );
}
