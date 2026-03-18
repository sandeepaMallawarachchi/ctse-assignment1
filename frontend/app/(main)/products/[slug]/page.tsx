import { notFound } from "next/navigation";
import ProductDetailsView from "@/components/products/ProductDetailsView";
import {
  apiGetProductBySlug,
  apiGetProducts,
  apiGetProductsByCategory,
  mapCatalogProductToCard,
  mapCatalogProductToDetails,
} from "@/lib/productApi";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await apiGetProductBySlug(slug).catch(() => null);

  if (!product) {
    notFound();
  }

  const relatedCatalogProducts = await apiGetProductsByCategory(product.category).catch(() => apiGetProducts());
  const relatedProducts = relatedCatalogProducts
    .filter((candidate) => candidate.slug !== product.slug)
    .slice(0, 4)
    .map(mapCatalogProductToCard);

  return <ProductDetailsView product={mapCatalogProductToDetails(product)} relatedProducts={relatedProducts} />;
}
