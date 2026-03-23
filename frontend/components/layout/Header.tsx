"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Heart, LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearToken, logoutUser } from "@/store/authSlice";
import { hasAdminRole } from "@/lib/authRoles";
import { useToast } from "@/components/ui/toast";
import { apiGetProducts, type CatalogProduct } from "@/lib/productApi";
import { formatLkr } from "@/lib/currency";

const guestNavLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Sign Up", href: "/register" },
] as const;

const authNavLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const totalItems = useAppSelector((state) => state.cart.totalItems);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const isAdmin = hasAdminRole(user?.roles);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  async function handleLogout() {
    const result = await dispatch(logoutUser());
    dispatch(clearToken());
    setIsUserMenuOpen(false);
    showToast({
      title: logoutUser.fulfilled.match(result) ? "Logged out" : "Logout completed locally",
      description: logoutUser.fulfilled.match(result)
        ? "Your session has been cleared."
        : ((result.payload as string) || "Server logout did not complete, but local session was cleared."),
      variant: logoutUser.fulfilled.match(result) ? "success" : "info",
    });
    router.push("/");
  }

  useEffect(() => {
    let active = true;

    async function loadSearchProducts() {
      try {
        const products = await apiGetProducts();
        if (!active) return;
        setSearchResults(products.filter((product) => product.active));
      } catch {
        if (!active) return;
        setSearchResults([]);
      }
    }

    void loadSearchProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResultsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  function handleSearchSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const query = searchQuery.trim();
    const searchParams = new URLSearchParams();
    if (query) {
      searchParams.set("q", query);
    }

    const destination = searchParams.size > 0 ? `/products?${searchParams.toString()}` : "/products";
    setSearchResultsOpen(false);
    setIsMobileMenuOpen(false);
    router.push(destination);
  }

  const previewResults = useMemo(() => {
    if (normalizedSearchQuery.length === 0) return [];

    return searchResults
      .filter((product) => {
        const candidateText = [
          product.name,
          product.category,
          product.subCategory ?? "",
          product.brand,
        ]
          .join(" ")
          .toLowerCase();

        return candidateText.includes(normalizedSearchQuery);
      })
      .slice(0, 5);
  }, [normalizedSearchQuery, searchResults]);

  function handleSearchResultClick(slug: string) {
    setSearchResultsOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
    router.push(`/products/${slug}`);
  }

  const navLinks = isAuthenticated ? authNavLinks : guestNavLinks;

  return (
    <header className="border-b border-black/10 bg-(--color-primary)">
      <div className="bg-(--color-primary-2) text-white">
        <div className="mx-auto flex max-w-310 items-center justify-between px-4 py-3 md:px-8">
          <p className="text-center text-sm w-full">
            Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{" "}
            <Link href="/products" className="font-semibold underline underline-offset-2 ml-2">
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

      <div className="mx-auto max-w-310 px-4 md:px-8">
        <div className="flex items-center justify-between pb-4 pt-2">
          <Link href="/" className="font-bold text-(--color-text-1)">
            <Image src="/logo.webp" alt="Logo" width={100} height={36} />
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-md text-(--color-text-1) underline-offset-4 hover:underline ${
                  pathname === item.href ? "underline" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="flex h-12 w-75 items-center gap-3 rounded bg-(--color-secondary) px-4">
                <label className="contents">
                  <span className="sr-only">Search products</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSearchQuery(value);
                      setSearchResultsOpen(value.trim().length > 0);
                    }}
                    onFocus={() => setSearchResultsOpen(normalizedSearchQuery.length > 0)}
                    placeholder="What are you looking for?"
                    className="w-full border-none bg-transparent text-sm text-(--color-text-1) placeholder:text-(--color-text-2) outline-none"
                  />
                </label>
                <button type="submit" aria-label="Search products" className="cursor-pointer text-(--color-text-1)">
                  <Search size={20} className="text-(--color-text-1)" />
                </button>
              </form>

              {searchResultsOpen && normalizedSearchQuery.length > 0 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
                  {previewResults.length > 0 ? (
                    <>
                      <div className="max-h-[320px] overflow-y-auto py-2">
                        {previewResults.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSearchResultClick(product.slug)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-(--color-secondary)"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-(--color-secondary)">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                unoptimized={/^https?:\/\//i.test(product.imageUrl)}
                                className="object-contain p-1.5"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-(--color-text-1)">{product.name}</p>
                              <p className="mt-1 text-sm text-(--color-primary-btn)">{formatLkr(product.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="flex w-full items-center justify-between border-t border-black/10 px-4 py-3 text-sm font-medium text-(--color-text-1) hover:bg-(--color-secondary)"
                      >
                        <span>See all results for &quot;{searchQuery.trim()}&quot;</span>
                        <Search size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-4 text-sm text-(--color-text-2)">No matching products found.</div>
                  )}
                </div>
              ) : null}
            </div>

            <button type="button" aria-label="Wishlist" className="text-(--color-text-1)">
              <Heart size={24} strokeWidth={1.8} />
            </button>

            <Link href="/cart" aria-label="Cart" className="relative text-(--color-text-1)">
              <ShoppingCart size={24} strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--color-primary-btn) text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-(--color-text-1)"
                  aria-label="User menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-primary-btn) text-white">
                    <User size={16} />
                  </span>
                  <span className="hidden xl:block max-w-30 truncate text-sm font-medium">
                    {user?.fullName?.split(" ")[0] ?? "Account"}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-10 z-50 min-w-45 rounded border border-black/10 bg-white py-2 shadow-md">
                    <div className="border-b border-black/10 px-4 pb-2 mb-1">
                      <p className="text-sm font-medium text-(--color-text-1) truncate">{user?.fullName}</p>
                      <p className="text-xs text-(--color-text-2) truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-(--color-text-1) hover:bg-(--color-secondary)"
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-(--color-text-1) hover:bg-(--color-secondary)"
                      >
                        <ChevronDown size={15} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-(--color-text-1) hover:bg-(--color-secondary)"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-(--color-text-1) underline-offset-4 hover:underline"
              >
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded p-2 text-(--color-text-1) lg:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        <div className={`${isMobileMenuOpen ? "grid" : "hidden"} gap-4 pb-5 lg:hidden`}>
          <form onSubmit={handleSearchSubmit} className="flex h-11 w-full items-center gap-3 rounded bg-(--color-secondary) px-4">
            <label className="contents">
              <span className="sr-only">Search products</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="What are you looking for?"
                className="w-full border-none bg-transparent text-sm text-(--color-text-1) placeholder:text-(--color-text-2) outline-none"
              />
            </label>
            <button type="submit" aria-label="Search products" className="cursor-pointer text-(--color-text-1)">
              <Search size={20} className="text-(--color-text-1)" />
            </button>
          </form>

          <nav className="grid gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-center font-medium text-(--color-text-1) underline-offset-4 ${
                  pathname === item.href ? "underline" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="text-center font-medium text-(--color-primary-btn)"
              >
                Logout
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4 w-full justify-center">
            <button
              type="button"
              aria-label="Wishlist"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--color-secondary) text-(--color-text-1)"
            >
              <Heart size={20} strokeWidth={1.8} />
            </button>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--color-secondary) text-(--color-text-1)"
            >
              <ShoppingCart size={20} strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--color-primary-btn) text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary-btn) text-white">
                <User size={18} />
              </span>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-10 items-center justify-center px-4 rounded bg-(--color-primary-btn) text-sm font-medium text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
