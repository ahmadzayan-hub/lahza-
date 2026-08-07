// Client-facing shapes (kept free of server/mysql2 imports).
export interface ProductDTO {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  priceAed: string;
  compareAtAed: string | null;
  material: string;
  cloudinaryIds: string[];
  stock: number;
  ratingAvg: string;
  ratingCount: number;
}

export interface ReviewDTO {
  id: string;
  productId: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending_payment"
  | "pending_verification"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface OrderDTO {
  id: string;
  customerName: string;
  phone: string;
  emirate: string;
  addressLine: string;
  paymentMethod: "cod" | "card";
  status: OrderStatus;
  subtotalAed: string;
  shippingAed: string;
  totalAed: string;
  items: { productId: string; qty: number; priceAed: number }[];
  stripeSessionId: string | null;
  verificationSentAt: string | null;
  createdAt: string;
}
