"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeCartItem, updateCartItem, clearCartThunk, applyCoupon, removeCoupon } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { formatLkr } from "@/lib/currency";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const totalAmount = useAppSelector((state) => state.cart.totalAmount);
  const appliedCoupon = useAppSelector((state) => state.cart.appliedCoupon);
  const couponStatus = useAppSelector((state) => state.cart.couponStatus);
  const couponError = useAppSelector((state) => state.cart.couponError);
  const status = useAppSelector((state) => state.cart.status);

  const [couponInput, setCouponInput] = useState("");

  const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : totalAmount;

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    if (code) dispatch(applyCoupon(code));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-sm text-[var(--color-text-2)]">Loading cart…</span>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1240px] px-4 md:px-8 py-12">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-24">
          <p className="text-lg text-[var(--color-text-2)]">Your cart is empty.</p>
          <Link href="/products">
            <Button variant="primary">Return To Shop</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Table */}
          <div className="overflow-x-auto rounded shadow-sm">
            <table className="w-full min-w-[600px] border-collapse bg-white">
              <thead>
                <tr className="shadow-sm">
                  {["Product", "Price", "Quantity", "Subtotal"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-5 text-left text-sm font-medium text-[var(--color-text-1)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-t border-[var(--color-secondary)]"
                  >
                    {/* Product */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => dispatch(removeCartItem(item.productId))}
                            className="absolute -top-2 -left-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary-btn)] text-white hover:bg-[var(--color-primary-btn-hover)] transition-colors"
                            aria-label={`Remove ${item.productName}`}
                          >
                            <X size={11} />
                          </button>
                          <div className="relative h-16 w-16 overflow-hidden rounded bg-[var(--color-secondary)]">
                            <Image
                              src={item.imageUrl || "/products/p1.webp"}
                              alt={item.productName}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-1)]">
                          {item.productName}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-5 text-sm text-[var(--color-text-1)]">
                      {formatLkr(item.price)}
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-5">
                      <div className="flex items-center border border-[var(--color-text-2)]/30 rounded w-fit">
                        <span className="px-3 py-2 text-sm font-medium text-[var(--color-text-1)] min-w-[40px] text-center">
                          {String(item.quantity).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col border-l border-[var(--color-text-2)]/30">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateCartItem({
                                  productId: item.productId,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="px-2 py-0.5 cursor-pointer text-xs text-[var(--color-text-2)] hover:text-[var(--color-text-1)] leading-none"
                            aria-label="Increase quantity"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateCartItem({
                                  productId: item.productId,
                                  quantity: item.quantity - 1,
                                })
                              )
                            }
                            className="px-2 py-0.5 cursor-pointer text-xs text-[var(--color-text-2)] hover:text-[var(--color-text-1)] leading-none border-t border-[var(--color-text-2)]/30"
                            aria-label="Decrease quantity"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="px-6 py-5 text-sm font-medium text-[var(--color-text-1)]">
                      {formatLkr(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link href="/products">
              <Button variant="secondary" size="lg">
                Return To Shop
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => dispatch(clearCartThunk())}
            >
              Update Cart
            </Button>
          </div>

          {/* Bottom Section */}
          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-start">
            {/* Coupon */}
            <div className="flex flex-col gap-2">
              {appliedCoupon ? (
                <div className="flex items-center gap-3 rounded border border-green-400 bg-green-50 px-4 py-3">
                  <span className="text-sm font-medium text-green-700">
                    Coupon <strong>{appliedCoupon.code}</strong> applied — you save {formatLkr(appliedCoupon.discountAmount)}
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
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="h-14 w-64 rounded border border-[var(--color-text-1)] px-4 text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-2)] outline-none focus:ring-2 focus:ring-[var(--color-primary-btn)]/30"
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleApplyCoupon}
                    disabled={couponStatus === "loading"}
                  >
                    {couponStatus === "loading" ? "Applying…" : "Apply Coupon"}
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-sm text-[var(--color-primary-btn)]">{couponError}</p>
              )}
            </div>

            {/* Cart Total */}
            <div className="w-full max-w-sm rounded border border-[var(--color-text-1)]/20 p-6">
              <h3 className="mb-5 text-xl font-semibold text-[var(--color-text-1)]">
                Cart Total
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-[var(--color-text-2)]/30 pb-4">
                  <span className="text-sm text-[var(--color-text-1)]">Subtotal:</span>
                  <span className="text-sm font-medium text-[var(--color-text-1)]">
                    {formatLkr(totalAmount)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between border-b border-[var(--color-text-2)]/30 pb-4 text-green-600">
                    <span className="text-sm">Discount ({appliedCoupon.code}):</span>
                    <span className="text-sm font-medium">
                      -{formatLkr(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b border-[var(--color-text-2)]/30 pb-4">
                  <span className="text-sm text-[var(--color-text-1)]">Shipping:</span>
                  <span className="text-sm font-medium text-[var(--color-text-1)]">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-1)]">Total:</span>
                  <span className="text-sm font-semibold text-[var(--color-text-1)]">
                    {formatLkr(finalAmount)}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Link href="/checkout">
                  <Button variant="primary" size="lg">
                    Procees to checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
