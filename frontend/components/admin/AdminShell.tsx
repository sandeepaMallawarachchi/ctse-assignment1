"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
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
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-text-1)]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[var(--color-primary)]">
        <div className="bg-[var(--color-primary-2)] text-white">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-8">
            <p className="w-full text-center text-sm">
              Centralized workspace for store operations, account oversight, and catalog administration
            </p>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-[var(--color-text-1)] lg:hidden"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/admin" className="flex items-center gap-4">
              <Image src="/logo.webp" alt="Exclusive" width={100} height={36} />
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-btn)]">Admin Panel</p>
                <p className="text-sm font-medium">Operations Dashboard</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-lg bg-[var(--color-secondary)] px-4 py-2 text-sm md:block">
              Signed in as <span className="font-medium">{auth.user?.fullName}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-secondary)]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-129px)] max-w-[1440px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-[129px] left-0 z-30 w-[280px] border-r border-black/10 bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0`}>
          <nav className="mt-8 space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm transition ${
                    active
                      ? "bg-[var(--color-primary-btn)] text-white"
                      : "text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </span>
                  <ChevronRight size={16} className={active ? "opacity-100" : "opacity-40"} />
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/35 lg:hidden"
          />
        )}

        <main className="bg-[var(--color-primary)] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
