import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
}

export default function StatsCard({
  label,
  value,
  sub,
  icon,
  trend,
  trendUp = true,
  highlight = false,
}: StatsCardProps) {
  return (
    <div
      className={`
        rounded-2xl p-5 border transition-all duration-200 hover:shadow-card
        ${highlight
          ? "bg-primary text-white border-primary/20"
          : "bg-white border-neutral-100 text-neutral-900"
        }
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest leading-tight
            ${highlight ? "text-white/60" : "text-neutral-400"}
          `}
        >
          {label}
        </p>
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center
              ${highlight ? "bg-white/10" : "bg-neutral-50"}
            `}
          >
            {icon}
          </div>
        )}
      </div>

      <p
        className={`text-2xl font-extrabold leading-tight
          ${highlight ? "text-white" : "text-neutral-900"}
        `}
      >
        {value}
      </p>

      {sub && (
        <p
          className={`text-xs mt-1 font-medium
            ${highlight ? "text-white/50" : "text-neutral-400"}
          `}
        >
          {sub}
        </p>
      )}

      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trendUp ? (
            <TrendingUp size={11} className={highlight ? "text-green-300" : "text-green-500"} />
          ) : (
            <TrendingDown size={11} className={highlight ? "text-red-300" : "text-red-500"} />
          )}
          <span
            className={`text-xs font-bold
              ${trendUp
                ? highlight ? "text-green-300" : "text-green-600"
                : highlight ? "text-red-300" : "text-red-500"
              }
            `}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
