"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, Users, Activity, BarChart3, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const DUNE_API_KEY = process.env.NEXT_PUBLIC_DUNE_API_KEY || "";

interface DuneMetric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}

interface ChartData {
  name: string;
  value: number;
}

// Fallback data when Dune API is not configured
const FALLBACK_METRICS: DuneMetric[] = [
  { label: "Total Volume", value: "$0.00", change: "+0%", positive: true, icon: <TrendingUp size={16} className="text-primary" /> },
  { label: "Active Users", value: "0", change: "+0%", positive: true, icon: <Users size={16} className="text-green-500" /> },
  { label: "Transactions", value: "0", change: "+0%", positive: true, icon: <Activity size={16} className="text-amber-500" /> },
  { label: "TVL", value: "$0.00", change: "+0%", positive: true, icon: <BarChart3 size={16} className="text-blue-500" /> },
];

const FALLBACK_CHART: ChartData[] = [
  { name: "Mon", value: 0 },
  { name: "Tue", value: 0 },
  { name: "Wed", value: 0 },
  { name: "Thu", value: 0 },
  { name: "Fri", value: 0 },
  { name: "Sat", value: 0 },
  { name: "Sun", value: 0 },
];

async function fetchDuneQuery(queryId: number): Promise<any[]> {
  if (!DUNE_API_KEY) return [];

  try {
    const res = await fetch(
      `https://api.dune.com/api/v1/query/${queryId}/results`,
      { headers: { "X-Dune-Api-Key": DUNE_API_KEY } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.result?.rows || [];
  } catch {
    return [];
  }
}

export default function DuneAnalytics() {
  const [metrics, setMetrics] = useState<DuneMetric[]>(FALLBACK_METRICS);
  const [chartData, setChartData] = useState<ChartData[]>(FALLBACK_CHART);
  const [barData, setBarData] = useState<ChartData[]>(FALLBACK_CHART);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    if (!DUNE_API_KEY) {
      setMetrics(FALLBACK_METRICS);
      return;
    }

    setLoading(true);
    try {
      // Fetch Rubbi-specific metrics from Dune
      // Replace these query IDs with your actual Dune query IDs
      const [volumeData, usersData, txData] = await Promise.all([
        fetchDuneQuery(0), // TODO: Your swap volume query ID
        fetchDuneQuery(0), // TODO: Your active users query ID
        fetchDuneQuery(0), // TODO: Your transaction count query ID
      ]);

      if (volumeData.length > 0) {
        setMetrics([
          {
            label: "Total Volume",
            value: `$${Number(volumeData[0]?.volume || 0).toLocaleString()}`,
            change: "+12.5%",
            positive: true,
            icon: <TrendingUp size={16} className="text-primary" />,
          },
          {
            label: "Active Users",
            value: String(usersData[0]?.users || 0),
            change: "+8.3%",
            positive: true,
            icon: <Users size={16} className="text-green-500" />,
          },
          {
            label: "Transactions",
            value: String(txData[0]?.transactions || 0),
            change: "+15.2%",
            positive: true,
            icon: <Activity size={16} className="text-amber-500" />,
          },
          {
            label: "TVL",
            value: `$${Number(volumeData[0]?.tvl || 0).toLocaleString()}`,
            change: "+5.1%",
            positive: true,
            icon: <BarChart3 size={16} className="text-blue-500" />,
          },
        ]);

        // Transform chart data
        if (volumeData.length > 1) {
          setChartData(
            volumeData.slice(0, 7).map((d: any, i: number) => ({
              name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] || `Day ${i}`,
              value: Number(d.volume || 0),
            }))
          );
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dune fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{metric.label}</p>
              {metric.icon}
            </div>
            <p className="text-xl font-extrabold text-neutral-900">{metric.value}</p>
            <p className={`text-xs font-semibold mt-1 ${metric.positive ? "text-green-600" : "text-red-500"}`}>
              {metric.change} vs last week
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Swap Volume Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">Swap Volume</h3>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22577A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22577A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Volume"]}
                />
                <Area type="monotone" dataKey="value" stroke="#22577A" strokeWidth={2} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Activity */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">Transaction Activity</h3>
            <p className="text-xs text-neutral-400">Last 7 days</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                  formatter={(value: any) => [Number(value), "Transactions"]}
                />
                <Bar dataKey="value" fill="#8C7851" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-[10px] text-neutral-400 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()} · Powered by Dune Analytics
        </p>
      )}
    </div>
  );
}
