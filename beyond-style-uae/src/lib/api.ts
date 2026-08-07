import type { OrderDTO, OrderStatus, ProductDTO, ReviewDTO } from "@/types";
import type { OrderInput, ProductInput, ProductUpdate } from "@/schemas/product";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface CreatedOrderResponse {
  id: string;
  status: string;
  totalAed: number;
  checkoutUrl?: string; // present for card orders (Stripe redirect)
}

export const api = {
  listProducts: () => fetch("/api/products").then(json<ProductDTO[]>),
  getProduct: (slug: string) =>
    fetch(`/api/products/${slug}`).then(json<{ product: ProductDTO; reviews: ReviewDTO[] }>),
  createOrder: (input: OrderInput) =>
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(json<CreatedOrderResponse>),
};

function adminHeaders(token: string) {
  return { "Content-Type": "application/json", "x-admin-token": token };
}

export const adminApi = {
  list: (token: string) =>
    fetch("/api/admin/products", { headers: { "x-admin-token": token } }).then(json<ProductDTO[]>),
  create: (token: string, input: ProductInput) =>
    fetch("/api/admin/products", {
      method: "POST",
      headers: adminHeaders(token),
      body: JSON.stringify(input),
    }).then(json<{ id: string }>),
  update: (token: string, id: string, patch: ProductUpdate) =>
    fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: adminHeaders(token),
      body: JSON.stringify(patch),
    }).then(json<{ id: string }>),
  remove: (token: string, id: string) =>
    fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    }).then(json<{ id: string; active: boolean }>),
  listOrders: (token: string) =>
    fetch("/api/admin/orders", { headers: { "x-admin-token": token } }).then(json<OrderDTO[]>),
  updateOrderStatus: (token: string, id: string, status: OrderStatus) =>
    fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: adminHeaders(token),
      body: JSON.stringify({ status }),
    }).then(json<{ id: string; status: OrderStatus }>),
};
