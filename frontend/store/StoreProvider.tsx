"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { ReactNode, useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { loadTokenFromStorage } from "./authSlice";
import { fetchCart } from "./cartSlice";

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

export default function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <CartInitializer />
      {children}
    </Provider>
  );
}
