import {
  Camera,
  Gamepad2,
  Grid2x2,
  Headphones,
  HeartPulse,
  House,
  Monitor,
  Shirt,
  Smartphone,
  Sparkles,
  Watch,
} from "lucide-react";

export const categoryIconOptions = [
  { key: "smartphone", label: "Phone", icon: Smartphone },
  { key: "monitor", label: "Computer", icon: Monitor },
  { key: "watch", label: "Watch", icon: Watch },
  { key: "camera", label: "Camera", icon: Camera },
  { key: "headphones", label: "Audio", icon: Headphones },
  { key: "gamepad-2", label: "Gaming", icon: Gamepad2 },
  { key: "shirt", label: "Fashion", icon: Shirt },
  { key: "house", label: "Home", icon: House },
  { key: "sparkles", label: "Beauty", icon: Sparkles },
  { key: "heart-pulse", label: "Health", icon: HeartPulse },
  { key: "grid-2x2", label: "General", icon: Grid2x2 },
] as const;

export const categoryIconMap = Object.fromEntries(
  categoryIconOptions.map((item) => [item.key, item.icon])
) as Record<string, (typeof categoryIconOptions)[number]["icon"]>;

export function getCategoryIcon(iconKey?: string | null) {
  return categoryIconMap[iconKey ?? ""] ?? Grid2x2;
}
