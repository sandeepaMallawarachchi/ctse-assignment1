"use client";

import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { formatLkr } from "@/lib/currency";
import { useAppSelector } from "@/store/hooks";
import {
  apiCreateProduct,
  apiDeleteProduct,
  apiGetAdminProducts,
  apiGetCategories,
  apiUpdateProduct,
  apiUpdateProductStock,
  apiUploadProductImage,
  type AdminProductRequest,
  type CatalogCategory,
  type CatalogProduct,
} from "@/lib/productApi";

type ProductFormState = {
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  description: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
  rating: string;
  reviewCount: string;
  active: boolean;
  colorOptions: string[];
  sizes: string;
  gallery: string[];
};

const emptyForm: ProductFormState = {
  name: "",
  slug: "",
  category: "",
  subCategory: "",
  description: "",
  price: "",
  stockQuantity: "0",
  imageUrl: "",
  rating: "0",
  reviewCount: "0",
  active: true,
  colorOptions: [],
  sizes: "",
  gallery: ["", "", "", ""],
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFormState(product: CatalogProduct): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    subCategory: product.subCategory ?? "",
    description: product.description,
    price: String(product.price),
    stockQuantity: String(product.stockQuantity),
    imageUrl: product.imageUrl,
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    active: product.active,
    colorOptions: product.colorOptions,
    sizes: product.sizes.join(", "),
    gallery: Array.from({ length: 4 }, (_, index) => product.gallery[index] ?? ""),
  };
}

function toRequestPayload(form: ProductFormState): AdminProductRequest {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    category: form.category.trim(),
    subCategory: form.subCategory.trim() || undefined,
    description: form.description.trim(),
    price: Number(form.price),
    stockQuantity: Number(form.stockQuantity),
    imageUrl: form.imageUrl.trim() || undefined,
    rating: Number(form.rating || 0),
    reviewCount: Number(form.reviewCount || 0),
    active: form.active,
    colorOptions: form.colorOptions,
    sizes: splitCommaValues(form.sizes),
    gallery: form.gallery.filter(Boolean),
  };
}

function formatDate(value: string | null) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminProductsPage() {
  const token = useAppSelector((state) => state.auth.token);
  const { showToast } = useToast();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<CatalogProduct | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [selectedColor, setSelectedColor] = useState("#db4444");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      if (!token) {
        if (active) {
          setProducts([]);
          setLoading(false);
          setError("Missing authentication token.");
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [data, categoryData] = await Promise.all([
          apiGetAdminProducts(token),
          apiGetCategories(),
        ]);
        if (!active) return;
        setProducts(data.sort((left, right) => {
          const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
          const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
          return rightTime - leftTime;
        }));
        setCategories(categoryData);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Failed to load products.";
        setError(message);
        showToast({
          title: "Failed to load products",
          description: message,
          variant: "error",
        });
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
  }, [showToast, token]);

  const categoryNames = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort();
  }, [products]);

  const availableSubCategories = useMemo(() => {
    return categories.find((category) => category.name === form.category)?.subCategories ?? [];
  }, [categories, form.category]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "Active" ? product.active : !product.active);
      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;

      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, products, searchQuery, statusFilter]);

  function openCreateModal() {
    setEditingProductId(null);
    setForm(emptyForm);
    setMainImageFile(null);
    setGalleryFiles([null, null, null, null]);
    setSelectedColor("#db4444");
    setIsModalOpen(true);
  }

  function openEditModal(product: CatalogProduct) {
    setEditingProductId(product.id);
    setForm(toFormState(product));
    setMainImageFile(null);
    setGalleryFiles([null, null, null, null]);
    setSelectedColor(product.colorOptions[0] ?? "#db4444");
    setIsModalOpen(true);
  }

  function handleAddColor() {
    setForm((current) => {
      if (current.colorOptions.includes(selectedColor)) {
        return current;
      }

      return {
        ...current,
        colorOptions: [...current.colorOptions, selectedColor],
      };
    });
  }

  function handleRemoveColor(colorToRemove: string) {
    setForm((current) => ({
      ...current,
      colorOptions: current.colorOptions.filter((color) => color !== colorToRemove),
    }));
  }

  function handleClearColors() {
    setForm((current) => ({
      ...current,
      colorOptions: [],
    }));
  }

  async function handleSaveProduct() {
    if (!token) {
      showToast({
        title: "Authentication required",
        description: "You must be signed in as an admin to manage products.",
        variant: "error",
      });
      return;
    }

    if (!form.name.trim() || !form.category.trim() || !form.description.trim()) {
      showToast({
        title: "Missing required details",
        description: "Name, category, and description are required.",
        variant: "error",
      });
      return;
    }

    const normalizedSlug = form.slug.trim() || toSlug(form.name);

    if (mainImageFile) {
      showToast({
        title: "Uploading images",
        description: "Please wait while product images are uploaded.",
        variant: "info",
      });
    }

    if (!normalizedSlug || Number.isNaN(Number(form.price)) || Number.isNaN(Number(form.stockQuantity))) {
      showToast({
        title: "Invalid product details",
        description: "Please provide a valid slug, price, and stock quantity.",
        variant: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const uploadedMainImageUrl = mainImageFile
        ? await apiUploadProductImage(token, mainImageFile)
        : form.imageUrl.trim() || undefined;

      const uploadedGallery = await Promise.all(
        galleryFiles.map(async (file, index) => {
          if (file) {
            return apiUploadProductImage(token, file);
          }
          return form.gallery[index] || "";
        })
      );

      const payload = toRequestPayload({
        ...form,
        slug: normalizedSlug,
        imageUrl: uploadedMainImageUrl ?? "",
        gallery: uploadedGallery,
      });

      const savedProduct = editingProductId
        ? await apiUpdateProduct(token, editingProductId, payload)
        : await apiCreateProduct(token, payload);

      if (editingProductId) {
        if (savedProduct.stockQuantity !== payload.stockQuantity) {
          await apiUpdateProductStock(token, savedProduct.id, payload.stockQuantity);
          savedProduct.stockQuantity = payload.stockQuantity;
        }
      }

      setProducts((current) => {
        const next = editingProductId
          ? current.map((product) => (product.id === savedProduct.id ? savedProduct : product))
          : [savedProduct, ...current];

        return next.sort((left, right) => {
          const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
          const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
          return rightTime - leftTime;
        });
      });

      setIsModalOpen(false);
      setEditingProductId(null);
      setForm(emptyForm);
      setMainImageFile(null);
      setGalleryFiles([null, null, null, null]);
      setSelectedColor("#db4444");
      showToast({
        title: editingProductId ? "Product updated" : "Product created",
        description: `${savedProduct.name} has been saved successfully.`,
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save product.";
      showToast({
        title: "Save failed",
        description: message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct() {
    if (!pendingDeleteProduct || !token) return;

    try {
      setDeleting(true);
      await apiDeleteProduct(token, pendingDeleteProduct.id);
      setProducts((current) => current.filter((product) => product.id !== pendingDeleteProduct.id));
      showToast({
        title: "Product deleted",
        description: `${pendingDeleteProduct.name} has been removed from the catalog.`,
        variant: "success",
      });
      setPendingDeleteProduct(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete product.";
      showToast({
        title: "Delete failed",
        description: message,
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleStatus(product: CatalogProduct) {
    if (!token) return;

    try {
      const updated = await apiUpdateProduct(token, product.id, {
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory ?? undefined,
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
        rating: product.rating,
        reviewCount: product.reviewCount,
        gallery: product.gallery,
        colorOptions: product.colorOptions,
        sizes: product.sizes,
        active: !product.active,
      });

      setProducts((current) =>
        current.map((item) => (item.id === product.id ? updated : item))
      );
      showToast({
        title: updated.active ? "Product activated" : "Product deactivated",
        description: `${updated.name} is now ${updated.active ? "visible" : "inactive"} in the catalog.`,
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update product status.";
      showToast({
        title: "Status update failed",
        description: message,
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Catalog</p>
          <h1 className="mt-3 text-[var(--color-text-1)]">Products</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
            Manage catalog entries, stock availability, and product visibility from a centralized inventory workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-btn)] px-5 text-sm font-medium text-white transition hover:bg-[var(--color-primary-btn-hover)]"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 md:p-6">
        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by product name or slug"
            className="h-11 rounded-lg border border-black/10 bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition focus:border-[var(--color-primary-btn)]"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | "Active" | "Inactive")}
            className="h-11 rounded-lg border border-black/10 bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition focus:border-[var(--color-primary-btn)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-11 rounded-lg border border-black/10 bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition focus:border-[var(--color-primary-btn)]"
          >
            <option value="ALL">All Categories</option>
            {categoryNames.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="rounded-lg bg-[var(--color-secondary)] px-4 py-10 text-center text-sm text-[var(--color-text-2)]">
            Loading products from the catalog...
          </div>
        ) : error ? (
          <div className="rounded-lg bg-[var(--color-secondary)] px-4 py-10 text-center text-sm text-[var(--color-text-2)]">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-lg bg-[var(--color-secondary)] px-4 py-10 text-center text-sm text-[var(--color-text-2)]">
            No products match the current search or filters.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-5 rounded-lg border border-black/10 px-4 py-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-text-1)]">{product.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-2)]">/{product.slug}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-lg bg-[var(--color-secondary)] px-3 py-1 text-xs font-medium text-[var(--color-text-2)]">
                      {product.category}
                    </span>
                    <span
                      className={`inline-flex rounded-lg px-3 py-1 text-xs font-medium ${
                        product.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-black/5 text-[var(--color-text-2)]"
                      }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">Price</p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-text-1)]">{formatLkr(product.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">Stock</p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-text-1)]">{product.stockQuantity}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">Rating</p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-text-1)]">
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">Added On</p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-text-1)]">{formatDate(product.createdAt)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--color-text-1)] transition hover:bg-[var(--color-secondary)]"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleStatus(product)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      product.active
                        ? "border-black/10 text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {product.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteProduct(product)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary-btn)]/25 bg-[var(--color-primary-btn)]/6 px-4 py-2 text-sm font-medium text-[var(--color-primary-btn)] transition hover:bg-[var(--color-primary-btn)]/12"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">
              {editingProductId ? "Edit Product" : "New Product"}
            </p>
            <h2 className="mt-3 text-[var(--color-text-1)]">
              {editingProductId ? "Update catalog product" : "Create catalog product"}
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Product Name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug: toSlug(event.target.value),
                    }))
                  }
                  placeholder="Product name"
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Slug *</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: toSlug(event.target.value) }))}
                  placeholder="product-slug"
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Category *</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                      subCategory: "",
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Subcategory</span>
                <select
                  value={form.subCategory}
                  onChange={(event) => setForm((current) => ({ ...current, subCategory: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                >
                  <option value="">Select subcategory</option>
                  {availableSubCategories.map((subCategory) => (
                    <option key={subCategory.slug} value={subCategory.name}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Price *</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Price"
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Stock Quantity *</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockQuantity}
                  onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))}
                  placeholder="Stock quantity"
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Rating</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                  placeholder="Rating"
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Review Count</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.reviewCount}
                  onChange={(event) => setForm((current) => ({ ...current, reviewCount: event.target.value }))}
                  placeholder="Review count"
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-[var(--color-text-1)]">Description *</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Product description"
                rows={5}
                className="w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
              />
            </label>

            <div className="mt-4 space-y-4 rounded-lg border border-black/10 bg-[var(--color-secondary)]/50 p-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-1)]">Main Image</p>
                <p className="mt-1 text-xs text-[var(--color-text-2)]">Upload the primary product image from your device.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-white">
                  {form.imageUrl ? (
                    <Image
                      src={form.imageUrl}
                      alt="Main product preview"
                      width={120}
                      height={120}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="px-3 text-center text-xs text-[var(--color-text-2)]">No image selected</span>
                  )}
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--color-text-1)]">Primary Product Image *</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setMainImageFile(file);
                      if (file) {
                        setForm((current) => ({
                          ...current,
                          imageUrl: URL.createObjectURL(file),
                        }));
                      }
                    }}
                    className="block w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-[var(--color-text-1)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--color-primary-btn)] file:px-3 file:py-2 file:text-white"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 space-y-4 rounded-lg border border-black/10 bg-[var(--color-secondary)]/50 p-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-1)]">Gallery Images</p>
                <p className="mt-1 text-xs text-[var(--color-text-2)]">Upload up to four supporting images for the product gallery.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {form.gallery.map((imageUrl, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-white">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={`Gallery preview ${index + 1}`}
                          width={120}
                          height={120}
                          unoptimized
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="px-3 text-center text-xs text-[var(--color-text-2)]">No image selected</span>
                      )}
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[var(--color-text-1)]">Gallery Image {index + 1}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setGalleryFiles((current) => current.map((item, itemIndex) => (itemIndex === index ? file : item)));
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setForm((current) => ({
                              ...current,
                              gallery: current.gallery.map((item, itemIndex) =>
                                itemIndex === index ? previewUrl : item
                              ),
                            }));
                          }
                        }}
                        className="block w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-[var(--color-text-1)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--color-primary-btn)] file:px-3 file:py-2 file:text-white"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Color Options</span>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(event) => setSelectedColor(event.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-black/10 bg-white p-1"
                    aria-label="Select product color"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-black/10 px-4 text-sm font-medium text-[var(--color-text-1)] transition hover:bg-[var(--color-secondary)]"
                  >
                    Add Color
                  </button>
                  <button
                    type="button"
                    onClick={handleClearColors}
                    disabled={form.colorOptions.length === 0}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-primary-btn)]/25 px-4 text-sm font-medium text-[var(--color-primary-btn)] transition hover:bg-[var(--color-primary-btn)]/8 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear Colors
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.colorOptions.length > 0 ? (
                    form.colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleRemoveColor(color)}
                        className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                        aria-label={`Remove color ${color}`}
                        title={color}
                      >
                        <span className="pointer-events-none text-[10px] font-bold text-white">
                          x
                        </span>
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--color-text-2)]">No colors added yet.</span>
                  )}
                </div>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--color-text-1)]">Sizes</span>
                <input
                  type="text"
                  value={form.sizes}
                  onChange={(event) => setForm((current) => ({ ...current, sizes: event.target.value }))}
                  placeholder="Sizes: S, M, L"
                  className="h-11 w-full rounded-lg border border-black/10 px-4 text-sm outline-none transition focus:border-[var(--color-primary-btn)]"
                />
              </label>
            </div>

            <label className="mt-4 inline-flex items-center gap-3 text-sm text-[var(--color-text-1)]">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4 accent-[var(--color-primary-btn)]"
              />
              Product is active in the catalog
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProductId(null);
                  setForm(emptyForm);
                  setMainImageFile(null);
                  setGalleryFiles([null, null, null, null]);
                  setSelectedColor("#db4444");
                }}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveProduct()}
                disabled={saving}
                className="rounded-lg bg-[var(--color-primary-btn)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-btn-hover)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : editingProductId ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDeleteProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Confirm Delete</p>
            <h2 className="mt-3 text-[var(--color-text-1)]">Delete product?</h2>
            <p className="mt-3 text-sm text-[var(--color-text-2)]">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[var(--color-text-1)]">{pendingDeleteProduct.name}</span>?
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-2)]">
              This will remove the product from the active catalog.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteProduct(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--color-text-1)] hover:bg-[var(--color-secondary)]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteProduct()}
                disabled={deleting}
                className="rounded-lg border border-[var(--color-primary-btn)]/25 bg-[var(--color-primary-btn)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-btn-hover)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
