"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

type BreadcrumbProps = {
  homeLabel?: string;
  hiddenPaths?: string[];
  labelsMap?: Record<string, string>;
};

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Breadcrumb({
  homeLabel = "Home",
  hiddenPaths = ["/"],
  labelsMap = {},
}: BreadcrumbProps) {
  const pathname = usePathname();

  if (!pathname || hiddenPaths.includes(pathname)) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-[1240px] px-4 pt-10 md:px-8">
      <ol className="flex flex-wrap items-center gap-2 text-(--color-text-2)">
        <li>
          <Link href="/" className="transition hover:text-(--color-text-1)">
            {homeLabel}
          </Link>
        </li>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = labelsMap[segment] ?? formatSegment(segment);

          return (
            <li key={href} className="flex items-center gap-2">
              <ChevronRight size={14} />
              {isLast ? (
                <span className="font-medium text-(--color-text-1)">{label}</span>
              ) : (
                <Link href={href} className="transition hover:text-(--color-text-1)">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
