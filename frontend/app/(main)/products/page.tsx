"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { formatLkr } from "@/lib/currency";
import {
  apiGetProducts,
  mapCatalogProductToCard,
  type CatalogProduct,
} from "@/lib/productApi";

function Filters({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  maxPrice,
  maxPriceLimit,
  onCategoryToggle,
  onBrandToggle,
  onPriceChange,
  onReset,
}: {
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  maxPrice: number;
  maxPriceLimit: number;
  onCategoryToggle: (category: string) => void;
  onBrandToggle: (brand: string) => void;
  onPriceChange: (price: number) => void;
  onReset: () => void;
}) {
  const percent = maxPriceLimit > 0 ? Math.round((maxPrice / maxPriceLimit) * 100) : 100;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 font-semibold text-(--color-text-1)">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-2 text-(--color-text-1)">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryToggle(category)}
                className="h-4 w-4 accent-[var(--color-primary-btn)]"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-(--color-text-1)">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2 text-(--color-text-1)">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => onBrandToggle(brand)}
                className="h-4 w-4 accent-[var(--color-primary-btn)]"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-(--color-text-1)">Price</h3>
          <span className="text-(--color-primary-btn)">Up to {formatLkr(maxPrice)}</span>
        </div>

        <div className="relative mb-3 h-2 rounded bg-(--color-secondary)">
          <div className="absolute left-0 top-0 h-2 rounded bg-(--color-primary-btn)" style={{ width: `${percent}%` }} />
        </div>

        <input
          type="range"
          min={0}
          max={maxPriceLimit}
          step={10}
          value={maxPrice}
          onChange={(event) => onPriceChange(Number(event.target.value))}
          className="w-full accent-[var(--color-primary-btn)]"
        />
      </div>

      <Button variant="secondary" size="md" onClick={onReset} className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}

export default function AllProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetProducts();
        if (!active) return;

        setProducts(data.filter((product) => product.active));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load products.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(),
    [products]
  );

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort(),
    [products]
  );

  const maxPriceLimit = useMemo(() => {
    const highestPrice = Math.max(...products.map((product) => product.price), 0);
    return highestPrice > 0 ? Math.ceil(highestPrice / 10) * 10 : 2000;
  }, [products]);

  useEffect(() => {
    setMaxPrice((current) => (current > 0 ? Math.min(current, maxPriceLimit) : maxPriceLimit));
  }, [maxPriceLimit]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryPass =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const brandPass = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const pricePass = product.price <= maxPrice;

      return categoryPass && brandPass && pricePass;
    });
  }, [maxPrice, products, selectedBrands, selectedCategories]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(maxPriceLimit);
  };

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-12 md:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-(--color-text-1)">All Products</h1>
          <p className="mt-2 text-(--color-text-2)">
            {loading ? "Loading products..." : `${filteredProducts.length} products found`}
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          className="inline-flex items-center gap-2 lg:hidden"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <SlidersHorizontal size={16} /> Filters
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded border border-black/10 bg-white p-5 lg:block">
          <Filters
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            maxPrice={maxPrice}
            maxPriceLimit={maxPriceLimit}
            onCategoryToggle={handleCategoryToggle}
            onBrandToggle={handleBrandToggle}
            onPriceChange={setMaxPrice}
            onReset={handleReset}
          />
        </aside>

        {loading ? (
          <div className="rounded border border-black/10 bg-white px-6 py-16 text-center text-sm text-(--color-text-2)">
            Loading products from the catalog...
          </div>
        ) : error ? (
          <div className="rounded border border-black/10 bg-white px-6 py-16 text-center text-sm text-(--color-text-2)">
            {error}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={mapCatalogProductToCard(product)} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-black/10 bg-white px-6 py-16 text-center text-sm text-(--color-text-2)">
            No products match the selected filters.
          </div>
        )}
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/35 transition-opacity lg:hidden ${
          isMobileFilterOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileFilterOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-[60] h-full w-[86%] max-w-[360px] bg-white p-5 transition-transform duration-300 lg:hidden ${
          isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-semibold text-(--color-text-1)">Filters</h3>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsMobileFilterOpen(false)}
            className="rounded p-1 text-(--color-text-1)"
          >
            <X size={20} />
          </button>
        </div>

        <Filters
          categories={categories}
          brands={brands}
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          maxPrice={maxPrice}
          maxPriceLimit={maxPriceLimit}
          onCategoryToggle={handleCategoryToggle}
          onBrandToggle={handleBrandToggle}
          onPriceChange={setMaxPrice}
          onReset={handleReset}
        />
      </aside>
    </section>
  );
}
