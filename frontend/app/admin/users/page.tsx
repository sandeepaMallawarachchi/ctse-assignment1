"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import { apiGetAdminUsers, type AdminUserResponse } from "@/lib/authApi";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string | null;
  status: "Active" | "Deactivated";
};

function formatJoinedDate(value: string | null) {
  if (!value) return "Unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mapUsers(users: AdminUserResponse[]): AdminUserRow[] {
  return users.map((user) => {
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
    const primaryRole = user.roles?.includes("ROLE_ADMIN") ? "ROLE_ADMIN" : (user.roles?.[0] ?? "ROLE_USER");

    return {
      id: user.id,
      name,
      email: user.email,
      role: primaryRole,
      joinedAt: user.createdAt ?? null,
      status: "Active",
    };
  });
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      if (!token) {
        if (active) {
          setUsers([]);
          setLoading(false);
          setError("Missing authentication token.");
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiGetAdminUsers(token);
        if (!active) return;
        setUsers(mapUsers(data));
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Failed to load users.";
        setError(message);
        showToast({
          title: "Failed to load users",
          description: message,
          variant: "error",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [showToast, token]);

  const summaryLabel = useMemo(() => {
    if (loading) return "Loading users...";
    if (error) return "Could not load users";
    return `${users.length} user${users.length === 1 ? "" : "s"} from the database`;
  }, [error, loading, users.length]);

  function handleDeactivate(userId: string) {
    const target = users.find((user) => user.id === userId);
    if (!target) return;

    if (target.status === "Deactivated") {
      showToast({
        title: "User already deactivated",
        description: `${target.name} is already marked as deactivated in this frontend view.`,
        variant: "info",
      });
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, status: "Deactivated" } : user
      )
    );

    showToast({
      title: "User deactivated",
      description: `${target.name} was marked as deactivated locally. Backend integration is pending.`,
      variant: "success",
    });
  }

  function handleDelete(userId: string) {
    const target = users.find((user) => user.id === userId);
    if (!target) return;

    setUsers((current) => current.filter((user) => user.id !== userId));
    showToast({
      title: "User removed from list",
      description: `${target.name} was removed locally. Backend delete is not connected yet.`,
      variant: "success",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Accounts</p>
        <h1 className="mt-3 text-[var(--color-text-1)]">Users</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
          Live user list from the auth service. Deactivate and delete actions remain frontend-only placeholders for now.
        </p>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-2)]">{summaryLabel}</p>
          {error ? (
            <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              Load failed
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-lg bg-[var(--color-secondary)] px-4 py-8 text-center text-sm text-[var(--color-text-2)]">
            Loading users from the system...
          </div>
        ) : error ? (
          <div className="rounded-lg bg-[var(--color-secondary)] px-4 py-8 text-center text-sm text-[var(--color-text-2)]">
            {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-5 rounded-lg border border-black/10 px-4 py-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-text-1)]">{user.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-2)]">{user.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-lg bg-[var(--color-secondary)] px-3 py-1 text-xs font-medium text-[var(--color-text-2)]">
                      {user.role}
                    </span>
                    <span
                      className={`inline-flex rounded-lg px-3 py-1 text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-black/5 text-[var(--color-text-2)]"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">
                      Connected With System On
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-text-1)]">
                      {formatJoinedDate(user.joinedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleDeactivate(user.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--color-text-1)] transition hover:bg-[var(--color-secondary)]"
                    >
                      <Ban size={16} />
                      Deactivate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary-btn)]/25 bg-[var(--color-primary-btn)]/6 px-4 py-2 text-sm font-medium text-[var(--color-primary-btn)] transition hover:bg-[var(--color-primary-btn)]/12"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 ? (
              <div className="rounded-lg bg-[var(--color-secondary)] px-4 py-8 text-center text-sm text-[var(--color-text-2)]">
                No users were returned by the system.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
