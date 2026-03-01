"use client";

import { Eye, Heart, Star } from "lucide-react";
import Image from "next/image";

export type Product = {
  id: number;
  name: string;
  imageUrl: string;
  discountPercent?: number;
  currentPrice: number;
  previousPrice: number;
  rating: number;
  reviewCount: number;
  showAddToCart?: boolean;
};

type ProductCardProps = {
  product: Product;
  onWishlistClick?: (productId: number) => void;
  onQuickViewClick?: (productId: number) => void;
  onAddToCartClick?: (productId: number) => void;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-primary) text-(--color-text-1) transition hover:bg-(--color-primary-2) hover:text-white"
    >
      {children}
    </button>
  );
}

function Rating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating);

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={14}
            strokeWidth={1.6}
            className={index < fullStars ? "fill-[#FFAD33] text-[#FFAD33]" : "text-[#B9B9B9]"}
          />
        ))}
      </div>
      <span className="font-semibold text-(--color-text-2)">({reviewCount})</span>
    </div>
  );
}

export default function ProductCard({
  product,
  onWishlistClick,
  onQuickViewClick,
  onAddToCartClick,
}: ProductCardProps) {
  const shouldShowDiscount = (product.discountPercent ?? 0) > 0;
  const shouldShowAddToCart = product.showAddToCart ?? true;

  return (
    <article className="w-[250px] shrink-0">
      <div className="group relative h-[230px] overflow-hidden rounded bg-(--color-secondary)">
        {shouldShowDiscount ? (
          <div className="absolute left-3 top-3 rounded bg-(--color-primary-btn) px-2.5 py-1 text-white">
            <h6>-{product.discountPercent}%</h6>
          </div>
        ) : null}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <IconButton
            label={`Add ${product.name} to wishlist`}
            onClick={() => onWishlistClick?.(product.id)}
          >
            <Heart size={16} strokeWidth={1.8} />
          </IconButton>
          <IconButton
            label={`Quick view ${product.name}`}
            onClick={() => onQuickViewClick?.(product.id)}
          >
            <Eye size={16} strokeWidth={1.8} />
          </IconButton>
        </div>

        <div className="flex h-full items-center justify-center px-4 pb-8">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={180}
            height={160}
            className="h-40 w-45 object-contain"
          />
        </div>

        {shouldShowAddToCart ? (
          <button
            type="button"
            onClick={() => onAddToCartClick?.(product.id)}
            className="absolute bottom-0 left-0 w-full translate-y-full bg-(--color-btn-2) py-2 font-medium text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          >
            Add To Cart
          </button>
        ) : null}
      </div>

      <h3 className="mt-3 leading-tight font-medium text-(--color-text-1)">{product.name}</h3>

      <div className="mt-1.5 flex items-center gap-3 font-medium">
        <h3 className="text-(--color-primary-btn)">{priceFormatter.format(product.currentPrice)}</h3>
        {product.previousPrice > 0 ? (
          <h3 className="text-(--color-text-1)/50 line-through">
            {priceFormatter.format(product.previousPrice)}
          </h3>
        ) : null}
      </div>

      <Rating rating={product.rating} reviewCount={product.reviewCount} />
    </article>
  );
}
