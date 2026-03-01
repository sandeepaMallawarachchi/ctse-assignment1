"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Categories from "./Categories";
import Hero from "./Hero";

export default function HeroSection() {
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);

  return (
    <section className="mx-auto max-w-[1240px] px-4 pt-3 md:px-8 md:pt-0">
      <div className="hidden gap-8 md:grid md:grid-cols-[280px_1fr]">
        <Categories />
        <Hero />
      </div>

      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => setIsCategoryPanelOpen(true)}
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded bg-black/65 px-3 py-2 text-white"
          aria-label="Open categories"
        >
          <Menu size={18} />
          Categories
        </button>

        <Hero />

        <div
          className={`fixed inset-0 z-40 bg-black/35 transition-opacity ${
            isCategoryPanelOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsCategoryPanelOpen(false)}
          aria-hidden="true"
        />

        <aside
          className={`fixed left-0 top-0 z-50 h-full w-[82%] max-w-[320px] bg-white px-3 pb-4 pt-4 transition-transform duration-300 ${
            isCategoryPanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={!isCategoryPanelOpen}
        >
          <div className="mb-3 flex items-center justify-between px-2">
            <h3 className="font-semibold text-[var(--color-text-1)]">Categories</h3>
            <button
              type="button"
              onClick={() => setIsCategoryPanelOpen(false)}
              className="inline-flex rounded p-1 text-[var(--color-text-1)]"
              aria-label="Close categories"
            >
              <X size={20} />
            </button>
          </div>

          <Categories withBorder={false} heightClassName="h-[calc(100vh-84px)]" />
        </aside>
      </div>
    </section>
  );
}
