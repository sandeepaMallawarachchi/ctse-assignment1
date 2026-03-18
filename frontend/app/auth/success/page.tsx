"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { fetchAuthFromCookie } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";
import { hasAdminRole } from "@/lib/authRoles";
import { useToast } from "@/components/ui/toast";

export default function AuthSuccessPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    async function completeGoogleLogin() {
      const result = await dispatch(fetchAuthFromCookie());

      if (!active) return;

      if (fetchAuthFromCookie.fulfilled.match(result)) {
        await dispatch(fetchCart());
        showToast({
          title: "Google login successful",
          description: `Signed in as ${result.payload.email}.`,
          variant: "success",
        });
        router.replace(hasAdminRole(result.payload.roles) ? "/admin" : "/");
        return;
      }

      showToast({
        title: "Google login failed",
        description: (result.payload as string) || "Could not complete Google sign-in.",
        variant: "error",
      });
      router.replace("/auth/error");
    }

    void completeGoogleLogin();

    return () => {
      active = false;
    };
  }, [dispatch, router, showToast]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-[var(--color-text-2)]">Signing you in with Google...</p>
    </main>
  );
}
