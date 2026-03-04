"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyCoupon, removeCoupon } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type PaymentMethod = "bank" | "cod";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const totalAmount = useAppSelector((state) => state.cart.totalAmount);
  const appliedCoupon = useAppSelector((state) => state.cart.appliedCoupon);
  const couponStatus = useAppSelector((state) => state.cart.couponStatus);
  const couponError = useAppSelector((state) => state.cart.couponError);

  const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : totalAmount;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [couponInput, setCouponInput] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    companyName: "",
    streetAddress: "",
    apartment: "",
    townCity: "",
    phoneNumber: "",
    emailAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: POST /api/orders to cart-order-service
    console.log("Order placed", { form, items, totalAmount, paymentMethod });
  };

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
            <Field label="Phone Number" name="phoneNumber" type="tel" required value={form.phoneNumber} onChange={handleChange} />
            <Field
              label="Email Address"
              name="emailAddress"
              type="email"
              required
              value={form.emailAddress}
              onChange={handleChange}
            />

            {/* Save info */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="h-5 w-5 accent-[var(--color-primary-btn)] rounded"
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
            <p className="text-sm text-[var(--color-text-2)]">
              Your cart is empty.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[var(--color-secondary)]">
                      <Image
                        src={item.imageUrl || "/products/p1.webp"}
                        alt={item.productName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="text-sm text-[var(--color-text-1)]">
                      {item.productName}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-1)] whitespace-nowrap">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="flex flex-col gap-4 border-t border-[var(--color-text-2)]/20 pt-5">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-text-1)]">Subtotal:</span>
              <span className="text-sm font-medium">${totalAmount.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Discount ({appliedCoupon.code}):</span>
                <span className="text-sm font-medium">
                  -${appliedCoupon.discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--color-text-2)]/20 pt-4">
              <span className="text-sm text-[var(--color-text-1)]">Shipping:</span>
              <span className="text-sm font-medium">Free</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-text-2)]/20 pt-4">
              <span className="text-sm text-[var(--color-text-1)]">Total:</span>
              <span className="text-sm font-semibold">${finalAmount.toLocaleString()}</span>
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
                  className="h-4 w-4 accent-[var(--color-text-1)]"
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
                className="h-4 w-4 accent-[var(--color-text-1)]"
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
                  className="ml-auto text-green-600 hover:text-green-800"
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

          {/* Place Order */}
          <Button type="submit" variant="primary" size="lg" className="w-fit">
            Place Order
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
        {required && (
          <span className="text-[var(--color-primary-btn)] ml-0.5">*</span>
        )}
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
