"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { formatLkr } from "@/lib/currency";
import {
  adminGetAllCoupons,
  adminCreateCoupon,
  adminDeactivateCoupon,
  type CouponResponse,
  type CouponType,
} from "@/lib/orderApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatValue(coupon: CouponResponse) {
  return coupon.type === "PERCENTAGE"
    ? `${coupon.value}%`
    : formatLkr(coupon.value);
}

function couponStatus(coupon: CouponResponse) {
  if (!coupon.active) return { label: "Inactive", cls: "bg-red-50 text-red-700 border-red-200" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return { label: "Expired", cls: "bg-gray-50 text-gray-600 border-gray-200" };
  if (coupon.maxUsageCount > 0 && coupon.usageCount >= coupon.maxUsageCount)
    return { label: "Exhausted", cls: "bg-orange-50 text-orange-700 border-orange-200" };
  return { label: "Active", cls: "bg-green-50 text-green-700 border-green-200" };
}

const emptyForm = {
  code: "",
  type: "PERCENTAGE" as CouponType,
  value: "",
  minOrderAmount: "0",
  maxUsageCount: "0",
  expiresAt: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const token = useAppSelector((s) => s.auth.token);
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGetAllCoupons(token);
      setCoupons(data);
    } catch (err: unknown) {
      showToast({ title: "Failed to load coupons", description: (err as Error).message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const created = await adminCreateCoupon(token, {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        maxUsageCount: parseInt(form.maxUsageCount) || 0,
        expiresAt: form.expiresAt ? form.expiresAt + ":00" : null,
      });
      setCoupons((prev) => [created, ...prev]);
      showToast({ title: "Coupon created", description: `${created.code} is now active`, variant: "success" });
      setShowModal(false);
      setForm(emptyForm);
    } catch (err: unknown) {
      showToast({ title: "Failed to create coupon", description: (err as Error).message, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(coupon: CouponResponse) {
    if (!token) return;
    setDeactivating(coupon.id);
    try {
      const updated = await adminDeactivateCoupon(token, coupon.id);
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
      showToast({ title: "Coupon deactivated", description: `${coupon.code} has been deactivated`, variant: "info" });
    } catch (err: unknown) {
      showToast({ title: "Failed to deactivate", description: (err as Error).message, variant: "error" });
    } finally {
      setDeactivating(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Promotions</p>
          <h1 className="mt-3 text-[var(--color-text-1)]">Coupons</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
            Create and manage discount coupons for customers.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-3 shrink-0">
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus size={14} className="mr-2" />
            New Coupon
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-black/10 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[var(--color-text-2)]">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading coupons…</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center text-sm text-[var(--color-text-2)]">
            No coupons yet.{" "}
            <button type="button" className="cursor-pointer text-[var(--color-primary-btn)] underline" onClick={() => setShowModal(true)}>
              Create one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[var(--color-secondary)]">
                  {["Code", "Type", "Value", "Min Order", "Usage", "Expires", "Status", "Action"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-2)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const { label, cls } = couponStatus(coupon);
                  return (
                    <tr key={coupon.id} className="border-b border-black/10 last:border-0 hover:bg-[var(--color-secondary)]/40">
                      <td className="px-5 py-4 font-mono font-semibold text-[var(--color-text-1)]">
                        {coupon.code}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-2)]">
                        {coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
                      </td>
                      <td className="px-5 py-4 font-medium text-[var(--color-text-1)]">
                        {formatValue(coupon)}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-2)]">
                        {Number(coupon.minOrderAmount) > 0 ? formatLkr(coupon.minOrderAmount) : "—"}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-2)]">
                        {coupon.usageCount}
                        {coupon.maxUsageCount > 0 ? ` / ${coupon.maxUsageCount}` : " / ∞"}
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--color-text-2)]">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${cls}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {coupon.active ? (
                          deactivating === coupon.id ? (
                            <Loader2 size={16} className="animate-spin text-[var(--color-text-2)]" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(coupon)}
                              className="cursor-pointer rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Deactivate
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-[var(--color-text-2)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && coupons.length > 0 && (
        <p className="text-xs text-[var(--color-text-2)]">
          {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total
        </p>
      )}

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-black/10 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text-1)]">New Coupon</h2>
              <button
                type="button"
                onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="cursor-pointer rounded-full p-1.5 text-[var(--color-text-2)] hover:bg-[var(--color-secondary)] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <FormField label="Coupon Code *">
                <input
                  required
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="input-base"
                />
              </FormField>

              <FormField label="Type *">
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as CouponType }))}
                  className="input-base cursor-pointer"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (LKR)</option>
                </select>
              </FormField>

              <FormField label={form.type === "PERCENTAGE" ? "Discount % *" : "Discount Amount (LKR) *"}>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={form.type === "PERCENTAGE" ? "e.g. 10" : "e.g. 500"}
                  value={form.value}
                  onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  className="input-base"
                />
              </FormField>

              <FormField label="Minimum Order Amount (LKR)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0 = no minimum"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
                  className="input-base"
                />
              </FormField>

              <FormField label="Max Usage Count">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0 = unlimited"
                  value={form.maxUsageCount}
                  onChange={(e) => setForm((p) => ({ ...p, maxUsageCount: e.target.value }))}
                  className="input-base"
                />
              </FormField>

              <FormField label="Expires At (optional)">
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  className="input-base"
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => { setShowModal(false); setForm(emptyForm); }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Creating…
                    </span>
                  ) : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .input-base {
          width: 100%;
          height: 2.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(0,0,0,0.12);
          background: var(--color-secondary);
          padding: 0 1rem;
          font-size: 0.875rem;
          color: var(--color-text-1);
          outline: none;
        }
        .input-base:focus {
          box-shadow: 0 0 0 2px rgba(var(--color-primary-btn-rgb, 0,0,0), 0.15);
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-text-2)]">{label}</label>
      {children}
    </div>
  );
}
