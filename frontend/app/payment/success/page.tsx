"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGetPaymentStatus, type PaymentStatusResponse } from "@/lib/paymentApi";

export default function PaymentSuccessPage() {
  const [pendingOrderId] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("pendingPaymentOrderId") : null
  );
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(pendingOrderId));
  const [error, setError] = useState<string | null>(
    pendingOrderId ? null : "Payment completed, but no local order reference was found."
  );

  useEffect(() => {
    if (!pendingOrderId) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 6;

    const loadStatus = async () => {
      try {
        const status = await apiGetPaymentStatus(pendingOrderId);
        setPayment(status);
        if (status.status === "COMPLETED" || attempts >= maxAttempts) {
          setLoading(false);
          sessionStorage.removeItem("pendingPaymentOrderId");
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment status.");
        setLoading(false);
        return;
      }

      attempts += 1;
      window.setTimeout(loadStatus, 1500);
    };

    void loadStatus();
  }, [pendingOrderId]);

  return (
    <section className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-4 py-24 text-center md:px-8">
      {loading ? (
        <>
          <Loader2 size={56} className="animate-spin text-[var(--color-primary-btn)]" />
          <h2 className="text-2xl font-semibold text-[var(--color-text-1)]">Verifying Payment</h2>
          <p className="max-w-md text-sm text-[var(--color-text-2)]">
            Your payment was returned successfully. We are confirming the transaction with PayHere.
          </p>
        </>
      ) : payment?.status === "COMPLETED" ? (
        <>
          <CheckCircle className="text-green-500" size={64} />
          <h2 className="text-2xl font-semibold text-[var(--color-text-1)]">Payment Successful</h2>
          <p className="text-sm text-[var(--color-text-2)]">
            Order reference: <span className="font-medium text-[var(--color-text-1)]">{payment.orderId}</span>
          </p>
          <p className="max-w-md text-sm text-[var(--color-text-2)]">
            Your payment has been confirmed and the order is now being processed.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-[var(--color-text-1)]">Payment Pending</h2>
          <p className="max-w-md text-sm text-[var(--color-text-2)]">
            {error || payment?.statusMessage || "We have not received final confirmation from PayHere yet."}
          </p>
        </>
      )}

      <div className="flex gap-3">
        <Link href="/products">
          <Button variant="primary" size="lg">Continue Shopping</Button>
        </Link>
        <Link href="/profile">
          <Button variant="secondary" size="lg">View Profile</Button>
        </Link>
      </div>
    </section>
  );
}
