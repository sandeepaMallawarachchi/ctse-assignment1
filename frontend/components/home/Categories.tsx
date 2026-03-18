"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { apiGetCategories, type CatalogCategory } from "@/lib/productApi";

type CategoriesProps = {
  withBorder?: boolean;
  heightClassName?: string;
};

export default function Categories({
  withBorder = true,
  heightClassName = "h-[384px]",
}: CategoriesProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const data = await apiGetCategories();
        if (active) {
          setCategories(data);
        }
      } catch {
        if (active) {
          setCategories([]);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const toggleCategory = (categoryId: string, hasChildren: boolean) => {
    if (!hasChildren) return;
    setOpenCategoryId((current) => (current === categoryId ? null : categoryId));
  };

  function navigateToCategory(categoryName: string, subCategoryName?: string) {
    const searchParams = new URLSearchParams();
    searchParams.set("category", categoryName);
    if (subCategoryName) {
      searchParams.set("subCategory", subCategoryName);
    }
    router.push(`/products?${searchParams.toString()}`);
  }

  return (
    <aside className={withBorder ? "border-r border-black/15 pr-3 md:pr-6" : ""}>
      <div className={`${heightClassName} overflow-y-auto py-2`}>
        <ul className="space-y-1.5">
          {categories.map((category) => {
            const hasChildren = category.subCategories.length > 0;
            const isOpen = openCategoryId === category.id;

            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (hasChildren) {
                      toggleCategory(category.id, hasChildren);
                      return;
                    }
                    navigateToCategory(category.name);
                  }}
                  className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
                  aria-expanded={hasChildren ? isOpen : undefined}
                  aria-label={hasChildren ? `Toggle ${category.name} sub categories` : category.name}
                >
                  <span className="flex items-center gap-3 text-xl">
                    {(() => {
                      const Icon = getCategoryIcon(category.iconKey);
                      return <Icon size={18} />;
                    })()}
                    {category.name}
                  </span>
                  {hasChildren ? (
                    <ChevronRight size={18} className={`transition ${isOpen ? "rotate-90" : ""}`} />
                  ) : null}
                </button>

                {hasChildren && isOpen ? (
                  <ul className="ml-4 mt-1 space-y-1 pb-2">
                    {category.subCategories.map((subCategory) => (
                      <li key={subCategory.slug}>
                        <button
                          type="button"
                          onClick={() => navigateToCategory(category.name, subCategory.name)}
                          className="w-full rounded px-2 py-1 text-left text-base text-[var(--color-text-2)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-1)]"
                        >
                          {subCategory.name}
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
