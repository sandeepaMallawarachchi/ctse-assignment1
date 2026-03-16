"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchCart());
      router.push("/");
    } else {
      setError((result.payload as string) || "Login failed. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[900px] overflow-hidden rounded-lg shadow-sm border border-black/10">
        {/* Left illustration panel */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/signin.png"
            alt="Sign in illustration"
            fill
            className="object-cover"
          />
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 bg-white px-8 py-12 flex flex-col justify-center">
          <h2 className="mb-2 text-[var(--color-text-1)]">Log in to Exclusive</h2>
          <p className="mb-8 text-sm text-[var(--color-text-2)]">
            Enter your details below
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email or Phone Number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-b border-black/20 bg-transparent py-2 text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-2)] outline-none focus:border-[var(--color-primary-btn)] transition-colors"
              />
            </div>

            <div className="relative flex flex-col gap-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-b border-black/20 bg-transparent py-2 pr-10 text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-2)] outline-none focus:border-[var(--color-primary-btn)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-2 text-[var(--color-text-2)] hover:text-[var(--color-text-1)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-[var(--color-primary-btn)]">{error}</p>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="h-[56px] flex-1 rounded bg-[var(--color-primary-btn)] text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-btn-hover)] disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
              <Link
                href="#"
                className="text-sm text-[var(--color-primary-btn)] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-2)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--color-text-1)] underline underline-offset-2"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
