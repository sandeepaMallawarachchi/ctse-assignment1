import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "success";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-primary-btn)] text-white hover:bg-[var(--color-primary-btn-hover)]",
  secondary: "bg-[var(--color-btn-2)] text-white hover:bg-[var(--color-primary-2)]",
  success: "bg-[var(--color-btn-3)] text-black hover:brightness-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4",
  md: "h-10 px-6",
  lg: "h-11 px-8",
  icon: "h-10 w-10 rounded-full",
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
