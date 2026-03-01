"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductCard, { type Product } from "./ProductCard";

const products: Product[] = [
  {
    id: 1,
    name: "Breed Dry Dog Food",
    imageUrl: "/products/p5.webp",
    currentPrice: 100,
    previousPrice: 0,
    rating: 3,
    reviewCount: 35,
    showAddToCart: false,
  },
  {
    id: 2,
    name: "CANON EOS DSLR Camera",
    imageUrl: "/products/p6.webp",
    currentPrice: 360,
    previousPrice: 0,
    rating: 4,
    reviewCount: 95,
    showAddToCart: true,
  },
  {
    id: 3,
    name: "ASUS FHD Gaming Laptop",
    imageUrl: "/products/p7.webp",
    currentPrice: 700,
    previousPrice: 0,
    rating: 5,
    reviewCount: 325,
    showAddToCart: false,
  },
  {
    id: 4,
    name: "Curology Product Set",
    imageUrl: "/products/p8.webp",
    currentPrice: 500,
    previousPrice: 0,
    rating: 4,
    reviewCount: 145,
    showAddToCart: false,
  },
  {
    id: 5,
    name: "Kids Electric Car",
    imageUrl: "/products/p9.webp",
    currentPrice: 960,
    previousPrice: 0,
    rating: 5,
    reviewCount: 65,
    showAddToCart: false,
    badgeLabel: "NEW",
    badgeVariant: "success",
    colorOptions: ["#FB1314", "#DB4444"],
  },
  {
    id: 6,
    name: "Jr. Zoom Soccer Cleats",
    imageUrl: "/products/p12.webp",
    currentPrice: 1160,
    previousPrice: 0,
    rating: 5,
    reviewCount: 35,
    showAddToCart: false,
    colorOptions: ["#EEFF61", "#DB4444"],
  },
  {
    id: 7,
    name: "GP11 Shooter USB Gamepad",
    imageUrl: "/products/p11.webp",
    currentPrice: 660,
    previousPrice: 0,
    rating: 4,
    reviewCount: 55,
    showAddToCart: false,
    badgeLabel: "NEW",
    badgeVariant: "success",
    colorOptions: ["#000000", "#DB4444"],
  },
  {
    id: 8,
    name: "Quilted Satin Jacket",
    imageUrl: "/products/p16.webp",
    currentPrice: 660,
    previousPrice: 0,
    rating: 4,
    reviewCount: 55,
    showAddToCart: false,
    colorOptions: ["#184A48", "#DB4444"],
  },
  {
    id: 9,
    name: "HAVIT HV-G92 Gamepad",
    imageUrl: "/products/p1.webp",
    discountPercent: 40,
    currentPrice: 120,
    previousPrice: 160,
    rating: 5,
    reviewCount: 88,
    showAddToCart: false,
  },
  {
    id: 10,
    name: "AK-900 Wired Keyboard",
    imageUrl: "/products/p2.webp",
    discountPercent: 35,
    currentPrice: 960,
    previousPrice: 1160,
    rating: 4,
    reviewCount: 75,
    showAddToCart: false,
  },
  {
    id: 11,
    name: "IPS LCD Gaming Monitor",
    imageUrl: "/products/p3.webp",
    discountPercent: 30,
    currentPrice: 370,
    previousPrice: 400,
    rating: 5,
    reviewCount: 99,
    showAddToCart: false,
  },
  {
    id: 12,
    name: "S-Series Comfort Chair",
    imageUrl: "/products/p4.webp",
    discountPercent: 25,
    currentPrice: 375,
    previousPrice: 400,
    rating: 4,
    reviewCount: 99,
    showAddToCart: false,
  },
];

const carouselConfig = {
  itemWidth: 250,
  itemGap: 24,
} as const;

export default function Products() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollAmount = useMemo(
    () => carouselConfig.itemWidth + carouselConfig.itemGap,
    [],
  );

  const syncButtonState = () => {
    if (!trackRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    const maxScrollLeft = scrollWidth - clientWidth;
    const tolerance = 4;

    setCanScrollLeft(scrollLeft > tolerance);
    setCanScrollRight(scrollLeft < maxScrollLeft - tolerance);
  };

  useEffect(() => {
    const syncWithFrame = () => window.requestAnimationFrame(syncButtonState);

    syncWithFrame();
    window.setTimeout(syncButtonState, 80);

    window.addEventListener("resize", syncWithFrame);
    return () => window.removeEventListener("resize", syncWithFrame);
  }, []);

  const handleArrowClick = (direction: "left" | "right") => {
    if (!trackRef.current) {
      return;
    }

    const nextOffset = direction === "left" ? -scrollAmount : scrollAmount;
    trackRef.current.scrollBy({ left: nextOffset, behavior: "smooth" });

    window.setTimeout(syncButtonState, 120);
    window.setTimeout(syncButtonState, 260);
  };

  const rowSize = Math.ceil(products.length / 2);
  const topRow = products.slice(0, rowSize);
  const bottomRow = products.slice(rowSize);

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-14 md:px-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-9 w-4 rounded bg-(--color-primary-btn)" />
        <h5 className="font-semibold text-(--color-primary-btn)">Our Products</h5>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-5">
        <h1 className="leading-none font-semibold text-(--color-text-1)">Explore Our Products</h1>

        <div className="flex items-center gap-2">
          <button
            aria-label="Previous products"
            onClick={() => handleArrowClick("left")}
            disabled={!canScrollLeft}
            className="bg-(--color-secondary) text-(--color-text-1) hover:bg-(--color-secondary-2) rounded-full p-3"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            aria-label="Next products"
            onClick={() => handleArrowClick("right")}
            disabled={!canScrollRight}
            className="bg-(--color-secondary) text-(--color-text-1) hover:bg-(--color-secondary-2) rounded-full p-3"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={syncButtonState}
        className="mt-10 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-6">
          {topRow.map((topProduct, index) => (
            <div key={topProduct.id} className="flex shrink-0 flex-col gap-14">
              <ProductCard product={topProduct} />
              {bottomRow[index] ? <ProductCard product={bottomRow[index]} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Button variant="primary" size="lg" className="px-12">
          View All Products
        </Button>
      </div>
    </section>
  );
}
