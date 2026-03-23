import type { Product } from "@/components/products/ProductCard";
import type { ProductDetails } from "@/components/products/ProductDetailsView";

const API_GATEWAY_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

const PRODUCT_SERVICE_URL = `${API_GATEWAY_URL}/api/products`;

interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  data: T;
}

interface ImageUploadResponse {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

function jsonHeaders(token?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface BackendProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subCategory?: string | null;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  gallery?: string[] | null;
  colorOptions?: string[] | null;
  sizes?: string[] | null;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subCategory: string | null;
  brand: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  gallery: string[];
  colorOptions: string[];
  sizes: string[];
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminProductRequest {
  name: string;
  slug: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  gallery?: string[];
  colorOptions?: string[];
  sizes?: string[];
  active?: boolean;
}

interface BackendSubCategoryResponse {
  name: string;
  slug: string;
}

interface BackendCategoryResponse {
  id: string;
  name: string;
  slug: string;
  iconKey?: string | null;
  subCategories: BackendSubCategoryResponse[];
}

export interface CatalogSubCategory {
  name: string;
  slug: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  iconKey: string;
  subCategories: CatalogSubCategory[];
}

function fallbackImage(index = 0) {
  const imageIndex = (index % 16) + 1;
  return `/products/p${imageIndex}.webp`;
}

function normalizeList(values?: string[] | null) {
  return (values ?? []).filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim());
}

function inferBrand(name: string) {
  const match = name.trim().match(/^[A-Za-z0-9-]+/);
  return match?.[0] || "General";
}

function normalizeImage(product: BackendProductResponse, index = 0) {
  const gallery = normalizeList(product.gallery);
  return product.imageUrl?.trim() || gallery[0] || fallbackImage(index);
}

function normalizeColors(colors: string[]) {
  const usable = colors.filter((color) => /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color));
  return usable.length > 0 ? usable : [];
}

function normalizeSizes(sizes: string[]) {
  return sizes;
}

function mapProduct(product: BackendProductResponse, index = 0): CatalogProduct {
  const gallery = normalizeList(product.gallery);
  const imageUrl = normalizeImage(product, index);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    subCategory: product.subCategory ?? null,
    brand: inferBrand(product.name),
    price: Number(product.price ?? 0),
    inStock: Boolean(product.inStock),
    stockQuantity: Number(product.stockQuantity ?? 0),
    imageUrl,
    rating: Number(product.rating ?? 0),
    reviewCount: Number(product.reviewCount ?? 0),
    gallery: gallery.length > 0 ? gallery : [imageUrl],
    colorOptions: normalizeColors(normalizeList(product.colorOptions)),
    sizes: normalizeSizes(normalizeList(product.sizes)),
    active: Boolean(product.active),
    createdAt: product.createdAt ?? null,
    updatedAt: product.updatedAt ?? null,
  };
}

function mapCategory(category: BackendCategoryResponse): CatalogCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    iconKey: category.iconKey ?? "grid-2x2",
    subCategories: (category.subCategories ?? []).map((subCategory) => ({
      name: subCategory.name,
      slug: subCategory.slug,
    })),
  };
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const body: ApiResponse<T> = await res.json();
  if (!res.ok) {
    throw new Error(body.message || "Request failed");
  }
  return body;
}

export async function apiGetProducts(): Promise<CatalogProduct[]> {
  const res = await fetch(PRODUCT_SERVICE_URL, {
    method: "GET",
    cache: "no-store",
  });
  const body = await handleResponse<BackendProductResponse[]>(res);
  return (body.data ?? []).map((product, index) => mapProduct(product, index));
}

export async function apiGetAdminProducts(token: string): Promise<CatalogProduct[]> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/admin/all`, {
    method: "GET",
    headers: jsonHeaders(token),
    credentials: "include",
    cache: "no-store",
  });
  const body = await handleResponse<BackendProductResponse[]>(res);
  return (body.data ?? []).map((product, index) => mapProduct(product, index));
}

export async function apiGetProductBySlug(slug: string): Promise<CatalogProduct> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/slug/${encodeURIComponent(slug)}`, {
    method: "GET",
    cache: "no-store",
  });
  const body = await handleResponse<BackendProductResponse>(res);
  return mapProduct(body.data);
}

export async function apiGetProductsByCategory(category: string): Promise<CatalogProduct[]> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/category/${encodeURIComponent(category)}`, {
    method: "GET",
    cache: "no-store",
  });
  const body = await handleResponse<BackendProductResponse[]>(res);
  return (body.data ?? []).map((product, index) => mapProduct(product, index));
}

export async function apiGetCategories(): Promise<CatalogCategory[]> {
  const res = await fetch(`${API_GATEWAY_URL}/api/categories`, {
    method: "GET",
    cache: "no-store",
  });
  const body = await handleResponse<BackendCategoryResponse[]>(res);
  return (body.data ?? []).map(mapCategory);
}

export async function apiCreateCategory(
  token: string,
  name: string,
  iconKey: string
): Promise<CatalogCategory> {
  const res = await fetch(`${API_GATEWAY_URL}/api/categories`, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ name, iconKey }),
  });
  const body = await handleResponse<BackendCategoryResponse>(res);
  return mapCategory(body.data);
}

export async function apiCreateSubCategory(
  token: string,
  categoryId: string,
  name: string
): Promise<CatalogCategory> {
  const res = await fetch(`${API_GATEWAY_URL}/api/categories/${categoryId}/subcategories`, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  const body = await handleResponse<BackendCategoryResponse>(res);
  return mapCategory(body.data);
}

export async function apiCreateProduct(
  token: string,
  request: AdminProductRequest
): Promise<CatalogProduct> {
  const res = await fetch(PRODUCT_SERVICE_URL, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(request),
  });
  const body = await handleResponse<BackendProductResponse>(res);
  return mapProduct(body.data);
}

export async function apiUpdateProduct(
  token: string,
  productId: string,
  request: AdminProductRequest
): Promise<CatalogProduct> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/${productId}`, {
    method: "PUT",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(request),
  });
  const body = await handleResponse<BackendProductResponse>(res);
  return mapProduct(body.data);
}

export async function apiUpdateProductStock(
  token: string,
  productId: string,
  stockQuantity: number
): Promise<CatalogProduct> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/${productId}/stock`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ stockQuantity }),
  });
  const body = await handleResponse<BackendProductResponse>(res);
  return mapProduct(body.data);
}

export async function apiDeleteProduct(token: string, productId: string): Promise<void> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/${productId}`, {
    method: "DELETE",
    headers: jsonHeaders(token),
    credentials: "include",
  });
  await handleResponse<null>(res);
}

export async function apiUploadProductImage(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${PRODUCT_SERVICE_URL}/images`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
    body: formData,
  });
  const body = await handleResponse<ImageUploadResponse>(res);
  return body.data.url;
}

export function mapCatalogProductToCard(product: CatalogProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.imageUrl,
    currentPrice: product.price,
    previousPrice: 0,
    rating: product.rating,
    reviewCount: product.reviewCount,
    colorOptions: product.colorOptions,
  };
}

export function mapCatalogProductToDetails(product: CatalogProduct): ProductDetails {
  const detailGallery = [product.imageUrl, ...product.gallery.filter((image) => image !== product.imageUrl)];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    description: product.description,
    inStock: product.inStock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    breadcrumbs: ["Products", product.category, ...(product.subCategory ? [product.subCategory] : []), product.name],
    gallery: detailGallery,
    colorOptions: product.colorOptions,
    sizes: product.sizes,
  };
}
