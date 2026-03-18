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

export interface AuthUser {
  firstName: string;
  lastName: string;
  userId: string;
  email: string;
  phoneNumber: string | null;
  address: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  fullName: string;
  roles: string[];
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
}
