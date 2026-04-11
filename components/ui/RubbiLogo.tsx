import React from "react";

interface LogoProps {
  size?: number;
  dark?: boolean;
  showText?: boolean;
}

export default function RubbiLogo({ size = 32, dark = false, showText = true }: LogoProps) {
  const color = dark ? "#F7F7F2" : "#22577A";

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon - stylized R */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="10" fill={color} />
        {/* Rubbi-style icon mark */}
        <path
          d="M12 8H26C31.523 8 36 12.477 36 18C36 22.072 33.572 25.572 30.08 27.2L36 40H28L22.8 28H20V40H12V8Z"
          fill={dark ? "#22577A" : "#F7F7F2"}
        />
        <path
          d="M20 14V22H26C28.209 22 30 20.209 30 18C30 15.791 28.209 14 26 14H20Z"
          fill={color}
        />
        {/* Small dot accent */}
        <circle cx="38" cy="38" r="4" fill="#8C7851" />
      </svg>

      {showText && (
        <span
          className="font-bold tracking-tight"
          style={{
            fontSize: size * 0.56,
            color,
            fontFamily: "'Manrope', sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          Rubbi
        </span>
      )}
    </div>
  );
}

// Inline text-only logo for places that just need the wordmark
export function RubbiWordmark({ dark = false, size = "base" }: { dark?: boolean; size?: "sm" | "base" | "lg" | "xl" }) {
  const sizes = { sm: "text-sm", base: "text-base", lg: "text-xl", xl: "text-2xl" };
  return (
    <span
      className={`font-bold tracking-tight ${sizes[size]}`}
      style={{ color: dark ? "#F7F7F2" : "#22577A" }}
    >
      Rubbi
    </span>
  );
}
