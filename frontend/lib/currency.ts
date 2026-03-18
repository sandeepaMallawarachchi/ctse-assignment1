export function formatLkr(
  value: number,
  options?: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  }
) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
    minimumFractionDigits: options?.minimumFractionDigits,
  }).format(value);
}
