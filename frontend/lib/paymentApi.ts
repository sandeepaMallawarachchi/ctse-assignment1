const BASE_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  data: T;
}

export interface PaymentCheckoutDetails {
  orderId: string;
  paymentReference: string;
  status: string;
  merchantId: string;
  amount: number;
  currency: string;
  hash: string;
  notifyUrl: string;
  returnUrl: string;
  cancelUrl: string;
  checkoutUrl: string;
  customerEmail: string;
  sandbox: boolean;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentReference: string;
  gatewayPaymentId?: string | null;
  status: string;
  statusMessage: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body: ApiResponse<T> = await res.json();
  if (!res.ok) {
    throw new Error(body.message || "Payment request failed");
  }
  return body.data;
}

export async function apiGetCheckoutDetails(orderId: string): Promise<PaymentCheckoutDetails> {
  const res = await fetch(`${BASE_URL}/api/payment/checkout?orderId=${encodeURIComponent(orderId)}`, {
    method: "GET",
    credentials: "include",
  });
  return parseResponse<PaymentCheckoutDetails>(res);
}

export async function apiGetPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  const res = await fetch(`${BASE_URL}/api/payment/order?orderId=${encodeURIComponent(orderId)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return parseResponse<PaymentStatusResponse>(res);
}
