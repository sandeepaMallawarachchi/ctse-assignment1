import BestSelling from "@/components/home/BestSelling";
import BrowseByCategory from "@/components/home/BrowseByCategory";
import CategoryPromo from "@/components/home/CategoryPromo";
import FlashSales from "@/components/home/FlashSales";
import HeroSection from "@/components/home/HeroSection";
import NewArrivals from "@/components/home/NewArrivals";
import Products from "@/components/home/Products";
import ServiceHighlights from "@/components/home/ServiceHighlights";
import { apiGetProducts, mapCatalogProductToCard } from "@/lib/productApi";

export default async function Home() {
  let flashSaleProducts = undefined;
  let bestSellingProducts = undefined;
  let exploreProducts = undefined;

  try {
    const products = await apiGetProducts();
    const activeProducts = products.filter((product) => product.active);
    const sortedByReviews = [...activeProducts].sort(
      (left, right) => right.reviewCount - left.reviewCount || right.rating - left.rating
    );
    const sortedByCreatedAt = [...activeProducts].sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightTime - leftTime;
    });

    flashSaleProducts = activeProducts.slice(0, 5).map(mapCatalogProductToCard);
    bestSellingProducts = sortedByReviews.slice(0, 4).map(mapCatalogProductToCard);
    exploreProducts = (sortedByCreatedAt.length > 0 ? sortedByCreatedAt : activeProducts)
      .slice(0, 12)
      .map(mapCatalogProductToCard);
  } catch {
    flashSaleProducts = undefined;
    bestSellingProducts = undefined;
    exploreProducts = undefined;
  }

  return (
    <div>
      <HeroSection />
      <FlashSales products={flashSaleProducts} />
      <BrowseByCategory />
      <BestSelling products={bestSellingProducts} />
      <CategoryPromo />
      <Products products={exploreProducts} />
      <NewArrivals />
      <ServiceHighlights />
    </div>
  );
}
