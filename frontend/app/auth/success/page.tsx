"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { fetchAuthFromCookie } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";

export default function AuthSuccessPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function completeGoogleLogin() {
      const result = await dispatch(fetchAuthFromCookie());

      if (!active) return;

      if (fetchAuthFromCookie.fulfilled.match(result)) {
        await dispatch(fetchCart());
        router.replace("/");
        return;
      }

      router.replace("/auth/error");
    }

    void completeGoogleLogin();

    return () => {
      active = false;
    };
  }, [dispatch, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-[var(--color-text-2)]">Signing you in with Google...</p>
    </main>
  );
}
