"use client";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const chartData = [
  { day: "MON 01", streams: 4200, txs: 18 },
  { day: "MON 08", streams: 8100, txs: 34 },
  { day: "MON 15", streams: 28200, txs: 112 },
  { day: "MON 22", streams: 12400, txs: 56 },
  { day: "MON 30", streams: 15800, txs: 73 },
];

type ChartMode = "streams" | "txs";

interface ActivityChartProps {
  className?: string;
}

export default function ActivityChart({ className = "" }: ActivityChartProps) {
  const [mode, setMode] = useState<ChartMode>("streams");

  const peakIndex = chartData.reduce(
    (best, d, i) => (d[mode] > chartData[best][mode] ? i : best),
    0
  );

  return (
    <div className={`bg-white rounded-2xl p-6 border border-neutral-100 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-neutral-900 text-base">Activity Analytics</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Successful transactions &amp; streams (Last 30 Days)
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1 bg-neutral-50 border border-neutral-100 p-1 rounded-lg">
          {(["streams", "txs"] as ChartMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all
                ${mode === m
                  ? "bg-white text-primary shadow-sm"
                  : "text-neutral-400 hover:text-neutral-600"
                }
              `}
            >
              {m === "streams" ? "Streams" : "TXS"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={36} barCategoryGap="30%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fill: "#9A9A91",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 600,
            }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(34,87,122,0.04)", radius: 6 }}
            contentStyle={{
              background: "#fff",
              border: "1px solid #E0E0D9",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: "Manrope, sans-serif",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [
              Number(value).toLocaleString(),
              mode === "streams" ? "Streams" : "TXS",
            ]}
          />
          <Bar dataKey={mode} radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === peakIndex ? "#22577A" : "#C2DFF0"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
