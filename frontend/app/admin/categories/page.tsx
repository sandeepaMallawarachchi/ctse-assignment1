"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { categoryIconOptions, getCategoryIcon } from "@/lib/categoryIcons";
import { useAppSelector } from "@/store/hooks";
import {
  apiCreateCategory,
  apiCreateSubCategory,
  apiGetCategories,
  type CatalogCategory,
} from "@/lib/productApi";

export default function AdminCategoriesPage() {
  const token = useAppSelector((state) => state.auth.token);
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState("grid-2x2");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetCategories();
        if (!active) return;
        const sorted = [...data].sort((left, right) => left.name.localeCompare(right.name));
        setCategories(sorted);
        setSelectedCategoryId((current) => current || sorted[0]?.id || "");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load categories.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  async function handleCreateCategory() {
    if (!token || !newCategoryName.trim()) return;

    try {
      const created = await apiCreateCategory(token, newCategoryName.trim(), selectedIconKey);
      setCategories((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));
      setNewCategoryName("");
      setSelectedIconKey("grid-2x2");
      setSelectedCategoryId(created.id);
      showToast({
        title: "Category created",
        description: `${created.name} is now available across products and storefront filters.`,
        variant: "success",
      });
    } catch (err) {
      showToast({
        title: "Category creation failed",
        description: err instanceof Error ? err.message : "Failed to create category.",
        variant: "error",
      });
    }
  }

  async function handleCreateSubCategory() {
    if (!token || !selectedCategoryId || !newSubCategoryName.trim()) return;

    try {
      const updated = await apiCreateSubCategory(token, selectedCategoryId, newSubCategoryName.trim());
      setCategories((current) =>
        current
          .map((category) => (category.id === updated.id ? updated : category))
          .sort((left, right) => left.name.localeCompare(right.name))
      );
      setNewSubCategoryName("");
      showToast({
        title: "Subcategory created",
        description: `Added under ${updated.name}.`,
        variant: "success",
      });
    } catch (err) {
      showToast({
        title: "Subcategory creation failed",
        description: err instanceof Error ? err.message : "Failed to create subcategory.",
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Catalog</p>
        <h1 className="mt-3 text-[var(--color-text-1)]">Categories</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
          Create and organize product categories and subcategories used across product setup, storefront navigation, and filters.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-4 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Category Setup</p>
          <h2 className="mt-3 text-[var(--color-text-1)]">Create Category</h2>
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Category name"
              className="h-11 flex-1 rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
            />
            <button
              type="button"
              onClick={() => void handleCreateCategory()}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-primary-btn)] px-4 text-sm font-medium text-white transition hover:bg-[var(--color-primary-btn-hover)]"
            >
              Add Category
            </button>
          </div>
          <div className="mt-4 grid gap-3 grid-cols-3 sm:grid-cols-4">
            {categoryIconOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedIconKey(key);
                  setNewCategoryName(label);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${
                  selectedIconKey === key
                    ? "border-[var(--color-primary-btn)] bg-[var(--color-primary-btn)] text-white"
                    : "border-black/10 bg-white text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
                }`}
              >
                <Icon size={22} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-4 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Subcategory Setup</p>
          <h2 className="mt-3 text-[var(--color-text-1)]">Create Subcategory</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              className="h-11 rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newSubCategoryName}
              onChange={(event) => setNewSubCategoryName(event.target.value)}
              placeholder="Subcategory name"
              className="h-11 rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
            />
            <button
              type="button"
              onClick={() => void handleCreateSubCategory()}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-primary-btn)] px-4 text-sm font-medium text-white transition hover:bg-[var(--color-primary-btn-hover)]"
            >
              Add Subcategory
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-text-2)]">
              {loading ? "Loading categories..." : `${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
            </p>
          </div>
          {error ? (
            <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700">Load failed</span>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-5 rounded-lg bg-[var(--color-secondary)] px-4 py-10 text-center text-sm text-[var(--color-text-2)]">
            Loading categories...
          </div>
        ) : error ? (
          <div className="mt-5 rounded-lg bg-[var(--color-secondary)] px-4 py-10 text-center text-sm text-[var(--color-text-2)]">
            {error}
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-black/10 px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-1)]">{category.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-2)]">/{category.slug}</p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-secondary)] text-[var(--color-text-1)]">
                    {(() => {
                      const Icon = getCategoryIcon(category.iconKey);
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <span className="inline-flex rounded-lg bg-[var(--color-secondary)] px-3 py-1 text-xs font-medium text-[var(--color-text-2)]">
                    {category.subCategories.length} subcategories
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {category.subCategories.length > 0 ? (
                    category.subCategories.map((subCategory) => (
                      <span
                        key={subCategory.slug}
                        className="inline-flex rounded-lg border border-black/10 px-3 py-1 text-xs text-[var(--color-text-2)]"
                      >
                        {subCategory.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--color-text-2)]">No subcategories yet.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
