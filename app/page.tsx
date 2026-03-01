import BestSelling from "@/components/home/BestSelling";
import BrowseByCategory from "@/components/home/BrowseByCategory";
import CategoryPromo from "@/components/home/CategoryPromo";
import FlashSales from "@/components/home/FlashSales";
import HeroSection from "@/components/home/HeroSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FlashSales />
      <BrowseByCategory />
      <BestSelling />
      <CategoryPromo />
    </div>
  );
}
