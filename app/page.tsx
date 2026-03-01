import Categories from "@/components/home/Categories";
import FlashSales from "@/components/home/FlashSales";
import Hero from "@/components/home/Hero";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-[1240px] px-4 pt-3 md:px-8 md:pt-0">
        <div className="grid gap-4 md:grid-cols-[280px_1fr] md:gap-8">
          <Categories />
          <Hero />
        </div>
      </section>

      <FlashSales />
    </div>
  );
}
