"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard, { type Product } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";

type FilterProduct = Product & {
  category: string;
  brand: string;
};

const products: FilterProduct[] = [
  {
    id: 101,
    name: "HAVIT HV-G92 Gamepad",
    imageUrl: "/products/p1.webp",
    discountPercent: 40,
    currentPrice: 120,
    previousPrice: 160,
    rating: 5,
    reviewCount: 88,
    category: "Gaming",
    brand: "HAVIT",
  },
  {
    id: 102,
    name: "AK-900 Wired Keyboard",
    imageUrl: "/products/p2.webp",
    discountPercent: 35,
    currentPrice: 960,
    previousPrice: 1160,
    rating: 4,
    reviewCount: 75,
    category: "Electronics",
    brand: "AK",
  },
  {
    id: 103,
    name: "IPS LCD Gaming Monitor",
    imageUrl: "/products/p3.webp",
    discountPercent: 30,
    currentPrice: 370,
    previousPrice: 400,
    rating: 5,
    reviewCount: 99,
    category: "Electronics",
    brand: "IPS",
  },
  {
    id: 104,
    name: "S-Series Comfort Chair",
    imageUrl: "/products/p4.webp",
    discountPercent: 25,
    currentPrice: 375,
    previousPrice: 400,
    rating: 4,
    reviewCount: 99,
    category: "Furniture",
    brand: "S-Series",
  },
  {
    id: 105,
    name: "Breed Dry Dog Food",
    imageUrl: "/products/p9.webp",
    currentPrice: 100,
    previousPrice: 0,
    rating: 3,
    reviewCount: 35,
    category: "Pet Care",
    brand: "Breed",
  },
  {
    id: 106,
    name: "CANON EOS DSLR Camera",
    imageUrl: "/products/p11.webp",
    currentPrice: 360,
    previousPrice: 0,
    rating: 4,
    reviewCount: 95,
    category: "Electronics",
    brand: "Canon",
  },
  {
    id: 107,
    name: "ASUS FHD Gaming Laptop",
    imageUrl: "/products/p12.webp",
    currentPrice: 700,
    previousPrice: 0,
    rating: 5,
    reviewCount: 325,
    category: "Electronics",
    brand: "ASUS",
  },
  {
    id: 108,
    name: "Curology Product Set",
    imageUrl: "/products/p10.webp",
    currentPrice: 500,
    previousPrice: 0,
    rating: 4,
    reviewCount: 145,
    category: "Beauty",
    brand: "Curology",
  },
  {
    id: 109,
    name: "Kids Electric Car",
    imageUrl: "/products/p13.webp",
    currentPrice: 960,
    previousPrice: 0,
    rating: 5,
    reviewCount: 65,
    badgeLabel: "NEW",
    badgeVariant: "success",
    category: "Toys",
    brand: "AMG",
  },
  {
    id: 110,
    name: "Jr. Zoom Soccer Cleats",
    imageUrl: "/products/p14.webp",
    currentPrice: 1160,
    previousPrice: 0,
    rating: 5,
    reviewCount: 35,
    category: "Sports",
    brand: "Zoom",
  },
  {
    id: 111,
    name: "GP11 Shooter USB Gamepad",
    imageUrl: "/products/p15.webp",
    currentPrice: 660,
    previousPrice: 0,
    rating: 4,
    reviewCount: 55,
    category: "Gaming",
    brand: "GP11",
  },
  {
    id: 112,
    name: "Quilted Satin Jacket",
    imageUrl: "/products/p16.webp",
    currentPrice: 660,
    previousPrice: 0,
    rating: 4,
    reviewCount: 55,
    category: "Fashion",
    brand: "Satin",
  },
];

const categories = ["Electronics", "Gaming", "Fashion", "Furniture", "Beauty", "Sports", "Toys", "Pet Care"] as const;
const brands = ["Canon", "ASUS", "HAVIT", "Curology", "AK", "S-Series", "Zoom"] as const;

function Filters({
  selectedCategories,
  selectedBrands,
  maxPrice,
  onCategoryToggle,
  onBrandToggle,
  onPriceChange,
  onReset,
}: {
  selectedCategories: string[];
  selectedBrands: string[];
  maxPrice: number;
  onCategoryToggle: (category: string) => void;
  onBrandToggle: (brand: string) => void;
  onPriceChange: (price: number) => void;
  onReset: () => void;
}) {
  const percent = Math.round((maxPrice / 2000) * 100);

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
          <span className="text-(--color-primary-btn)">Up to ${maxPrice}</span>
        </div>

        <div className="relative mb-3 h-2 rounded bg-(--color-secondary)">
          <div className="absolute left-0 top-0 h-2 rounded bg-(--color-primary-btn)" style={{ width: `${percent}%` }} />
        </div>

        <input
          type="range"
          min={50}
          max={2000}
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryPass = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const brandPass = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const pricePass = product.currentPrice <= maxPrice;

      return categoryPass && brandPass && pricePass;
    });
  }, [selectedCategories, selectedBrands, maxPrice]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(2000);
  };

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-12 md:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-(--color-text-1)">All Products</h1>
          <p className="mt-2 text-(--color-text-2)">{filteredProducts.length} products found</p>
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
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            maxPrice={maxPrice}
            onCategoryToggle={handleCategoryToggle}
            onBrandToggle={handleBrandToggle}
            onPriceChange={setMaxPrice}
            onReset={handleReset}
          />
        </aside>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          maxPrice={maxPrice}
          onCategoryToggle={handleCategoryToggle}
          onBrandToggle={handleBrandToggle}
          onPriceChange={setMaxPrice}
          onReset={handleReset}
        />
      </aside>
    </section>
  );
}
