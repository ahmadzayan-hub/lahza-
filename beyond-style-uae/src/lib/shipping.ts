// Isomorphic env read: Vite injects import.meta.env in the browser bundle,
// while Node/Vercel serverless reads process.env. Guard both so this module
// is safe to import from the client *and* the API.
function readThreshold(): number {
  const viteVal =
    typeof import.meta !== "undefined"
      ? import.meta.env?.VITE_FREE_SHIPPING_THRESHOLD
      : undefined;
  const nodeVal =
    typeof process !== "undefined" ? process.env?.VITE_FREE_SHIPPING_THRESHOLD : undefined;
  return Number(viteVal ?? nodeVal ?? 200);
}

export const FREE_SHIPPING_THRESHOLD = readThreshold();

export const STANDARD_SHIPPING_AED = 20;

export interface ShippingState {
  qualifies: boolean;
  remaining: number; // AED still needed to unlock free delivery
  shippingAed: number;
}

/** Pure helper so the threshold logic is testable and shared. */
export function computeShipping(subtotal: number): ShippingState {
  const qualifies = subtotal >= FREE_SHIPPING_THRESHOLD;
  return {
    qualifies,
    remaining: qualifies ? 0 : Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    shippingAed: qualifies ? 0 : STANDARD_SHIPPING_AED,
  };
}
