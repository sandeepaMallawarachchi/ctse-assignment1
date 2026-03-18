const sampleOrders = [
  { id: "#EX-2301", customer: "Ava Thompson", total: "$320", state: "Packed" },
  { id: "#EX-2302", customer: "Noah Silva", total: "$180", state: "Pending" },
  { id: "#EX-2303", customer: "Mia Patel", total: "$760", state: "Shipped" },
] as const;

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Fulfillment</p>
        <h1 className="mt-3 text-[var(--color-text-1)]">Orders</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
          Sample order tracking cards for the admin workspace. These are placeholders until the order service is connected.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sampleOrders.map((order) => (
          <article key={order.id} className="rounded-[24px] border border-black/8 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-2)]">Order</p>
            <h2 className="mt-3 text-xl font-semibold">{order.id}</h2>
            <p className="mt-4 text-sm text-[var(--color-text-2)]">Customer</p>
            <p className="mt-1">{order.customer}</p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-2)]">Total</p>
                <p className="mt-1 font-medium">{order.total}</p>
              </div>
              <span className="rounded-full bg-[var(--color-secondary-2)] px-3 py-1 text-xs font-medium text-[var(--color-primary-btn)]">
                {order.state}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
