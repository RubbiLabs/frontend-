"use client";
import React from "react";
import { TrendingUp, RefreshCw, ArrowUpRight, Calendar } from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import StatsCard from "../../components/dashboard/StatsCard";
import ActivityChart from "../../components/dashboard/ActivityChart";

const activities = [
  { id: "1", icon: "subscription", label: "Cloud Service Sub", amount: "-45.00 MON", time: "2m ago", status: "PENDING", positive: false },
  { id: "2", icon: "stream", label: "Weekly Salary Stream", amount: "+12.50 MON", time: "4h ago", status: "AUTOMATED", positive: true },
  { id: "3", icon: "bridge", label: "Bridge: Ethereum", amount: "250.00 MON", time: "1d ago", status: "COMPLETED", positive: true },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  AUTOMATED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const ActivityIcon = ({ type }: { type: string }) => {
  const base = "w-10 h-10 rounded-xl flex items-center justify-center text-white";
  if (type === "subscription") return <div className={`${base} bg-tertiary`}><RefreshCw size={15} /></div>;
  if (type === "stream") return <div className={`${base} bg-primary`}><TrendingUp size={15} /></div>;
  return <div className={`${base} bg-secondary`}><ArrowUpRight size={15} /></div>;
};

export default function DashboardPage() {
  const { rubBalance } = useWallet();
  const balance = Number(rubBalance || 12450.80);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time surveillance of your liquidity nodes and automated salary streams across the Monad ledger.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Monad Testnet</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Rubbi Balance"
          value={balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          sub="+240.20 (24h)"
          icon={<span className="text-primary text-[11px] font-extrabold">RUB</span>}
          trend="+1.97%"
          trendUp
        />
        <StatsCard
          label="Monad Balance"
          value="842.15 MON"
          sub="≈ $3,124.00 USD"
          icon={<div className="w-4 h-4 rounded-full bg-purple-300" />}
        />
        <StatsCard
          label="Total Active Subscriptions"
          value="12"
          sub="Renewing in 3 days"
          icon={<Calendar size={14} className="text-primary" />}
        />
        <StatsCard
          label="Total Salary Streams"
          value="04"
          sub="Flowing: 0.25 MON / hr"
          icon={<TrendingUp size={14} className="text-primary" />}
        />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ActivityChart className="lg:col-span-2" />

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100">
          <h3 className="font-bold text-neutral-900 mb-5">Recent Activities</h3>
          <div className="space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <ActivityIcon type={a.icon} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-semibold text-neutral-800 truncate">{a.label}</p>
                    <p className="text-xs text-neutral-400 shrink-0">{a.time}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColors[a.status]}`}>
                      {a.status}
                    </span>
                    <span className={`text-sm font-bold ${a.positive ? "text-green-600" : "text-red-500"}`}>
                      {a.amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full text-center text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
            View All Ledger Logs
          </button>
        </div>
      </div>
    </div>
  );
}
