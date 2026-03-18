"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Shield,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearToken, logoutUser } from "@/store/authSlice";
import { hasAdminRole } from "@/lib/authRoles";
import { useToast } from "@/components/ui/toast";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const auth = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const isAdmin = useMemo(() => hasAdminRole(auth.user?.roles), [auth.user?.roles]);

  useEffect(() => {
    if (!auth.hydrated) return;

    if (!auth.isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [auth.hydrated, auth.isAuthenticated, isAdmin, router]);

  async function handleLogout() {
    const result = await dispatch(logoutUser());
    dispatch(clearToken());
    showToast({
      title: logoutUser.fulfilled.match(result) ? "Logged out" : "Logout completed locally",
      description: logoutUser.fulfilled.match(result)
        ? "Your admin session has been cleared."
        : ((result.payload as string) || "Server logout did not complete, but local session was cleared."),
      variant: logoutUser.fulfilled.match(result) ? "success" : "info",
    });
    router.replace("/login");
  }

  if (!auth.hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ec] px-4">
        <p className="text-sm text-[var(--color-text-2)]">Loading admin dashboard...</p>
      </main>
    );
  }

  if (!auth.isAuthenticated || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ec] px-4">
        <p className="text-sm text-[var(--color-text-2)]">Checking access...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ec] text-[var(--color-text-1)]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[var(--color-text-1)] lg:hidden"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary-btn)] text-white shadow-[0_14px_32px_rgba(219,68,68,0.25)]">
                <Shield size={20} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-primary-btn)]">Admin Panel</p>
                <p className="text-sm font-semibold">Exclusive Control Center</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-[#f7f4ec] px-4 py-2 text-sm md:block">
              Signed in as <span className="font-medium">{auth.user?.fullName}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-[#f7f4ec]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-81px)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-[81px] left-0 z-30 w-[280px] border-r border-black/10 bg-[#121212] px-5 py-6 text-white transition-transform lg:static lg:translate-x-0`}>
          <div className="rounded-3xl bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Workspace</p>
            <h2 className="mt-3 text-xl font-semibold">Admin Dashboard</h2>
            <p className="mt-2 text-sm text-white/70">
              Sample frontend shell with separate navigation, ready for backend integration.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-[var(--color-primary-btn)] text-white shadow-[0_16px_32px_rgba(219,68,68,0.3)]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#121212]">
                <Package size={18} />
              </span>
              <div>
                <p className="text-sm font-medium">Mode</p>
                <p className="text-xs text-white/60">Demo data only</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Product, order, and user cards here are sample placeholders until backend modules are connected.
            </p>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/35 lg:hidden"
          />
        )}

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
