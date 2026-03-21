"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyCoupon, removeCoupon, clearCartThunk } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatLkr } from "@/lib/currency";
import { placeOrder, type ShippingAddress } from "@/lib/orderApi";

type PaymentMethod = "bank" | "cod";
type OrderStatus = "idle" | "loading" | "success" | "error";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.auth.token);
  const items = useAppSelector((state) => state.cart.items);
  const totalAmount = useAppSelector((state) => state.cart.totalAmount);
  const appliedCoupon = useAppSelector((state) => state.cart.appliedCoupon);
  const couponStatus = useAppSelector((state) => state.cart.couponStatus);
  const couponError = useAppSelector((state) => state.cart.couponError);

  const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : totalAmount;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [couponInput, setCouponInput] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    companyName: "",
    streetAddress: "",
    apartment: "",
    townCity: "",
    state: "",
    postalCode: "",
    country: "Sri Lanka",
    phoneNumber: "",
    emailAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildShippingAddress = (): ShippingAddress => ({
    fullName: form.firstName,
    addressLine1: form.streetAddress,
    addressLine2: form.apartment || undefined,
    city: form.townCity,
    state: form.state,
    postalCode: form.postalCode,
    country: form.country,
    phone: form.phoneNumber,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setOrderError("You must be logged in to place an order.");
      return;
    }
    if (items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    const shippingAddress = buildShippingAddress();

    if (paymentMethod === "cod") {
      // ── COD: place the order immediately ──────────────────────────────
      setOrderStatus("loading");
      setOrderError(null);
      try {
        const order = await placeOrder(token, shippingAddress);
        setOrderNumber(order.orderNumber);
        setOrderStatus("success");
        dispatch(clearCartThunk());
      } catch (err: unknown) {
        setOrderStatus("error");
        setOrderError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
      }
    } else {
      // ── Bank: hand off to payment gateway ─────────────────────────────
      // Store the pending order context so the payment gateway can call
      // POST /api/orders after payment is confirmed.
      sessionStorage.setItem(
        "pendingOrder",
        JSON.stringify({ shippingAddress, amount: finalAmount, coupon: appliedCoupon?.code ?? null })
      );
      router.push(`/payment?amount=${finalAmount}&method=bank`);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (orderStatus === "success") {
    return (
      <section className="mx-auto max-w-[1240px] px-4 md:px-8 py-24 flex flex-col items-center gap-6 text-center">
        <CheckCircle className="text-green-500" size={64} />
        <h2 className="text-2xl font-semibold text-[var(--color-text-1)]">Order Placed!</h2>
        {orderNumber && (
          <p className="text-sm text-[var(--color-text-2)]">
            Order number: <span className="font-medium text-[var(--color-text-1)]">{orderNumber}</span>
          </p>
        )}
        <p className="text-sm text-[var(--color-text-2)]">
          Your order has been confirmed. We&apos;ll prepare it for delivery.
        </p>
        <Button variant="primary" size="lg" onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1240px] px-4 md:px-8 py-12">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-12 lg:flex-row lg:gap-16 lg:items-start"
      >
        {/* ── Left: Billing Details ────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <h2 className="mb-8 text-2xl font-semibold text-[var(--color-text-1)]">
            Billing Details
          </h2>

          <div className="flex flex-col gap-6">
            <Field label="First Name" name="firstName" required value={form.firstName} onChange={handleChange} />
            <Field label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
            <Field label="Street Address" name="streetAddress" required value={form.streetAddress} onChange={handleChange} />
            <Field
              label="Apartment, floor, etc. (optional)"
              name="apartment"
              value={form.apartment}
              onChange={handleChange}
            />
            <Field label="Town/City" name="townCity" required value={form.townCity} onChange={handleChange} />
            <Field label="State / Province" name="state" required value={form.state} onChange={handleChange} />
            <Field label="Postal Code" name="postalCode" required value={form.postalCode} onChange={handleChange} />
            <Field label="Country" name="country" required value={form.country} onChange={handleChange} />
            <Field label="Phone Number" name="phoneNumber" type="tel" required value={form.phoneNumber} onChange={handleChange} />
            <Field
              label="Email Address"
              name="emailAddress"
              type="email"
              required
              value={form.emailAddress}
              onChange={handleChange}
            />

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-[var(--color-primary-btn)] rounded"
              />
              <span className="text-sm text-[var(--color-text-1)]">
                Save this information for faster check-out next time
              </span>
            </label>
          </div>
        </div>

        {/* ── Right: Order Summary ─────────────────────────────── */}
        <div className="w-full lg:w-[420px] lg:shrink-0 flex flex-col gap-6">
          {/* Product list */}
          {items.length === 0 ? (
            <p className="text-sm text-[var(--color-text-2)]">Your cart is empty.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[var(--color-secondary)]">
                      <Image
                        src={item.imageUrl || "/products/p1.webp"}
                        alt={item.productName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="text-sm text-[var(--color-text-1)]">{item.productName}</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-1)] whitespace-nowrap">
                    {formatLkr(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="flex flex-col gap-4 border-t border-[var(--color-text-2)]/20 pt-5">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-text-1)]">Subtotal:</span>
              <span className="text-sm font-medium">{formatLkr(totalAmount)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Discount ({appliedCoupon.code}):</span>
                <span className="text-sm font-medium">-{formatLkr(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--color-text-2)]/20 pt-4">
              <span className="text-sm text-[var(--color-text-1)]">Shipping:</span>
              <span className="text-sm font-medium">Free</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-text-2)]/20 pt-4">
              <span className="text-sm text-[var(--color-text-1)]">Total:</span>
              <span className="text-sm font-semibold">{formatLkr(finalAmount)}</span>
            </div>
          </div>

          {/* Payment methods */}
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="h-4 w-4 cursor-pointer accent-[var(--color-text-1)]"
                />
                <span className="text-sm font-medium text-[var(--color-text-1)]">Bank</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { label: "bKash", bg: "#e2136e" },
                  { label: "VISA", bg: "#1a1f71" },
                  { label: "MC", bg: "#eb001b" },
                  { label: "Nagad", bg: "#f26522" },
                ].map(({ label, bg }) => (
                  <span
                    key={label}
                    style={{ backgroundColor: bg }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="h-4 w-4 cursor-pointer accent-[var(--color-text-1)]"
              />
              <span className="text-sm font-medium text-[var(--color-text-1)]">Cash on delivery</span>
            </label>
          </div>

          {/* Coupon */}
          <div className="flex flex-col gap-2">
            {appliedCoupon ? (
              <div className="flex items-center gap-3 rounded border border-green-400 bg-green-50 px-4 py-3">
                <span className="text-sm font-medium text-green-700">
                  Coupon <strong>{appliedCoupon.code}</strong> applied
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(removeCoupon())}
                  className="ml-auto cursor-pointer text-green-600 hover:text-green-800"
                  aria-label="Remove coupon"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const code = couponInput.trim();
                      if (code) dispatch(applyCoupon(code));
                    }
                  }}
                  className="h-12 flex-1 rounded border border-[var(--color-text-1)] px-4 text-sm placeholder:text-[var(--color-text-2)] outline-none focus:ring-2 focus:ring-[var(--color-primary-btn)]/30"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={couponStatus === "loading"}
                  onClick={() => {
                    const code = couponInput.trim();
                    if (code) dispatch(applyCoupon(code));
                  }}
                >
                  {couponStatus === "loading" ? "Applying…" : "Apply Coupon"}
                </Button>
              </div>
            )}
            {couponError && (
              <p className="text-sm text-[var(--color-primary-btn)]">{couponError}</p>
            )}
          </div>

          {/* Error banner */}
          {orderStatus === "error" && orderError && (
            <div className="flex items-center gap-3 rounded border border-red-300 bg-red-50 px-4 py-3">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{orderError}</p>
            </div>
          )}

          {/* Place Order */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-fit"
            disabled={orderStatus === "loading" || items.length === 0}
          >
            {orderStatus === "loading" ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Placing Order…
              </span>
            ) : paymentMethod === "bank" ? (
              "Proceed to Payment"
            ) : (
              "Place Order"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}

// ── Shared field component ────────────────────────────────────────────────────
function Field({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-[var(--color-text-1)]">
        {label}
        {required && <span className="text-[var(--color-primary-btn)] ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded bg-[var(--color-secondary)] px-4 text-sm text-[var(--color-text-1)] outline-none focus:ring-2 focus:ring-[var(--color-primary-btn)]/30"
      />
    </div>
  );
}
