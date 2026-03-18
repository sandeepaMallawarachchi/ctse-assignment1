import { ArrowUpRight, BarChart3, Package, ShoppingBag, Users } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "$128,430", delta: "+12.4%", icon: BarChart3 },
  { label: "Products", value: "1,248", delta: "+38", icon: Package },
  { label: "Orders", value: "326", delta: "+9.8%", icon: ShoppingBag },
  { label: "Users", value: "4,102", delta: "+184", icon: Users },
] as const;

const recentOrders = [
  { order: "#EX-2301", customer: "Ava Thompson", total: "$320", status: "Packed" },
  { order: "#EX-2302", customer: "Noah Silva", total: "$180", status: "Pending" },
  { order: "#EX-2303", customer: "Mia Patel", total: "$760", status: "Shipped" },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#111_0%,#2c2c2c_65%,#db4444_100%)] p-6 text-white md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/70">Overview</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Admin Dashboard</h1>
            <p className="mt-4 max-w-xl text-sm text-white/75 md:text-base">
              Separate admin workspace with sample KPIs, quick summaries, and route protection ready for backend integration.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Active window</p>
            <p className="mt-2 text-lg font-medium">Q1 Operations Review</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
        {stats.map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="rounded-[24px] border border-black/8 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-secondary-2)] text-[var(--color-primary-btn)]">
                <Icon size={20} />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f4ec] px-3 py-1 text-xs font-medium text-[var(--color-text-2)]">
                {delta}
                <ArrowUpRight size={14} />
              </span>
            </div>
            <p className="mt-6 text-sm text-[var(--color-text-2)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-1)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[28px] border border-black/8 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Orders</p>
              <h2 className="mt-3 text-[var(--color-text-1)]">Recent Activity</h2>
            </div>
            <span className="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-xs text-[var(--color-text-2)]">
              Sample feed
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-black/6">
            {recentOrders.map((item, index) => (
              <div
                key={item.order}
                className={`grid gap-3 px-5 py-4 md:grid-cols-4 ${index !== recentOrders.length - 1 ? "border-b border-black/6" : ""}`}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-2)]">Order</p>
                  <p className="mt-1 font-medium">{item.order}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-2)]">Customer</p>
                  <p className="mt-1">{item.customer}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-2)]">Total</p>
                  <p className="mt-1">{item.total}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-2)]">Status</p>
                  <p className="mt-1">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-black/8 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Notes</p>
          <h2 className="mt-3 text-[var(--color-text-1)]">Integration Queue</h2>
          <ul className="mt-6 space-y-4 text-sm text-[var(--color-text-2)]">
            <li className="rounded-2xl bg-[#f7f4ec] px-4 py-4">Connect product KPIs to catalog-service data.</li>
            <li className="rounded-2xl bg-[#f7f4ec] px-4 py-4">Replace recent orders list with cart-order-service feed.</li>
            <li className="rounded-2xl bg-[#f7f4ec] px-4 py-4">Add admin action forms after backend endpoints are ready.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
