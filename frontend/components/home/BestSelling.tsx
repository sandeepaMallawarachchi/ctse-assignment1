import Link from "next/link";
import ProductCard, { type Product } from "../products/ProductCard";

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "The north coat",
    imageUrl: "/products/p5.webp",
    currentPrice: 260,
    previousPrice: 360,
    rating: 5,
    reviewCount: 65,
  },
  {
    id: 2,
    name: "Gucci duffle bag",
    imageUrl: "/products/p6.webp",
    currentPrice: 960,
    previousPrice: 1160,
    rating: 4,
    reviewCount: 65,
  },
  {
    id: 3,
    name: "RGB liquid CPU Cooler",
    imageUrl: "/products/p7.webp",
    currentPrice: 160,
    previousPrice: 170,
    rating: 4,
    reviewCount: 65,
  },
  {
    id: 4,
    name: "Small BookSelf",
    imageUrl: "/products/p8.webp",
    currentPrice: 360,
    previousPrice: 0,
    rating: 5,
    reviewCount: 65,
  },
];

export default function BestSelling({ products = fallbackProducts }: { products?: Product[] }) {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-14 md:px-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-9 w-4 rounded bg-[var(--color-primary-btn)]" />
        <h5 className="font-semibold text-[var(--color-primary-btn)]">This Month</h5>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-5">
        <h1 className="leading-none font-semibold text-[var(--color-text-1)]">Best Selling Products</h1>

        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-md bg-(--color-primary-btn) px-12 text-white transition-colors hover:bg-(--color-primary-btn-hover)"
        >
          View All
        </Link>
      </div>

      <div className="mt-10 flex gap-6 md:justify-between overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
