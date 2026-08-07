import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

const TWENTY_MINUTES_MS = 20 * 60 * 1000;

/**
 * Starts a 20-minute timer each time an item is added to a non-empty cart.
 * If the timer fires before checkout clears the cart, we treat the cart as
 * abandoned and fire the supplied callback (used to enqueue a recovery
 * email/WhatsApp nudge). The timer resets on every add and is cancelled
 * once the cart empties.
 */
export function useAbandonedCart(
  onAbandon?: (payload: { items: number; subtotal: number }) => void,
) {
  const { count, subtotal, lastAddedAt } = useCart();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    // No active cart → nothing to recover.
    if (count === 0 || lastAddedAt === null) return;

    timer.current = setTimeout(() => {
      const handler =
        onAbandon ??
        ((p: { items: number; subtotal: number }) =>
          // Default behaviour: log + beacon to the recovery endpoint.
          void fetch("/api/abandoned-cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
            keepalive: true,
          }).catch(() => {}));
      handler({ items: count, subtotal });
    }, TWENTY_MINUTES_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [count, subtotal, lastAddedAt, onAbandon]);
}
