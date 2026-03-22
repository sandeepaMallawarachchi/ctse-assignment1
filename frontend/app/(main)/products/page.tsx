"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { formatLkr } from "@/lib/currency";
import {
  apiGetCategories,
  apiGetProducts,
  mapCatalogProductToCard,
  type CatalogCategory,
  type CatalogProduct,
} from "@/lib/productApi";

function Filters({
  categories,
  subCategories,
  brands,
  selectedCategories,
  selectedSubCategories,
  selectedBrands,
  maxPrice,
  maxPriceLimit,
  onCategoryToggle,
  onSubCategoryToggle,
  onBrandToggle,
  onPriceChange,
  onReset,
}: {
  categories: string[];
  subCategories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedSubCategories: string[];
  selectedBrands: string[];
  maxPrice: number | null;
  maxPriceLimit: number;
  onCategoryToggle: (category: string) => void;
  onSubCategoryToggle: (subCategory: string) => void;
  onBrandToggle: (brand: string) => void;
  onPriceChange: (price: number) => void;
  onReset: () => void;
}) {
  const hasPriceRange = maxPriceLimit > 0 && maxPrice !== null;
  const percent = hasPriceRange ? Math.round((maxPrice / maxPriceLimit) * 100) : 100;

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
        <h3 className="mb-3 font-semibold text-(--color-text-1)">Subcategory</h3>
        <div className="space-y-2">
          {subCategories.map((subCategory) => (
            <label key={subCategory} className="flex cursor-pointer items-center gap-2 text-(--color-text-1)">
              <input
                type="checkbox"
                checked={selectedSubCategories.includes(subCategory)}
                onChange={() => onSubCategoryToggle(subCategory)}
                className="h-4 w-4 accent-[var(--color-primary-btn)]"
              />
              {subCategory}
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
          <span className="text-(--color-primary-btn)">
            {hasPriceRange ? `Up to ${formatLkr(maxPrice)}` : "All prices"}
          </span>
        </div>

        <div className="relative mb-3 h-2 rounded bg-(--color-secondary)">
          <div
            className="absolute left-0 top-0 h-2 rounded bg-(--color-primary-btn)"
            style={{ width: `${hasPriceRange ? percent : 100}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(maxPriceLimit, 1)}
          step={10}
          value={hasPriceRange ? maxPrice : Math.max(maxPriceLimit, 1)}
          onChange={(event) => onPriceChange(Number(event.target.value))}
          disabled={!hasPriceRange}
          className="w-full accent-[var(--color-primary-btn)]"
        />
      </div>

      <Button variant="secondary" size="md" onClick={onReset} className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}

function AllProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categoriesData, setCategoriesData] = useState<CatalogCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const [productData, categoryData] = await Promise.all([apiGetProducts(), apiGetCategories()]);
        if (!active) return;

        const activeProducts = productData.filter((product) => product.active);
        const highestPrice = Math.max(...activeProducts.map((product) => Number(product.price) || 0), 0);

        setProducts(activeProducts);
        setCategoriesData(categoryData);
        setMaxPrice(highestPrice > 0 ? highestPrice : null);
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

  const categories = useMemo(() => {
    if (categoriesData.length > 0) {
      return categoriesData.map((category) => category.name);
    }
    return Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort();
  }, [categoriesData, products]);

  const subCategories = useMemo(() => {
    const source =
      selectedCategories.length > 0
        ? categoriesData.filter((category) => selectedCategories.includes(category.name))
        : categoriesData;

    return Array.from(
      new Set(source.flatMap((category) => category.subCategories.map((subCategory) => subCategory.name)))
    ).sort();
  }, [categoriesData, selectedCategories]);

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort(),
    [products]
  );

  const maxPriceLimit = useMemo(() => {
    const highestPrice = Math.max(...products.map((product) => product.price), 0);
    return highestPrice > 0 ? highestPrice : 0;
  }, [products]);

  useEffect(() => {
    setMaxPrice((current) => {
      if (current === null) return current;
      return Math.min(current, maxPriceLimit);
    });
  }, [maxPriceLimit]);

  useEffect(() => {
    const categoryParam = searchParams.get("category")?.trim();
    const subCategoryParam = searchParams.get("subCategory")?.trim();

    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }

    if (subCategoryParam) {
      setSelectedSubCategories([subCategoryParam]);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryPass =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const subCategoryPass =
        selectedSubCategories.length === 0 ||
        (product.subCategory ? selectedSubCategories.includes(product.subCategory) : false);
      const brandPass = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const pricePass = maxPrice === null || product.price <= maxPrice;

      return categoryPass && subCategoryPass && brandPass && pricePass;
    });
  }, [maxPrice, products, selectedBrands, selectedCategories, selectedSubCategories]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const handleSubCategoryToggle = (subCategory: string) => {
    setSelectedSubCategories((current) =>
      current.includes(subCategory)
        ? current.filter((item) => item !== subCategory)
        : [...current, subCategory]
    );
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    setMaxPrice(maxPriceLimit > 0 ? maxPriceLimit : null);
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
            subCategories={subCategories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
            selectedBrands={selectedBrands}
            maxPrice={maxPrice}
            maxPriceLimit={maxPriceLimit}
            onCategoryToggle={handleCategoryToggle}
            onSubCategoryToggle={handleSubCategoryToggle}
            onBrandToggle={handleBrandToggle}
            onPriceChange={(price) => setMaxPrice(price)}
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
          subCategories={subCategories}
          brands={brands}
          selectedCategories={selectedCategories}
          selectedSubCategories={selectedSubCategories}
          selectedBrands={selectedBrands}
          maxPrice={maxPrice}
          maxPriceLimit={maxPriceLimit}
          onCategoryToggle={handleCategoryToggle}
          onSubCategoryToggle={handleSubCategoryToggle}
          onBrandToggle={handleBrandToggle}
          onPriceChange={(price) => setMaxPrice(price)}
          onReset={handleReset}
        />
      </aside>
    </section>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-[1240px] px-4 py-12 md:px-8">
          <div className="rounded border border-black/10 bg-white px-6 py-16 text-center text-sm text-(--color-text-2)">
            Loading products...
          </div>
        </section>
      }
    >
      <AllProductsPageContent />
    </Suspense>
  );
}
