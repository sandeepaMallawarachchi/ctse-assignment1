"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";
import { GOOGLE_AUTH_URL } from "@/lib/authApi";
import { hasAdminRole } from "@/lib/authRoles";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();

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
      showToast({
        title: "Login successful",
        description: `Welcome back, ${result.payload.firstName}.`,
        variant: "success",
      });
      router.push(hasAdminRole(result.payload.roles) ? "/admin" : "/");
    } else {
      const message = (result.payload as string) || "Login failed. Please try again.";
      setError(message);
      showToast({
        title: "Login failed",
        description: message,
        variant: "error",
      });
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-auto ">
      <div className="flex w-full max-w-screen overflow-hidden rounded-lg px-20 ">
        {/* Left illustration panel */}
        <div className="hidden lg:flex lg:w-1/2 min-h-[68vh] items-center justify-center p-12"
         style={{ 
          backgroundImage: 'url(/signin.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat',
        }}
         >
        
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/3 bg-white px-4 py-12 flex flex-col justify-center">
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
                placeholder="Email"
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
            <button
              type="button"
              onClick={() => {
                window.location.href = GOOGLE_AUTH_URL;
              }}
              className="flex h-[56px] w-full items-center justify-center gap-3 rounded border border-black/20 text-sm text-[var(--color-text-1)] hover:bg-[var(--color-secondary)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>
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
