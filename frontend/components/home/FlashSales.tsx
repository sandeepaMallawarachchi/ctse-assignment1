"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard, { type Product } from "../products/ProductCard";

type CountdownValue = {
    label: string;
    value: string;
};

const FLASH_SALE_DURATION_SECONDS = (((3 * 24) + 23) * 60 + 19) * 60 + 56;

const fallbackProducts: Product[] = [
    {
        id: 1,
        name: "HAVIT HV-G92 Gamepad",
        imageUrl: "/products/p1.webp",
        discountPercent: 40,
        currentPrice: 120,
        previousPrice: 160,
        rating: 5,
        reviewCount: 88,
    },
    {
        id: 2,
        name: "AK-900 Wired Keyboard",
        imageUrl: "/products/p2.webp",
        discountPercent: 35,
        currentPrice: 960,
        previousPrice: 1160,
        rating: 4,
        reviewCount: 75,
    },
    {
        id: 3,
        name: "IPS LCD Gaming Monitor",
        imageUrl: "/products/p3.webp",
        discountPercent: 30,
        currentPrice: 370,
        previousPrice: 400,
        rating: 5,
        reviewCount: 99,
    },
    {
        id: 4,
        name: "S-Series Comfort Chair",
        imageUrl: "/products/p4.webp",
        discountPercent: 25,
        currentPrice: 375,
        previousPrice: 400,
        rating: 4,
        reviewCount: 99,
    },
    {
        id: 5,
        name: "S-Series Comfort Chair",
        imageUrl: "/products/p4.webp",
        discountPercent: 25,
        currentPrice: 375,
        previousPrice: 400,
        rating: 4,
        reviewCount: 99,
    },
];

const carouselConfig = {
    itemWidth: 250,
    itemGap: 24,
} as const;

function Countdown({ data }: { data: CountdownValue[] }) {
    return (
        <div className="flex md:items-end items-center md:w-auto w-full justify-center gap-3 md:ml-12 lg:ml-16">
            {data.map((entry, index) => (
                <div key={entry.label} className="flex md:items-end items-center gap-2">
                    <div>
                        <h6 className="font-medium text-(--color-text-1)">{entry.label}</h6>
                        <h2 className="leading-none font-bold tracking-[0.04em] text-(--color-text-1)">
                            {entry.value}
                        </h2>
                    </div>
                    {index !== data.length - 1 ? (
                        <h4 className="pb-1 text-(--color-primary-btn-hover)">:</h4>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export default function FlashSales({ products = fallbackProducts }: { products?: Product[] }) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(FLASH_SALE_DURATION_SECONDS);

    const scrollAmount = useMemo(
        () => carouselConfig.itemWidth + carouselConfig.itemGap,
        [],
    );
    const countdownData = useMemo<CountdownValue[]>(() => {
        const days = Math.floor(timeLeftSeconds / 86400);
        const hours = Math.floor((timeLeftSeconds % 86400) / 3600);
        const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
        const seconds = timeLeftSeconds % 60;

        return [
            { label: "Days", value: String(days).padStart(2, "0") },
            { label: "Hours", value: String(hours).padStart(2, "0") },
            { label: "Minutes", value: String(minutes).padStart(2, "0") },
            { label: "Seconds", value: String(seconds).padStart(2, "0") },
        ];
    }, [timeLeftSeconds]);

    const syncButtonState = () => {
        if (!trackRef.current) {
            return;
        }

        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
        const maxScrollLeft = scrollWidth - clientWidth;
        const tolerance = 4;

        setCanScrollLeft(scrollLeft > tolerance);
        setCanScrollRight(scrollLeft < maxScrollLeft - tolerance);
    };

    useEffect(() => {
        syncButtonState();
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setTimeLeftSeconds((current) =>
                current <= 1 ? FLASH_SALE_DURATION_SECONDS : current - 1
            );
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const handleArrowClick = (direction: "left" | "right") => {
        if (!trackRef.current) {
            return;
        }

        const nextOffset = direction === "left" ? -scrollAmount : scrollAmount;
        trackRef.current.scrollBy({ left: nextOffset, behavior: "smooth" });

        window.setTimeout(syncButtonState, 220);
    };

    return (
        <section className="mx-auto max-w-310 px-4 py-20 md:px-8 border-b border-gray-200">
            <div className="mb-5 flex items-center gap-3">
                <div className="h-9 w-4 rounded bg-(--color-primary-btn)" />
                <h5 className="font-semibold text-(--color-primary-btn)">Today&apos;s</h5>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-y-5">
                <div className="flex flex-wrap items-end md:space-y-0 space-y-5">
                    <h1 className="leading-none font-semibold text-(--color-text-1)">
                        Flash Sales
                    </h1>
                    <Countdown data={countdownData} />
                </div>

                <div className="flex items-center gap-2 justify-end">
                    <button
                        aria-label="Previous products"
                        onClick={() => handleArrowClick("left")}
                        disabled={!canScrollLeft}
                        className="bg-(--color-secondary) text-(--color-text-1) hover:bg-(--color-secondary-2) rounded-full p-3"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        aria-label="Next products"
                        onClick={() => handleArrowClick("right")}
                        disabled={!canScrollRight}
                        className="bg-(--color-secondary) text-(--color-text-1) hover:bg-(--color-secondary-2) rounded-full p-3"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={trackRef}
                onScroll={syncButtonState}
                className="mt-8 flex gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div className="mt-12 flex justify-center">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-(--color-primary-btn) px-10 text-white transition-colors hover:bg-(--color-primary-btn-hover)"
                >
                    View All Products
                </Link>
            </div>
        </section>
    );
}
