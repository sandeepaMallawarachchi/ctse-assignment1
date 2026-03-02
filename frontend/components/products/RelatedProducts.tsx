import ProductCard, { type Product } from "@/components/products/ProductCard";

type RelatedProductsProps = {
  products: Product[];
};

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="mt-24">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-9 w-4 rounded bg-[var(--color-primary-btn)]" />
        <h5 className="font-semibold text-[var(--color-primary-btn)]">Related Item</h5>
      </div>

      <div className="flex gap-6 md:justify-between overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
