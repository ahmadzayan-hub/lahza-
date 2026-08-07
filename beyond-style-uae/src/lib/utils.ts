export type ClassValue = string | number | null | false | undefined;

/** Tiny className combiner (no external deps). */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

/** Format a number as AED currency. */
export function formatAED(amount: number, locale = "en-AE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Serialize rows to CSV and trigger a browser download. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
