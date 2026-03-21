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
