"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ArrivalItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  layout: "left" | "topRight" | "bottomLeft" | "bottomRight";
};

const arrivals: ArrivalItem[] = [
  {
    id: 1,
    title: "PlayStation 5",
    description: "Black and White version of the PS5 coming out on sale.",
    imageUrl: "/newarrivals/img1.webp",
    alt: "PlayStation 5",
    layout: "left",
  },
  {
    id: 2,
    title: "Women's Collections",
    description: "Featured woman collections that give you another vibe.",
    imageUrl: "/newarrivals/img2.webp",
    alt: "Women's Collections",
    layout: "topRight",
  },
  {
    id: 3,
    title: "Speakers",
    description: "Amazon wireless speakers",
    imageUrl: "/newarrivals/img3.webp",
    alt: "Speakers",
    layout: "bottomLeft",
  },
  {
    id: 4,
    title: "Perfume",
    description: "GUCCI INTENSE OUD EDP",
    imageUrl: "/newarrivals/img4.webp",
    alt: "Perfume",
    layout: "bottomRight",
  },
];

function ArrivalCard({
  title,
  description,
  imageUrl,
  alt,
  className,
  textBlockClassName,
}: ArrivalItem & { className: string; textBlockClassName: string }) {
  return (
    <article className={`relative overflow-hidden rounded bg-black ${className}`}>
      <Image src={imageUrl} alt={alt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <div className={`absolute z-10 text-white ${textBlockClassName}`}>
        <h3 className="font-semibold leading-tight text-white">{title}</h3>
        <p className="mt-2 max-w-[260px] leading-snug text-white/90">{description}</p>
        <Link
          href="#"
          className="mt-3 inline-flex items-center gap-2 border-b border-white pb-0.5 font-medium text-white"
        >
          Shop Now
        </Link>
      </div>
    </article>
  );
}

export default function NewArrivals() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const left = arrivals.find((item) => item.layout === "left");
  const topRight = arrivals.find((item) => item.layout === "topRight");
  const bottomLeft = arrivals.find((item) => item.layout === "bottomLeft");
  const bottomRight = arrivals.find((item) => item.layout === "bottomRight");

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 240);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!left || !topRight || !bottomLeft || !bottomRight) {
    return null;
  }

  return (
    <>
      <section className="mx-auto max-w-[1240px] px-4 py-14 md:px-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-9 w-4 rounded bg-[var(--color-primary-btn)]" />
          <h5 className="font-semibold text-[var(--color-primary-btn)]">Featured</h5>
        </div>

        <h1 className="mb-10 leading-none font-semibold text-[var(--color-text-1)]">New Arrival</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <ArrivalCard
            {...left}
            className="min-h-[500px]"
            textBlockClassName="bottom-6 left-6 md:bottom-8 md:left-8"
          />

          <div className="grid gap-6">
            <ArrivalCard
              {...topRight}
              className="min-h-[240px]"
              textBlockClassName="bottom-5 left-5 md:bottom-7 md:left-7"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <ArrivalCard
                {...bottomLeft}
                className="min-h-[240px]"
                textBlockClassName="bottom-5 left-5"
              />
              <ArrivalCard
                {...bottomRight}
                className="min-h-[240px]"
                textBlockClassName="bottom-5 left-5"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
