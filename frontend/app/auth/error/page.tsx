"use client";

import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-text-1)]">Google sign-in failed</h1>
        <p className="mt-3 text-sm text-[var(--color-text-2)]">
          We could not complete authentication. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded bg-[var(--color-primary-btn)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-btn-hover)]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
