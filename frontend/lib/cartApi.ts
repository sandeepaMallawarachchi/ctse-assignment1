import type { CartItem, AppliedCoupon } from "@/store/types";

const BASE_URL = (
  process.env.q ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

// Shape returned by backend ApiResponse<CartResponse>.data
export interface CartApiResponse {
  cartId: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    price: string | number;
    quantity: number;
    itemTotal: string | number;
    imageUrl: string;
    category?: string;
  }>;
  totalAmount: string | number;
  appliedCouponCode?: string | null;
  discountAmount?: string | number | null;
  finalAmount?: string | number | null;
  totalItems: number;
}

export interface CartData {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
}

export function mapResponse(response: CartApiResponse): CartData {
  const items: CartItem[] = (response?.items ?? []).map((item) => ({
    productId: item.productId,
    productName: item.productName,
    price: parseFloat(String(item.price)),
    quantity: item.quantity,
    imageUrl: item.imageUrl ?? "",
    category: item.category,
  }));

  const discountAmount = parseFloat(String(response.discountAmount ?? 0));
  const finalAmount = parseFloat(String(response.finalAmount ?? 0));
  const appliedCoupon: AppliedCoupon | null =
    response.appliedCouponCode
      ? { code: response.appliedCouponCode, discountAmount, finalAmount }
      : null;

  return { items, appliedCoupon };
}

/** @deprecated Use mapResponse */
export function mapResponseToItems(response: CartApiResponse): CartItem[] {
  return mapResponse(response).items;
}

async function authFetch(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<CartApiResponse> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Cart API error ${res.status}: ${text}`);
  }
  const body = await res.json();
  return body.data as CartApiResponse;
}

export async function apiFetchCart(token: string): Promise<CartData> {
  const data = await authFetch(`${BASE_URL}/api/cart`, token);
  return mapResponse(data);
}

export async function apiAddItem(
  token: string,
  item: Omit<CartItem, "quantity"> & { quantity: number }
): Promise<CartData> {
  const data = await authFetch(`${BASE_URL}/api/cart/items`, token, {
    method: "POST",
    body: JSON.stringify({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      category: item.category,
    }),
  });
  return mapResponse(data);
}

export async function apiUpdateItem(
  token: string,
  productId: string,
  quantity: number
): Promise<CartData> {
  const data = await authFetch(
    `${BASE_URL}/api/cart/items/${productId}`,
    token,
    { method: "PUT", body: JSON.stringify({ quantity }) }
  );
  return mapResponse(data);
}

export async function apiRemoveItem(
  token: string,
  productId: string
): Promise<CartData> {
  const data = await authFetch(
    `${BASE_URL}/api/cart/items/${productId}`,
    token,
    { method: "DELETE" }
  );
  return mapResponse(data);
}

export async function apiClearCart(token: string): Promise<void> {
  await fetch(`${BASE_URL}/api/cart`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiApplyCoupon(
  token: string,
  code: string
): Promise<CartData> {
  const data = await authFetch(`${BASE_URL}/api/cart/coupons`, token, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return mapResponse(data);
}

export async function apiRemoveCoupon(token: string): Promise<CartData> {
  const data = await authFetch(`${BASE_URL}/api/cart/coupons`, token, {
    method: "DELETE",
  });
  return mapResponse(data);
}

export interface GuestValidateResult {
  code: string;
  discountAmount: number;
  finalAmount: number;
  originalAmount: number;
}

/** Public endpoint — no auth needed. Used by guest users to preview a coupon. */
export async function apiValidateCoupon(
  code: string,
  amount: number
): Promise<GuestValidateResult> {
  const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, amount }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Coupon error ${res.status}`);
  }
  const body = await res.json();
  const d = body.data;
  return {
    code: d.code,
    discountAmount: parseFloat(String(d.discountAmount)),
    finalAmount: parseFloat(String(d.finalAmount)),
    originalAmount: parseFloat(String(d.originalAmount)),
  };
}
