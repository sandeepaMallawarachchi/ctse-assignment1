"use client";

import { Eye, Heart, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAppDispatch } from "@/store/hooks";
import { addCartItem } from "@/store/cartSlice";
import { formatLkr } from "@/lib/currency";

export type ProductId = string | number;

export type Product = {
  id: ProductId;
  name: string;
  slug?: string;
  imageUrl: string;
  discountPercent?: number;
  currentPrice: number;
  previousPrice: number;
  rating: number;
  reviewCount: number;
  badgeLabel?: string;
  badgeVariant?: "primary" | "success";
  colorOptions?: string[];
};

type ProductCardProps = {
  product: Product;
  onWishlistClick?: (productId: ProductId) => void;
  onQuickViewClick?: (productId: ProductId) => void;
  onAddToCartClick?: (productId: ProductId) => void;
};

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
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
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

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductCard({
  product,
  onWishlistClick,
  onQuickViewClick,
  onAddToCartClick,
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const isRemoteImage = /^https?:\/\//i.test(product.imageUrl);
  const shouldShowDiscount = (product.discountPercent ?? 0) > 0;
  const badgeLabel = product.badgeLabel ?? (shouldShowDiscount ? `-${product.discountPercent}%` : null);
  const badgeClassName =
    product.badgeVariant === "success" ? "bg-(--color-btn-3) text-white" : "bg-(--color-primary-btn) text-white";
  const productSlug = product.slug ?? toSlug(product.name);

  const navigateToDetails = () => {
    router.push(`/products/${productSlug}`);
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(
        addCartItem({
          productId: String(product.id),
          productName: product.name,
          price: product.currentPrice,
          imageUrl: product.imageUrl,
        })
      ).unwrap();

      showToast({
        title: "Added to cart",
        description: `${product.name} was added to your cart.`,
        variant: "success",
      });
      onAddToCartClick?.(product.id);
    } catch (error) {
      showToast({
        title: "Could not add to cart",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <article className="w-[250px] shrink-0">
      <div
        className="group relative h-[230px] cursor-pointer overflow-hidden rounded bg-(--color-secondary)"
        onClick={navigateToDetails}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigateToDetails();
          }
        }}
      >
        {badgeLabel ? (
          <div className={`absolute left-3 top-3 rounded px-2.5 py-1 ${badgeClassName}`}>
            <h6>{badgeLabel}</h6>
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
            onClick={() => {
              if (onQuickViewClick) {
                onQuickViewClick(product.id);
                return;
              }
              navigateToDetails();
            }}
          >
            <Eye size={16} strokeWidth={1.8} />
          </IconButton>
        </div>

        <div className="flex h-full items-center justify-center pb-8">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={180}
            height={160}
            unoptimized={isRemoteImage}
            className="h-44 w-52 object-contain"
          />
        </div>

        <button
          type="button"
          onClick={async (event) => {
            event.stopPropagation();
            await handleAddToCart();
          }}
          className="absolute bottom-0 left-0 w-full translate-y-full bg-(--color-btn-2) py-2 font-medium text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Add To Cart
        </button>
      </div>

      <h5 className="mt-3 cursor-pointer leading-tight font-medium text-(--color-text-1)" onClick={navigateToDetails}>
        {product.name}
      </h5>

      <div className="mt-1.5 flex items-center gap-3 font-medium">
        <h5 className="text-(--color-primary-btn)">{formatLkr(product.currentPrice)}</h5>
        {product.previousPrice > 0 ? (
          <h5 className="text-(--color-text-1)/50 line-through">
            {formatLkr(product.previousPrice)}
          </h5>
        ) : null}
      </div>

      <Rating rating={product.rating} reviewCount={product.reviewCount} />

      {product.colorOptions?.length ? (
        <div className="mt-2 flex items-center gap-2">
          {product.colorOptions.map((color, index) => (
            <span
              key={`${product.id}-${color}-${index}`}
              className={`inline-flex h-5 w-5 rounded-full border-2 ${
                index === 0 ? "border-black" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
