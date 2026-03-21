const BASE_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  status: string;
  subtotal: number;
  totalAmount: number;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
}

export async function placeOrder(
  token: string,
  shippingAddress: ShippingAddress,
  notes?: string
): Promise<OrderResponse> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shippingAddress, notes }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message ?? `Order failed (${res.status})`);
  }
  return body.data as OrderResponse;
}

// ── Admin order functions ────────────────────────────────────────────────────

export async function adminGetAllOrders(token: string): Promise<OrderResponse[]> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Failed to fetch orders");
  return body.data as OrderResponse[];
}

export async function adminUpdateOrderStatus(
  token: string,
  orderId: string,
  status: string
): Promise<OrderResponse> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Failed to update status");
  return body.data as OrderResponse;
}

// ── Coupon types ─────────────────────────────────────────────────────────────

export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface CouponResponse {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxUsageCount: number;
  usageCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateCouponRequest {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxUsageCount: number;
  expiresAt: string | null;
}

// ── Admin coupon functions ────────────────────────────────────────────────────

export async function adminGetAllCoupons(token: string): Promise<CouponResponse[]> {
  const res = await fetch(`${BASE_URL}/api/coupons`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Failed to fetch coupons");
  return body.data as CouponResponse[];
}

export async function adminCreateCoupon(
  token: string,
  request: CreateCouponRequest
): Promise<CouponResponse> {
  const res = await fetch(`${BASE_URL}/api/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Failed to create coupon");
  return body.data as CouponResponse;
}

export async function adminDeactivateCoupon(
  token: string,
  id: string
): Promise<CouponResponse> {
  const res = await fetch(`${BASE_URL}/api/coupons/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Failed to deactivate coupon");
  return body.data as CouponResponse;
}
