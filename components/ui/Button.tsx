"use client";
import React from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outlined" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md",
  secondary: "bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark shadow-sm",
  outlined: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white",
  ghost: "bg-transparent text-primary hover:bg-primary/8",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${styles[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin shrink-0" />}
      {!loading && icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
