/** Human-friendly order / quotation references. */
export function makeRef(prefix: "LAHZA" | "QT"): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  const y = new Date().getFullYear();
  return `${prefix}-${y}-${n}`;
}
