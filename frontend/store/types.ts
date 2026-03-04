export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category?: string;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  finalAmount: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  appliedCoupon: AppliedCoupon | null;
  couponStatus: "idle" | "loading" | "succeeded" | "failed";
  couponError: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}
