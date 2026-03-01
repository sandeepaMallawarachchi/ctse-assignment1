import BrowseByCategory from "@/components/home/BrowseByCategory";
import FlashSales from "@/components/home/FlashSales";
import HeroSection from "@/components/home/HeroSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FlashSales />
      <BrowseByCategory />
    </div>
  );
}
