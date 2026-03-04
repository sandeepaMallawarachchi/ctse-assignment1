import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, CartState, AppliedCoupon } from "./types";
import type { RootState } from "./index";
import type { CartData } from "@/lib/cartApi";
import * as cartApi from "@/lib/cartApi";

const GUEST_CART_KEY = "guestCart";
const GUEST_COUPON_KEY = "guestCoupon";

// ─── localStorage helpers ────────────────────────────────────────────────────

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}
function saveGuestCart(items: CartItem[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}
function clearGuestCart() {
  if (typeof window !== "undefined") localStorage.removeItem(GUEST_CART_KEY);
}
function loadGuestCoupon(): AppliedCoupon | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_COUPON_KEY);
    return raw ? (JSON.parse(raw) as AppliedCoupon) : null;
  } catch {
    return null;
  }
}
function saveGuestCoupon(coupon: AppliedCoupon | null) {
  if (typeof window === "undefined") return;
  if (coupon) localStorage.setItem(GUEST_COUPON_KEY, JSON.stringify(coupon));
  else localStorage.removeItem(GUEST_COUPON_KEY);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeTotals(items: CartItem[]) {
  return {
    totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0),
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
  };
}

function toCartData(items: CartItem[], coupon: AppliedCoupon | null): CartData {
  return { items, appliedCoupon: coupon };
}

async function revalidateGuestCoupon(
  items: CartItem[],
  current: AppliedCoupon | null
): Promise<AppliedCoupon | null> {
  if (!current) return null;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  if (subtotal <= 0) { saveGuestCoupon(null); return null; }
  try {
    const result = await cartApi.apiValidateCoupon(current.code, subtotal);
    const coupon: AppliedCoupon = {
      code: result.code,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
    };
    saveGuestCoupon(coupon);
    return coupon;
  } catch {
    saveGuestCoupon(null);
    return null;
  }
}

// ─── Cart mutation thunks ────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as RootState;
    if (!auth.token) return toCartData(loadGuestCart(), loadGuestCoupon());
    try {
      return await cartApi.apiFetchCart(auth.token);
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

type AddPayload = Omit<CartItem, "quantity"> & { quantity?: number };

export const addCartItem = createAsyncThunk(
  "cart/addItem",
  async (item: AddPayload, { getState, rejectWithValue }) => {
    const { auth, cart } = getState() as RootState;
    const qty = item.quantity ?? 1;

    if (!auth.token) {
      const existing = cart.items.find((i) => i.productId === item.productId);
      const updated: CartItem[] = existing
        ? cart.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i
          )
        : [...cart.items, { ...item, quantity: qty }];
      saveGuestCart(updated);
      const coupon = await revalidateGuestCoupon(updated, cart.appliedCoupon);
      return toCartData(updated, coupon);
    }
    try {
      return await cartApi.apiAddItem(auth.token, { ...item, quantity: qty });
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { getState, rejectWithValue }
  ) => {
    const { auth, cart } = getState() as RootState;

    if (!auth.token) {
      const updated: CartItem[] =
        quantity <= 0
          ? cart.items.filter((i) => i.productId !== productId)
          : cart.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            );
      saveGuestCart(updated);
      const coupon = await revalidateGuestCoupon(updated, cart.appliedCoupon);
      return toCartData(updated, coupon);
    }
    try {
      return await cartApi.apiUpdateItem(auth.token, productId, quantity);
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (productId: string, { getState, rejectWithValue }) => {
    const { auth, cart } = getState() as RootState;

    if (!auth.token) {
      const updated = cart.items.filter((i) => i.productId !== productId);
      saveGuestCart(updated);
      const coupon = await revalidateGuestCoupon(updated, cart.appliedCoupon);
      return toCartData(updated, coupon);
    }
    try {
      return await cartApi.apiRemoveItem(auth.token, productId);
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  "cart/clear",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as RootState;

    if (!auth.token) {
      clearGuestCart();
      saveGuestCoupon(null);
      return toCartData([], null);
    }
    try {
      await cartApi.apiClearCart(auth.token);
      return toCartData([], null);
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const syncGuestCartOnLogin = createAsyncThunk(
  "cart/syncOnLogin",
  async (token: string, { rejectWithValue }) => {
    const guestItems = loadGuestCart();
    try {
      let result: CartData;
      if (guestItems.length === 0) {
        result = await cartApi.apiFetchCart(token);
      } else {
        let last: CartData = { items: [], appliedCoupon: null };
        for (const item of guestItems) {
          last = await cartApi.apiAddItem(token, item);
        }
        clearGuestCart();
        result = last;
      }
      const guestCoupon = loadGuestCoupon();
      if (guestCoupon) {
        try {
          result = await cartApi.apiApplyCoupon(token, guestCoupon.code);
        } catch { /* ignore stale coupon */ }
        saveGuestCoupon(null);
      }
      return result;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Coupon thunks ────────────────────────────────────────────────────────────

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code: string, { getState, rejectWithValue }) => {
    const { auth, cart } = getState() as RootState;

    if (!auth.token) {
      const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
      try {
        const result = await cartApi.apiValidateCoupon(code, subtotal);
        const coupon: AppliedCoupon = {
          code: result.code,
          discountAmount: result.discountAmount,
          finalAmount: result.finalAmount,
        };
        saveGuestCoupon(coupon);
        return coupon;
      } catch (e: unknown) {
        return rejectWithValue((e as Error).message);
      }
    }

    try {
      const data = await cartApi.apiApplyCoupon(auth.token, code);
      return data.appliedCoupon ?? null;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as RootState;

    if (!auth.token) {
      saveGuestCoupon(null);
      return null;
    }
    try {
      await cartApi.apiRemoveCoupon(auth.token);
      return null;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  appliedCoupon: null,
  couponStatus: "idle",
  couponError: null,
  status: "idle",
  error: null,
};

function applyCartData(state: CartState, data: CartData) {
  state.items = data.items;
  const { totalAmount, totalItems } = computeTotals(data.items);
  state.totalAmount = totalAmount;
  state.totalItems = totalItems;
  state.appliedCoupon = data.appliedCoupon ?? null;
  state.status = "succeeded";
  state.error = null;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartData>) =>
        applyCartData(state, action.payload)
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(addCartItem.fulfilled, (state, action: PayloadAction<CartData>) =>
        applyCartData(state, action.payload)
      )
      .addCase(addCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartData>) =>
        applyCartData(state, action.payload)
      )
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(removeCartItem.fulfilled, (state, action: PayloadAction<CartData>) =>
        applyCartData(state, action.payload)
      )
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(clearCartThunk.fulfilled, (state, action: PayloadAction<CartData>) =>
        applyCartData(state, action.payload)
      )
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(syncGuestCartOnLogin.fulfilled, (state, action: PayloadAction<CartData>) =>
        applyCartData(state, action.payload)
      )
      .addCase(syncGuestCartOnLogin.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Coupon apply
      .addCase(applyCoupon.pending, (state) => {
        state.couponStatus = "loading";
        state.couponError = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action: PayloadAction<AppliedCoupon | null | undefined>) => {
        state.appliedCoupon = action.payload ?? null;
        state.couponStatus = "succeeded";
        state.couponError = null;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.couponStatus = "failed";
        state.couponError = action.payload as string;
      })

      // Coupon remove
      .addCase(removeCoupon.fulfilled, (state) => {
        state.appliedCoupon = null;
        state.couponStatus = "idle";
        state.couponError = null;
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.couponError = action.payload as string;
      });
  },
});

export default cartSlice.reducer;
