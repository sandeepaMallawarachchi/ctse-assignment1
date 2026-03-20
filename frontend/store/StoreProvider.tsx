"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { ReactNode, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { clearToken, loadTokenFromStorage } from "./authSlice";
import { fetchCart } from "./cartSlice";
import { ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/components/ui/toast";
import { getJwtExpirationTime } from "@/lib/jwt";

/** Runs once on mount: hydrate auth token from localStorage, then load cart. */
function CartInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // loadTokenFromStorage is synchronous – state is updated before fetchCart reads it
    dispatch(loadTokenFromStorage());
    dispatch(fetchCart());
  }, [dispatch]);

  return null;
}

function SessionMonitor() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const hasShownExpiryToast = useRef(false);

  useEffect(() => {
    if (!token) {
      hasShownExpiryToast.current = false;
      return;
    }

    const expiresAt = getJwtExpirationTime(token);
    if (!expiresAt) {
      return;
    }

    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      dispatch(clearToken());
      if (!hasShownExpiryToast.current) {
        hasShownExpiryToast.current = true;
        showToast({
          title: "Session expired",
          description: "Your session has expired. Please sign in again.",
          variant: "info",
        });
      }
      return;
    }

    hasShownExpiryToast.current = false;

    const timeoutId = window.setTimeout(() => {
      dispatch(clearToken());
      showToast({
        title: "Session expired",
        description: "Your session has expired. Please sign in again.",
        variant: "info",
      });
      hasShownExpiryToast.current = true;
    }, remainingMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, showToast, token]);

  return null;
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <CartInitializer />
        <SessionMonitor />
        {children}
      </ToastProvider>
    </Provider>
  );
}
