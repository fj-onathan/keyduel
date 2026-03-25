import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const baseClass =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variantClass: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-accent to-accent-strong text-[#2b1300]",
  secondary:
    "border border-white/20 bg-[#16110d]/75 text-[#f2e7da] hover:border-white/30",
};

export function Button({
  variant = "secondary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${baseClass} ${variantClass[variant]} ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
