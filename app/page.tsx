import BestSelling from "@/components/home/BestSelling";
import BrowseByCategory from "@/components/home/BrowseByCategory";
import CategoryPromo from "@/components/home/CategoryPromo";
import FlashSales from "@/components/home/FlashSales";
import HeroSection from "@/components/home/HeroSection";
import NewArrivals from "@/components/home/NewArrivals";
import Products from "@/components/home/Products";
import ServiceHighlights from "@/components/home/ServiceHighlights";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FlashSales />
      <BrowseByCategory />
      <BestSelling />
      <CategoryPromo />
      <Products />
      <NewArrivals />
      <ServiceHighlights />
    </div>
  );
}
