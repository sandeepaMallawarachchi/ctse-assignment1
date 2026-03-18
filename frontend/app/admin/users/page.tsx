const sampleUsers = [
  { name: "Admin Sarah", email: "sarah@example.com", role: "ROLE_ADMIN" },
  { name: "John Carter", email: "john@example.com", role: "ROLE_USER" },
  { name: "Emma Blake", email: "emma@example.com", role: "ROLE_USER" },
] as const;

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Accounts</p>
        <h1 className="mt-3 text-[var(--color-text-1)]">Users</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
          Sample user management list that will later read from the auth-service admin APIs.
        </p>
      </div>

      <div className="rounded-[28px] border border-black/8 bg-white p-4 md:p-6">
        <div className="grid gap-4">
          {sampleUsers.map((user) => (
            <div key={user.email} className="flex flex-col gap-4 rounded-2xl border border-black/6 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-[var(--color-text-1)]">{user.name}</p>
                <p className="mt-1 text-sm text-[var(--color-text-2)]">{user.email}</p>
              </div>
              <span className="inline-flex rounded-full bg-[var(--color-secondary)] px-3 py-1 text-xs font-medium text-[var(--color-text-2)]">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
