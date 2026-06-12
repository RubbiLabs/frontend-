import Image from "next/image";
import React from "react";

interface LogoProps {
  size?: number;
  dark?: boolean;
  showText?: boolean;
  className?: string;
}

export default function RubbiLogo({ size = 32, dark = false, showText = true, className = "" }: LogoProps) {
  const textColor = dark ? "#F7F7F2" : "#22577A";
  const wordmarkSize = Math.round(size * 2.2);

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/brand/rubbi-logo.png"
        alt="Rubbi"
        width={showText ? wordmarkSize : size}
        height={size}
        className={showText ? "h-auto w-auto max-w-[120px]" : "h-auto w-auto"}
        priority={size >= 36}
      />
      {showText && (
        <span
          className="sr-only"
          style={{
            fontSize: size * 0.56,
            color: textColor,
            fontFamily: "'Manrope', sans-serif",
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
