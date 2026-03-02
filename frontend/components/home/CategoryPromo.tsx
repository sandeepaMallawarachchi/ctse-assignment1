import Image from "next/image";
import Link from "next/link";

export default function CategoryPromo() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-14 md:px-8">
      <div className="relative overflow-hidden rounded bg-black">
        <div className="relative aspect-[16/9] md:aspect-[16/6]">
          <Image
            src="/category.webp"
            alt="Category promotion"
            fill
            sizes="(max-width: 768px) 100vw, 1240px"
            className="object-contain"
          />
        </div>

        <div className="absolute bottom-[10%] md:left-[10%] left-1/2 -translate-x-1/2 md:translate-x-0 text-center md:text-left">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-md bg-(--color-btn-3) px-10 text-black transition hover:brightness-95"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
