"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Gamepad2,
  Headphones,
  Monitor,
  Smartphone,
  Watch,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type CategoryItem = {
  id: number;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  highlighted?: boolean;
};

const categories: CategoryItem[] = [
  { id: 1, label: "Phones", icon: Smartphone },
  { id: 2, label: "Computers", icon: Monitor },
  { id: 3, label: "SmartWatch", icon: Watch },
  { id: 4, label: "Camera", icon: Camera },
  { id: 5, label: "HeadPhones", icon: Headphones },
  { id: 6, label: "Gaming", icon: Gamepad2 },
  { id: 7, label: "Tablets", icon: Monitor },
  { id: 8, label: "Audio", icon: Headphones },
];

const carouselConfig = {
  itemWidth: 180,
  itemGap: 20,
} as const;

function CategoryCard({ category }: { category: CategoryItem }) {
  const Icon = category.icon;
  const isHighlighted = Boolean(category.highlighted);

  return (
    <article
      className={`h-[145px] w-[180px] shrink-0 rounded border transition ${isHighlighted
          ? "border-[var(--color-primary-btn)] bg-[var(--color-primary-btn)] text-white"
          : "border-black/25 bg-white text-[var(--color-text-1)] hover:bg-[var(--color-primary-btn)]"
        }`}
    >
      <button
        type="button"
        className="flex h-full w-full flex-col items-center justify-center gap-4"
        aria-label={category.label}
      >
        <Icon size={44} strokeWidth={1.8} className={isHighlighted ? "text-white" : "text-[var(--color-text-1)]"} />
        <span className={isHighlighted ? "text-white" : "text-[var(--color-text-1)]"}>{category.label}</span>
      </button>
    </article>
  );
}

export default function BrowseByCategory() {
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
    syncButtonState();
  }, []);

  const handleArrowClick = (direction: "left" | "right") => {
    if (!trackRef.current) {
      return;
    }

    const nextOffset = direction === "left" ? -scrollAmount : scrollAmount;
    trackRef.current.scrollBy({ left: nextOffset, behavior: "smooth" });

    window.setTimeout(syncButtonState, 220);
  };

  return (
    <section className="mx-auto max-w-[1240px] border-b border-black/15 px-4 py-14 md:px-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-9 w-4 rounded bg-[var(--color-primary-btn)]" />
        <h5 className="font-semibold text-[var(--color-primary-btn)]">Categories</h5>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-y-5">
        <h1 className="leading-none font-semibold text-[var(--color-text-1)]">Browse By Category</h1>

        <div className="flex items-center gap-2">
          <button
            aria-label="Previous categories"
            onClick={() => handleArrowClick("left")}
            disabled={!canScrollLeft}
            className="bg-(--color-secondary) text-(--color-text-1) hover:bg-(--color-secondary-2) rounded-full p-3"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            aria-label="Next categories"
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
        className="mt-10 flex gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
