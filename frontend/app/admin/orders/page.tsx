"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { formatLkr } from "@/lib/currency";
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  type OrderResponse,
} from "@/lib/orderApi";

const ORDER_STATUSES = ["CONFIRMED", "SHIPPED", "DELIVERED"] as const;

const STATUS_STYLES: Record<string, string> = {
  CREATED:   "bg-blue-50   text-blue-700   border-blue-200",
  PAID:      "bg-purple-50 text-purple-700 border-purple-200",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SHIPPED:   "bg-orange-50 text-orange-700 border-orange-200",
  DELIVERED: "bg-green-50  text-green-700  border-green-200",
  CANCELLED: "bg-red-50    text-red-700    border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const token = useAppSelector((s) => s.auth.token);
  const { showToast } = useToast();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // orderId being updated

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGetAllOrders(token);
      setOrders(data);
    } catch (err: unknown) {
      showToast({ title: "Failed to load orders", description: (err as Error).message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(orderId: string, status: string) {
    if (!token) return;
    setUpdating(orderId);
    try {
      const updated = await adminUpdateOrderStatus(token, orderId, status);
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      showToast({ title: "Status updated", description: `Order set to ${status}`, variant: "success" });
    } catch (err: unknown) {
      showToast({ title: "Update failed", description: (err as Error).message, variant: "error" });
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Fulfillment</p>
          <h1 className="mt-3 text-[var(--color-text-1)]">Orders</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
            Manage and update the status of all customer orders.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading} className="shrink-0 mt-3">
          <RefreshCw size={14} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-black/10 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[var(--color-text-2)]">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-sm text-[var(--color-text-2)]">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[var(--color-secondary)]">
                  {["Order #", "Customer", "Items", "Total", "Status", "Date", "Update Status"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-2)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="border-b border-black/10 last:border-0 hover:bg-[var(--color-secondary)]/40">
                    <td className="px-5 py-4 font-medium text-[var(--color-text-1)]">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-2)]">
                      <p className="font-medium text-[var(--color-text-1)]">
                        {order.shippingAddress?.fullName ?? "—"}
                      </p>
                      <p className="text-xs mt-0.5">{order.userEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-2)]">
                      {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-4 font-medium text-[var(--color-text-1)]">
                      {formatLkr(Number(order.totalAmount))}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--color-text-2)]">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {updating === order.orderId ? (
                        <Loader2 size={16} className="animate-spin text-[var(--color-text-2)]" />
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          disabled={order.status === "CANCELLED" || order.status === "DELIVERED"}
                          className="cursor-pointer rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs text-[var(--color-text-1)] outline-none focus:ring-2 focus:ring-[var(--color-primary-btn)]/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value={order.status}>{order.status}</option>
                          {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && orders.length > 0 && (
        <p className="text-xs text-[var(--color-text-2)]">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
      )}
    </div>
  );
}
