"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-4 py-24 text-center md:px-8">
      <XCircle className="text-[var(--color-primary-btn)]" size={64} />
      <h2 className="text-2xl font-semibold text-[var(--color-text-1)]">Payment Cancelled</h2>
      <p className="max-w-md text-sm text-[var(--color-text-2)]">
        Your PayHere payment was cancelled before completion. You can return to checkout and try again when ready.
      </p>
      <div className="flex gap-3">
        <Link href="/checkout">
          <Button variant="primary" size="lg">Back to Checkout</Button>
        </Link>
        <Link href="/cart">
          <Button variant="secondary" size="lg">View Cart</Button>
        </Link>
      </div>
    </section>
  );
}
