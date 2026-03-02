"use client";

import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-text-1)] shadow transition hover:bg-black hover:text-white"
    >
      <ArrowUp size={24} />
    </button>
  );
}
