"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

type Category = {
  id: string;
  label: string;
  subCategories?: string[];
};

const categories: Category[] = [
  {
    id: "womens-fashion",
    label: "Woman's Fashion",
    subCategories: ["Dresses", "Tops", "Shoes", "Bags"],
  },
  {
    id: "mens-fashion",
    label: "Men's Fashion",
    subCategories: ["Shirts", "T-Shirts", "Sneakers", "Watches"],
  },
  { id: "electronics", label: "Electronics" },
  { id: "home-lifestyle", label: "Home & Lifestyle" },
  { id: "medicine", label: "Medicine" },
  { id: "sports", label: "Sports & Outdoor" },
  { id: "toys", label: "Baby's & Toys" },
  { id: "groceries", label: "Groceries & Pets" },
  { id: "beauty", label: "Health & Beauty" },
  { id: "automotive", label: "Automotive" },
  { id: "gaming", label: "Gaming" },
];

export default function Categories() {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const toggleCategory = (categoryId: string, hasChildren: boolean) => {
    if (!hasChildren) {
      return;
    }

    setOpenCategoryId((current) => (current === categoryId ? null : categoryId));
  };

  return (
    <aside className="border-r border-black/15 pr-3 md:pr-6">
      <div className="h-[384px] overflow-y-auto py-2">
        <ul className="space-y-1.5">
          {categories.map((category) => {
            const hasChildren = Boolean(category.subCategories?.length);
            const isOpen = openCategoryId === category.id;

            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id, hasChildren)}
                  className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
                  aria-expanded={hasChildren ? isOpen : undefined}
                  aria-label={hasChildren ? `Toggle ${category.label} sub categories` : category.label}
                >
                  <span className="text-xl">{category.label}</span>
                  {hasChildren ? (
                    <ChevronRight
                      size={18}
                      className={`transition ${isOpen ? "rotate-90" : ""}`}
                    />
                  ) : null}
                </button>

                {hasChildren && isOpen ? (
                  <ul className="ml-4 mt-1 space-y-1 pb-2">
                    {category.subCategories?.map((subCategory) => (
                      <li key={subCategory}>
                        <button
                          type="button"
                          className="w-full rounded px-2 py-1 text-left text-base text-[var(--color-text-2)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-1)]"
                        >
                          {subCategory}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
