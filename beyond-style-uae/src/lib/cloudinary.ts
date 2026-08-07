const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "demo";

export interface CldOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb";
}

/**
 * Build a Cloudinary delivery URL with automatic format + quality.
 * `f_auto` lets Cloudinary serve AVIF/WebP where supported; `q_auto`
 * picks the smallest perceptually-lossless quality. These two flags are
 * the single biggest image performance win and are always applied.
 */
export function cld(publicId: string, opts: CldOptions = {}): string {
  const t: string[] = ["f_auto", "q_auto"];
  if (opts.crop) t.push(`c_${opts.crop}`);
  if (opts.width) t.push(`w_${opts.width}`);
  if (opts.height) t.push(`h_${opts.height}`);
  // dpr_auto serves retina assets to retina screens only
  t.push("dpr_auto");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t.join(",")}/${publicId}`;
}

/** Responsive srcSet across common widths. */
export function cldSrcSet(publicId: string, widths = [320, 640, 960, 1280]): string {
  return widths.map((w) => `${cld(publicId, { width: w, crop: "fill" })} ${w}w`).join(", ");
}
