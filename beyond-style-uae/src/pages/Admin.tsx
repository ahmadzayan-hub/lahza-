import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api";
import { productInputSchema } from "@/schemas/product";
import { downloadCsv, formatAED } from "@/lib/utils";
import type { OrderDTO, OrderStatus, ProductDTO } from "@/types";

const ALL_STATUSES: OrderStatus[] = [
  "pending_payment",
  "pending_verification",
  "confirmed",
  "dispatched",
  "delivered",
  "cancelled",
];

// Fulfilment buttons available for each order status.
function nextActions(status: OrderStatus): { label: string; to: OrderStatus; danger?: boolean }[] {
  switch (status) {
    case "pending_verification":
      return [
        { label: "Mark verified", to: "confirmed" },
        { label: "Cancel", to: "cancelled", danger: true },
      ];
    case "pending_payment":
      return [{ label: "Cancel", to: "cancelled", danger: true }];
    case "confirmed":
      return [{ label: "Mark dispatched", to: "dispatched" }];
    case "dispatched":
      return [{ label: "Mark delivered", to: "delivered" }];
    default:
      return [];
  }
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: "text-amber-400",
  pending_verification: "text-amber-400",
  confirmed: "text-sky-400",
  dispatched: "text-sky-300",
  delivered: "text-green-400",
  cancelled: "text-cream/40",
};

const TOKEN_KEY = "bsu_admin_token";
const EMPTY = {
  slug: "",
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  priceAed: "",
  compareAtAed: "",
  material: "Gold-tone plated",
  cloudinaryIds: "",
  stock: "0",
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [orderQuery, setOrderQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [orders, orderQuery, statusFilter]);

  function exportOrdersCsv() {
    downloadCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ["id", "created", "customer", "phone", "emirate", "payment", "status", "items", "total_aed"],
      filteredOrders.map((o) => [
        o.id,
        new Date(o.createdAt).toISOString(),
        o.customerName,
        o.phone,
        o.emirate,
        o.paymentMethod,
        o.status,
        o.items.reduce((n, i) => n + i.qty, 0),
        o.totalAed,
      ]),
    );
  }

  async function load(tok = token) {
    try {
      const [rows, orderRows] = await Promise.all([
        adminApi.list(tok),
        adminApi.listOrders(tok),
      ]);
      setProducts(rows);
      setOrders(orderRows);
      setAuthed(true);
      localStorage.setItem(TOKEN_KEY, tok);
      setError(null);
    } catch (e) {
      setAuthed(false);
      setError(e instanceof Error && e.message === "unauthorized" ? "Invalid admin token." : "Could not load data.");
    }
  }

  async function setOrderStatus(id: string, status: OrderStatus) {
    try {
      await adminApi.updateOrderStatus(token, id, status);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed.");
    }
  }

  useEffect(() => {
    if (token) void load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const candidate = {
      slug: form.slug.trim(),
      titleEn: form.titleEn.trim(),
      titleAr: form.titleAr.trim(),
      descriptionEn: form.descriptionEn.trim(),
      descriptionAr: form.descriptionAr.trim(),
      priceAed: Number(form.priceAed),
      compareAtAed: form.compareAtAed ? Number(form.compareAtAed) : undefined,
      material: form.material.trim(),
      cloudinaryIds: form.cloudinaryIds.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
    };

    const parsed = productInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    try {
      await adminApi.create(token, parsed.data);
      setNotice(`Created "${parsed.data.titleEn}".`);
      setForm({ ...EMPTY });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed.");
    }
  }

  async function toggleActive(p: ProductDTO & { active?: boolean }) {
    try {
      // ProductDTO doesn't carry `active`; admin list rows do at runtime.
      const isActive = (p as { active?: boolean }).active !== false;
      if (isActive) await adminApi.remove(token, p.id);
      else await adminApi.update(token, p.id, { active: true });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <h1 className="mb-4 font-display text-2xl gold-text">Admin</h1>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          className="w-full rounded-md border border-gold/20 bg-ink px-3 py-2 text-cream"
        />
        <button className="gold-cta mt-4 w-full" onClick={() => load(token)}>
          Sign in
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl gold-text">Admin</h1>

      <div className="mb-6 flex gap-2">
        {(["products", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
              tab === t ? "bg-gold-gradient text-ink" : "border border-gold/30 text-cream/70"
            }`}
          >
            {t}
            {t === "orders" && orders.length > 0 ? ` (${orders.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Search name / phone / id"
              className="flex-1 rounded-md border border-gold/20 bg-ink px-3 py-2 text-sm text-cream placeholder:text-cream/30"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className="rounded-md border border-gold/20 bg-ink px-3 py-2 text-sm text-cream"
            >
              <option value="all">All statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
            <button
              onClick={exportOrdersCsv}
              disabled={filteredOrders.length === 0}
              className="rounded-md border border-gold/30 px-3 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-40"
            >
              Export CSV
            </button>
          </div>

          <ul className="space-y-3">
            {filteredOrders.length === 0 && (
              <li className="text-sm text-cream/50">No matching orders.</li>
            )}
            {filteredOrders.map((o) => (
              <li key={o.id} className="rounded-xl border border-gold/15 p-4">
                <button
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 text-start"
                >
                  <div>
                    <p className="text-cream/90">
                      {o.customerName}{" "}
                      <span className="text-xs text-cream/50">· {o.phone} · {o.emirate}</span>
                    </p>
                    <p className="text-xs text-cream/50">
                      {o.paymentMethod.toUpperCase()} · {new Date(o.createdAt).toLocaleString()} ·{" "}
                      {o.items.reduce((n, i) => n + i.qty, 0)} item(s)
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="gold-text font-semibold">{formatAED(Number(o.totalAed))}</p>
                    <p className={`text-xs ${STATUS_COLOR[o.status]}`}>{o.status.replace("_", " ")}</p>
                  </div>
                </button>

                {expanded === o.id && (
                  <div className="mt-3 border-t border-white/5 pt-3 text-xs text-cream/60">
                    <p className="mb-1 text-cream/80">{o.addressLine}</p>
                    <p className="mb-2 font-mono text-cream/40">{o.id}</p>
                    <ul className="space-y-1">
                      {o.items.map((i, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{i.productId}</span>
                          <span>
                            {i.qty} × {formatAED(i.priceAed)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {nextActions(o.status).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nextActions(o.status).map((a) => (
                      <button
                        key={a.to}
                        onClick={() => setOrderStatus(o.id, a.to)}
                        className={`rounded-md px-3 py-1 text-xs ${
                          a.danger
                            ? "border border-red-400/40 text-red-300 hover:bg-red-400/10"
                            : "border border-gold/30 text-gold hover:bg-gold/10"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "products" && (
        <>
      <form onSubmit={onCreate} className="space-y-3 rounded-2xl border border-gold/15 p-5">
        <h2 className="font-display text-lg text-cream/90">New product</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Slug (kebab-case)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <Input label="Material" value={form.material} onChange={(v) => setForm({ ...form, material: v })} />
          <Input label="Title (EN)" value={form.titleEn} onChange={(v) => setForm({ ...form, titleEn: v })} />
          <Input label="Title (AR)" value={form.titleAr} onChange={(v) => setForm({ ...form, titleAr: v })} />
          <Input label="Price (AED)" value={form.priceAed} onChange={(v) => setForm({ ...form, priceAed: v })} type="number" />
          <Input label="Compare-at (AED, optional)" value={form.compareAtAed} onChange={(v) => setForm({ ...form, compareAtAed: v })} type="number" />
          <Input label="Stock" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} type="number" />
          <Input label="Cloudinary IDs (comma-separated)" value={form.cloudinaryIds} onChange={(v) => setForm({ ...form, cloudinaryIds: v })} />
        </div>
        <Input label="Description (EN)" value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} />
        <Input label="Description (AR)" value={form.descriptionAr} onChange={(v) => setForm({ ...form, descriptionAr: v })} />
        <p className="text-xs text-cream/50">
          Compliance: terms like "Real Gold" or "18k" are rejected; material must say "plated".
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {notice && <p className="text-sm text-green-400">{notice}</p>}
        <button type="submit" className="gold-cta">Create product</button>
      </form>

      <h2 className="mb-3 mt-8 font-display text-lg text-cream/90">Catalogue ({products.length})</h2>
      <ul className="space-y-2">
        {products.map((p) => {
          const isActive = (p as { active?: boolean }).active !== false;
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-gold/15 p-3">
              <div className="flex-1">
                <p className="text-cream/90">{p.titleEn}</p>
                <p className="text-xs text-cream/50">
                  {p.slug} · {formatAED(Number(p.priceAed))} · stock {p.stock}
                </p>
              </div>
              <span className={`text-xs ${isActive ? "text-green-400" : "text-cream/40"}`}>
                {isActive ? "active" : "inactive"}
              </span>
              <button
                onClick={() => toggleActive(p)}
                className="rounded-md border border-gold/30 px-3 py-1 text-xs text-gold hover:bg-gold/10"
              >
                {isActive ? "Deactivate" : "Activate"}
              </button>
            </li>
          );
        })}
      </ul>
        </>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-cream/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gold/20 bg-ink px-3 py-2 text-cream placeholder:text-cream/30"
      />
    </label>
  );
}
