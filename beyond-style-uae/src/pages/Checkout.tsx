import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/lib/i18n";
import { formatAED } from "@/lib/utils";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { orderInputSchema, type OrderInput } from "@/schemas/product";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export default function Checkout() {
  const { items, total, shipping, subtotal, clear } = useCart();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fmt = (n: number) => formatAED(n, locale === "ar" ? "ar-AE" : "en-AE");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const candidate: OrderInput = {
      customerName: String(fd.get("customerName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      emirate: fd.get("emirate") as OrderInput["emirate"],
      addressLine: String(fd.get("addressLine") ?? ""),
      paymentMethod: fd.get("paymentMethod") as OrderInput["paymentMethod"],
      items: items.map((i) => ({ productId: i.productId, qty: i.qty, priceAed: i.priceAed })),
    };

    const parsed = orderInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setSubmitting(true);
    track("begin_checkout", { value: total, currency: "AED" });
    try {
      const order = await api.createOrder(parsed.data);
      // Card orders return a Stripe Checkout URL — redirect to capture payment.
      // The cart is intentionally kept until Stripe confirms (cancel returns here).
      if (order.checkoutUrl) {
        window.location.href = order.checkoutUrl;
        return;
      }
      // COD: order is placed (pending WhatsApp verification).
      track("purchase", { transaction_id: order.id, value: total, currency: "AED" });
      clear();
      navigate(`/thank-you?order=${order.id}`);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setError(
        code === "card_payments_unavailable"
          ? "Card payments are temporarily unavailable. Please choose Cash on Delivery."
          : code === "out_of_stock"
            ? "Sorry, one of your items just sold out. Please adjust your cart."
            : "Could not place the order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-cream/60">{t("cart.empty")}</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl gold-text">{t("cart.checkout")}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field name="customerName" label={locale === "ar" ? "الاسم الكامل" : "Full name"} />
        <Field name="phone" label={locale === "ar" ? "رقم الجوال (+9715XXXXXXXX)" : "Mobile (+9715XXXXXXXX)"} placeholder="+9715XXXXXXXX" />
        <div>
          <label className="mb-1 block text-sm text-cream/70">{locale === "ar" ? "الإمارة" : "Emirate"}</label>
          <select name="emirate" className="w-full rounded-md border border-gold/20 bg-ink px-3 py-2 text-cream" required>
            {EMIRATES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <Field name="addressLine" label={locale === "ar" ? "العنوان" : "Address"} />

        <fieldset className="rounded-xl border border-gold/15 p-4">
          <legend className="px-2 text-sm text-cream/70">
            {locale === "ar" ? "طريقة الدفع" : "Payment method"}
          </legend>
          <label className="flex items-center gap-2 text-cream/90">
            <input type="radio" name="paymentMethod" value="cod" defaultChecked /> {t("pay.cod")}
          </label>
          <label className="mt-2 flex items-center gap-2 text-cream/90">
            <input type="radio" name="paymentMethod" value="card" /> {t("pay.card")}
          </label>
          <p className="mt-2 text-xs text-cream/50">
            {locale === "ar"
              ? "طلبات الدفع عند الاستلام تتطلب تأكيدًا عبر واتساب قبل الشحن."
              : "COD orders require WhatsApp confirmation before dispatch."}
          </p>
        </fieldset>

        <label className="flex items-center gap-2 rounded-xl border border-gold/15 p-4 text-sm text-cream/90">
          <input type="checkbox" name="giftWrap" />
          {locale === "ar"
            ? "تغليف هدية — متاح حسب المخزون"
            : "Gift packaging — available subject to stock"}
        </label>

        <p className="text-xs text-cream/50">{t("ship.note")}</p>
        <p className="text-xs text-cream/50">{t("pay.note")}</p>

        <div className="space-y-1 border-t border-gold/15 pt-4 text-sm">
          <Row label={t("cart.subtotal")} value={fmt(subtotal)} />
          <Row label="Shipping" value={shipping.qualifies ? t("ship.unlocked") : fmt(shipping.shippingAed)} />
          <Row label="Total" value={fmt(total)} bold />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={submitting} className="gold-cta w-full disabled:opacity-60">
          {submitting ? "…" : t("cart.checkout")}
        </button>
      </form>
    </div>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-cream/70">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required
        className="w-full rounded-md border border-gold/20 bg-ink px-3 py-2 text-cream placeholder:text-cream/30"
      />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-lg font-semibold" : "text-cream/70"}`}>
      <span>{label}</span>
      <span className={bold ? "gold-text" : ""}>{value}</span>
    </div>
  );
}
