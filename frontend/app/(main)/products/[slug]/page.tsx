import { notFound } from "next/navigation";
import type { Product } from "@/components/products/ProductCard";
import ProductDetailsView from "@/components/products/ProductDetailsView";

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

const productBySlug: Record<string, ProductDetails> = {
  "havit-hv-g92-gamepad": {
    id: 1,
    slug: "havit-hv-g92-gamepad",
    name: "Havic HV G-92 Gamepad",
    price: 192,
    description:
      "PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal Pressure sensitive.",
    inStock: true,
    rating: 4,
    reviewCount: 150,
    breadcrumbs: ["Account", "Gaming", "Havic HV G-92 Gamepad"],
    gallery: [
      "/sample/img1.webp",
      "/sample/img2.webp",
      "/sample/img3.webp",
      "/sample/img4.webp",
    ],
    colorOptions: ["#A0BCE0", "#E07575"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
};

const relatedProducts: Product[] = [
  {
    id: 201,
    name: "HAVIT HV-G92 Gamepad",
    imageUrl: "/products/p1.webp",
    discountPercent: 40,
    currentPrice: 120,
    previousPrice: 160,
    rating: 5,
    reviewCount: 88,
  },
  {
    id: 202,
    name: "AK-900 Wired Keyboard",
    imageUrl: "/products/p2.webp",
    discountPercent: 35,
    currentPrice: 960,
    previousPrice: 1160,
    rating: 4,
    reviewCount: 75,
  },
  {
    id: 203,
    name: "IPS LCD Gaming Monitor",
    imageUrl: "/products/p3.webp",
    discountPercent: 30,
    currentPrice: 370,
    previousPrice: 400,
    rating: 5,
    reviewCount: 99,
  },
  {
    id: 204,
    name: "RGB liquid CPU Cooler",
    imageUrl: "/products/p15.webp",
    currentPrice: 160,
    previousPrice: 170,
    rating: 4,
    reviewCount: 65,
  },
];

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = productBySlug[slug];

  if (!product) {
    notFound();
  }

  return <ProductDetailsView product={product} relatedProducts={relatedProducts} />;
}
