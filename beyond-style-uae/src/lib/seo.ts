/** Canonical site origin. Override at build/runtime with VITE_SITE_URL. */
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://beyondstyle.ae"
).replace(/\/$/, "");

export const BRAND = "Beyond Style UAE";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.svg`;

export function canonical(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
