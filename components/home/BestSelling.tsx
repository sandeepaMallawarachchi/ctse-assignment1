import { Button } from "@/components/ui/button";
import ProductCard, { type Product } from "./ProductCard";

const products: Product[] = [
  {
    id: 1,
    name: "The north coat",
    imageUrl: "/products/p12.webp",
    currentPrice: 260,
    previousPrice: 360,
    rating: 5,
    reviewCount: 65,
    showAddToCart: true,
  },
  {
    id: 2,
    name: "Gucci duffle bag",
    imageUrl: "/products/p13.webp",
    currentPrice: 960,
    previousPrice: 1160,
    rating: 4,
    reviewCount: 65,
    showAddToCart: true,
  },
  {
    id: 3,
    name: "RGB liquid CPU Cooler",
    imageUrl: "/products/p14.webp",
    currentPrice: 160,
    previousPrice: 170,
    rating: 4,
    reviewCount: 65,
    showAddToCart: true,
  },
  {
    id: 4,
    name: "Small BookSelf",
    imageUrl: "/products/p15.webp",
    currentPrice: 360,
    previousPrice: 0,
    rating: 5,
    reviewCount: 65,
    showAddToCart: true,
  },
];

export default function BestSelling() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-14 md:px-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-9 w-4 rounded bg-[var(--color-primary-btn)]" />
        <h5 className="font-semibold text-[var(--color-primary-btn)]">This Month</h5>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-5">
        <h1 className="leading-none font-semibold text-[var(--color-text-1)]">Best Selling Products</h1>

        <Button variant="primary" size="lg" className="px-12">
          View All
        </Button>
      </div>

      <div className="mt-10 flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
