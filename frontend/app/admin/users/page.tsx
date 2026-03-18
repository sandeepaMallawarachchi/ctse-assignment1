"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import {
  apiActivateAdminUser,
  apiDeactivateAdminUser,
  apiDeleteAdminUser,
  apiGetAdminUsers,
  type AdminUserResponse,
} from "@/lib/authApi";

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
      status: user.active ? "Active" : "Deactivated",
    };
  });
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUserRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ROLE_ADMIN" | "ROLE_USER">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Deactivated">("ALL");

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

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...users]
      .sort((a, b) => {
        const aTime = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
        const bTime = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
        return bTime - aTime;
      })
      .filter((user) => {
        const matchesQuery =
          query.length === 0 ||
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query);
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

        return matchesQuery && matchesRole && matchesStatus;
      });
  }, [roleFilter, searchQuery, statusFilter, users]);

  async function handleDeactivate(userId: string) {
    const target = users.find((user) => user.id === userId);
    if (!target || !token) return;

    if (target.status === "Deactivated") {
      showToast({
        title: "User already deactivated",
        description: `${target.name} is already deactivated.`,
        variant: "info",
      });
      return;
    }

    try {
      const updated = await apiDeactivateAdminUser(token, userId);
      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? { ...user, status: updated.active ? "Active" : "Deactivated" }
            : user
        )
      );

      showToast({
        title: "User deactivated",
        description: `${target.name} can no longer log in.`,
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to deactivate user.";
      showToast({
        title: "Deactivate failed",
        description: message,
        variant: "error",
      });
    }
  }

  async function handleActivate(userId: string) {
    const target = users.find((user) => user.id === userId);
    if (!target || !token) return;

    if (target.status === "Active") {
      showToast({
        title: "User already active",
        description: `${target.name} is already active.`,
        variant: "info",
      });
      return;
    }

    try {
      const updated = await apiActivateAdminUser(token, userId);
      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? { ...user, status: updated.active ? "Active" : "Deactivated" }
            : user
        )
      );

      showToast({
        title: "User activated",
        description: `${target.name} can log in again.`,
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to activate user.";
      showToast({
        title: "Activate failed",
        description: message,
        variant: "error",
      });
    }
  }

  async function handleDelete(userId: string) {
    const target = users.find((user) => user.id === userId);
    if (!target || !token) return;

    try {
      await apiDeleteAdminUser(token, userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
      showToast({
        title: "User deleted",
        description: `${target.name} was removed from the system.`,
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user.";
      showToast({
        title: "Delete failed",
        description: message,
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Accounts</p>
        <h1 className="mt-3 text-[var(--color-text-1)]">Users</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
          Live user list from the auth service with real deactivate and delete actions.
        </p>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 md:p-6">
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-2)]">{summaryLabel}</p>
            {error ? (
              <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                Load failed
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className="h-11 rounded-lg border border-black/10 bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition focus:border-[var(--color-primary-btn)]"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "ALL" | "ROLE_ADMIN" | "ROLE_USER")}
              className="h-11 rounded-lg border border-black/10 bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition focus:border-[var(--color-primary-btn)]"
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_ADMIN">Admins</option>
              <option value="ROLE_USER">Users</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "Active" | "Deactivated")}
              className="h-11 rounded-lg border border-black/10 bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition focus:border-[var(--color-primary-btn)]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
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
            {filteredUsers.map((user) => (
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
                    <p className="text-xs tracking-[0.14em] text-[var(--color-text-2)]">
                      Connected With System On
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-text-1)]">
                      {formatJoinedDate(user.joinedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {user.status === "Active" ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(user.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--color-text-1)] transition hover:bg-[var(--color-secondary)]"
                      >
                        <Ban size={16} />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(user.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Ban size={16} />
                        Activate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPendingDeleteUser(user)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary-btn)]/25 bg-[var(--color-primary-btn)]/6 px-4 py-2 text-sm font-medium text-[var(--color-primary-btn)] transition hover:bg-[var(--color-primary-btn)]/12"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 ? (
              <div className="rounded-lg bg-[var(--color-secondary)] px-4 py-8 text-center text-sm text-[var(--color-text-2)]">
                No users match the current search or filters.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {pendingDeleteUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Confirm Delete</p>
            <h2 className="mt-3 text-[var(--color-text-1)]">Delete user account?</h2>
            <p className="mt-3 text-sm text-[var(--color-text-2)]">
              Are you sure you want to delete <span className="font-medium text-[var(--color-text-1)]">{pendingDeleteUser.name}</span>?
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-2)]">
              This user will no longer be able to log in.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteUser(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
              >
                No
              </button>
              <button
                type="button"
                onClick={async () => {
                  const userToDelete = pendingDeleteUser;
                  setPendingDeleteUser(null);
                  if (userToDelete) {
                    await handleDelete(userToDelete.id);
                  }
                }}
                className="rounded-lg border border-[var(--color-primary-btn)]/25 bg-[var(--color-primary-btn)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-btn-hover)]"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
