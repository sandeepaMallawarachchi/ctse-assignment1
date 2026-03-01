"use client";

import { Heart, Minus, Plus, RefreshCcw, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/components/products/ProductCard";
import RelatedProducts from "./RelatedProducts";

type ProductDetails = {
  id: number;
  slug: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  breadcrumbs: string[];
  gallery: string[];
  colorOptions: string[];
  sizes: string[];
};

type ProductDetailsViewProps = {
  product: ProductDetails;
  relatedProducts: Product[];
};

function Rating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={16}
            strokeWidth={1.6}
            className={index < fullStars ? "fill-[#FFAD33] text-[#FFAD33]" : "text-[#B9B9B9]"}
          />
        ))}
      </div>
      <span className="text-(--color-text-2)">({reviewCount} Reviews)</span>
      <span className="text-(--color-text-2)">|</span>
      <span className="text-[var(--color-btn-3)]">In Stock</span>
    </div>
  );
}

export default function ProductDetailsView({ product, relatedProducts }: ProductDetailsViewProps) {
  const [selectedImage, setSelectedImage] = useState(product.gallery[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] ?? product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const priceLabel = useMemo(() => `$${product.price.toFixed(2)}`, [product.price]);

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-20 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[160px_1fr_420px] lg:gap-6">
        <div className="order-2 grid grid-cols-4 gap-3 sm:order-1 sm:grid-cols-4 lg:grid-cols-1">
          {product.gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative h-[120px] overflow-hidden rounded bg-(--color-secondary) p-2 ${
                selectedImage === image ? "ring-2 ring-(--color-primary-btn)" : ""
              }`}
              aria-label={`Select image ${index + 1}`}
            >
              <Image src={image} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-contain p-5" />
            </button>
          ))}
        </div>

        <div className="order-1 relative h-[400px] overflow-hidden rounded bg-(--color-secondary) sm:h-full lg:order-2">
          <Image src={selectedImage} alt={product.name} fill className="object-contain p-10" />
        </div>

        <div className="order-3">
          <h2 className="font-semibold text-(--color-text-1)">{product.name}</h2>

          <div className="mt-4">
            <Rating rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <h5 className="mt-4 text-4xl text-(--color-text-1)">{priceLabel}</h5>
          <p className="mt-4 border-b border-black/20 pb-6 leading-relaxed text-(--color-text-1)">{product.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-(--color-text-1)">Colours:</span>
            <div className="flex items-center gap-2">
              {product.colorOptions.map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  className={`inline-flex h-5 w-5 rounded-full border-2 ${index === 0 ? "border-black" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-(--color-text-1)">Size:</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`h-8 min-w-9 rounded border px-2 ${
                    selectedSize === size
                      ? "border-(--color-primary-btn) bg-(--color-primary-btn) text-white"
                      : "border-black/30 bg-white text-(--color-text-1)"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex h-10 items-center rounded border border-black/30">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="inline-flex h-10 w-10 items-center justify-center"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="inline-flex h-10 w-12 items-center justify-center border-x border-black/30">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="inline-flex h-10 w-10 items-center justify-center bg-(--color-primary-btn) text-white"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <Button variant="primary" size="lg" className="h-10 px-8 w-full">
              Buy Now
            </Button>

            <button
              type="button"
              aria-label="Add to wishlist"
              className="inline-flex h-10 w-20 items-center justify-center rounded border border-black/30 text-(--color-text-1)"
            >
              <Heart size={18} />
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded border border-black/30">
            <div className="flex gap-3 border-b border-black/20 p-4">
              <Truck size={26} />
              <div>
                <h6 className="font-semibold text-(--color-text-1)">Free Delivery</h6>
                <Link href="/products" className="underline">
                  Enter your postal code for Delivery Availability
                </Link>
              </div>
            </div>

            <div className="flex gap-3 p-4">
              <RefreshCcw size={26} />
              <div>
                <h6 className="font-semibold text-(--color-text-1)">Return Delivery</h6>
                <p className="text-(--color-text-1)">
                  Free 30 Days Delivery Returns. <Link href="/products" className="underline">Details</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} />
    </section>
  );
}
