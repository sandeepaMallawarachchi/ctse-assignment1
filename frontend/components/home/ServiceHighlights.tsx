"use client";

import { Headset, ShieldCheck, Truck } from "lucide-react";

type Highlight = {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const highlights: Highlight[] = [
  {
    id: 1,
    title: "FREE AND FAST DELIVERY",
    description: "Free delivery for all orders over LKR 140",
    icon: Truck,
  },
  {
    id: 2,
    title: "24/7 CUSTOMER SERVICE",
    description: "Friendly 24/7 customer support",
    icon: Headset,
  },
  {
    id: 3,
    title: "MONEY BACK GUARANTEE",
    description: "We return money within 30 days",
    icon: ShieldCheck,
  },
];

function HighlightCard({ title, description, icon: Icon }: Highlight) {
  return (
    <article className="text-center">
      <div className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-black/20">
        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-black text-white">
          <Icon size={30} strokeWidth={1.9} />
        </div>
      </div>

      <h3 className="mt-6 font-semibold text-[var(--color-text-1)]">{title}</h3>
      <p className="mt-2 text-[var(--color-text-1)]/90">{description}</p>
    </article>
  );
}

export default function ServiceHighlights() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-20">
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {highlights.map((item) => (
          <HighlightCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
