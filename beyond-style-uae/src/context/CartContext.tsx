import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { computeShipping, type ShippingState } from "@/lib/shipping";
import { track } from "@/lib/analytics";
import { PAIR_OFFERS } from "@/lib/sample-data";

export interface CartItem {
  productId: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  priceAed: number;
  cloudinaryId: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  lastAddedAt: number | null;
}

type Action =
  | { type: "ADD"; item: Omit<CartItem, "qty">; qty?: number }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_QTY"; productId: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; state: CartState };

const STORAGE_KEY = "bsu_cart_v1";

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const qty = action.qty ?? 1;
      const existing = state.items.find((i) => i.productId === action.item.productId);
      const items = existing
        ? state.items.map((i) =>
            i.productId === action.item.productId ? { ...i, qty: i.qty + qty } : i,
          )
        : [...state.items, { ...action.item, qty }];
      return { items, lastAddedAt: Date.now() };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case "SET_QTY":
      return {
        ...state,
        items: state.items
          .map((i) => (i.productId === action.productId ? { ...i, qty: action.qty } : i))
          .filter((i) => i.qty > 0),
      };
    case "CLEAR":
      return { items: [], lastAddedAt: null };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

interface CartValue {
  items: CartItem[];
  subtotal: number;
  savings: number;
  count: number;
  shipping: ShippingState;
  total: number;
  lastAddedAt: number | null;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

const initial: CartState = { items: [], lastAddedAt: null };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Hydrate once from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Pair-offer pricing — buying ≥ N of an offer-eligible piece collapses that
  // line's price to the pair price (and repeats for further pairs). Aligns
  // with the active campaign: 1 bracelet 79, 2 bracelets 129.
  const subtotal = useMemo(
    () =>
      state.items.reduce((sum, i) => {
        const offer = PAIR_OFFERS[i.productId];
        if (offer && i.qty >= offer.qty) {
          const bundles = Math.floor(i.qty / offer.qty);
          const remainder = i.qty % offer.qty;
          return sum + bundles * offer.priceAed + remainder * i.priceAed;
        }
        return sum + i.priceAed * i.qty;
      }, 0),
    [state.items],
  );

  const savings = useMemo(
    () =>
      state.items.reduce((s, i) => {
        const offer = PAIR_OFFERS[i.productId];
        if (offer && i.qty >= offer.qty) {
          const bundles = Math.floor(i.qty / offer.qty);
          return s + bundles * (offer.qty * i.priceAed - offer.priceAed);
        }
        return s;
      }, 0),
    [state.items],
  );
  const count = useMemo(() => state.items.reduce((n, i) => n + i.qty, 0), [state.items]);
  const shipping = useMemo(() => computeShipping(subtotal), [subtotal]);

  const add = useCallback<CartValue["add"]>((item, qty = 1) => {
    dispatch({ type: "ADD", item, qty });
    track("add_to_cart", {
      currency: "AED",
      value: item.priceAed * qty,
      items: [{ item_id: item.productId, quantity: qty }],
    });
  }, []);

  const remove = useCallback<CartValue["remove"]>((productId) => {
    dispatch({ type: "REMOVE", productId });
  }, []);

  const setQty = useCallback<CartValue["setQty"]>((productId, qty) => {
    dispatch({ type: "SET_QTY", productId, qty });
  }, []);

  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value: CartValue = {
    items: state.items,
    subtotal,
    savings,
    count,
    shipping,
    total: subtotal + shipping.shippingAed,
    lastAddedAt: state.lastAddedAt,
    add,
    remove,
    setQty,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
