"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroSlides = [
  { id: 1, src: "/hero/img1.webp", alt: "Hero slide 1" },
  { id: 2, src: "/hero/img2.webp", alt: "Hero slide 2" },
  { id: 3, src: "/hero/img1.webp", alt: "Hero slide 3" },
] as const;

const autoSlideIntervalMs = 4500;

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, autoSlideIntervalMs);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative md:mt-5 h-96 overflow-hidden bg-black">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {heroSlides.map((slide) => (
          <div key={slide.id} className="relative h-full min-w-full">
            <Image src={slide.src} alt={slide.alt} fill priority={slide.id === 1} className="object-contain" />
          </div>
        ))}
      </div>

      <div className="absolute bottom-12 md:left-14 left-1/2 -translate-x-1/2 md:translate-x-0 text-center md:text-left z-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-3 border-b border-white pb-1 text-lg font-medium text-white"
        >
          Shop Now
          <ArrowRight size={26} />
        </Link>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        {heroSlides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-3.5 w-3.5 rounded-full transition ${
                isActive
                  ? "border-2 border-white bg-[var(--color-primary-btn)]"
                  : "bg-white/55 hover:bg-white/80"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
