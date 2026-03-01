"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
  { label: "Sign Up", href: "/signup" },
] as const;

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 bg-[var(--color-primary)]">
      <div className="bg-[var(--color-primary-2)] text-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3 md:px-8">
          <p className="text-center text-sm w-full">
            Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{" "}
            <Link href="#" className="font-semibold underline underline-offset-2 ml-2">
              ShopNow
            </Link>
          </p>

          <button
            type="button"
            className="self-end hidden items-center gap-1 text-sm md:inline-flex"
            aria-label="Select language"
          >
            English
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="flex items-center justify-between pb-4 pt-2">
          <Link href="/" className="font-bold text-[var(--color-text-1)]">
            <Image src="/logo.webp" alt="Logo" width={100} height={36} />
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[28px] text-[var(--color-text-1)] underline-offset-4 hover:underline ${pathname === item.href ? "underline" : ""
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <label className="flex h-12 w-[300px] items-center gap-3 rounded bg-[var(--color-secondary)] px-4">
              <span className="sr-only">Search products</span>
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full border-none bg-transparent text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-2)] outline-none"
              />
              <Search size={20} className="text-[var(--color-text-1)]" />
            </label>

            <button type="button" aria-label="Wishlist" className="text-[var(--color-text-1)]">
              <Heart size={24} strokeWidth={1.8} />
            </button>
            <button type="button" aria-label="Cart" className="text-[var(--color-text-1)]">
              <ShoppingCart size={24} strokeWidth={1.8} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded p-2 text-[var(--color-text-1)] lg:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        <div className={`${isMobileMenuOpen ? "grid" : "hidden"} gap-4 pb-5 lg:hidden`}>
          <label className="flex h-11 w-full items-center gap-3 rounded bg-[var(--color-secondary)] px-4">
            <span className="sr-only">Search products</span>
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full border-none bg-transparent text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-2)] outline-none"
            />
            <Search size={20} className="text-[var(--color-text-1)]" />
          </label>

          <nav className="grid gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-center font-medium text-[var(--color-text-1)] underline-offset-4 ${pathname === item.href ? "underline" : ""
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 w-full justify-center">
            <button
              type="button"
              aria-label="Wishlist"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-text-1)]"
            >
              <Heart size={20} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Cart"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-text-1)]"
            >
              <ShoppingCart size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
