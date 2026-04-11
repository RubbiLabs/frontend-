"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, ArrowUpRight, Calendar, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useSubscription } from "@/hooks/useContracts";
import { useSalaryStreaming } from "@/hooks/useSalaryStreaming";
import StatsCard from "../../components/dashboard/StatsCard";
import ActivityChart from "../../components/dashboard/ActivityChart";
import RubbiTokenABI from "@/Abis/RubbiToken.json";
import ModalABI from "@/Abis/Modal.json";

const MONAD_TESTNET_CHAIN_ID = 10143;
const rubbiTokenAddress = process.env.NEXT_PUBLIC_RUBBI_TOKEN_ADDRESS as `0x${string}`;
const modalContractAddress = process.env.NEXT_PUBLIC_MODAL_CONTRACT_ADDRESS as `0x${string}`;

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
  const { address, isConnected } = useAccount();
  const { userSubscriptions } = useSubscription();
  const { dailyStreams, monthlyStreams } = useSalaryStreaming();
  const [rubbiBalance, setRubbiBalance] = useState<string>("0");
  const [modalBalance, setModalBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalances() {
      if (!address || !isConnected) {
        setLoading(false);
        return;
      }

      try {
        const [rubbiRes, modalRes] = await Promise.all([
          fetch(`https://testnet-rpc.monad.xyz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_call",
              params: [{ to: rubbiTokenAddress, data: `0x70a08231000000000000000000000000${address.slice(2)}` }, "latest"],
              id: 1,
            }),
          }),
          fetch(`https://testnet-rpc.monad.xyz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_call",
              params: [{ to: modalContractAddress, data: `0xf8b2cb4f000000000000000000000000${address.slice(2)}` }, "latest"],
              id: 1,
            }),
          }),
        ]);

        const rubbiData = await rubbiRes.json();
        const modalData = await modalRes.json();

        const rubbiBal = rubbiData.result ? parseInt(rubbiData.result, 16) / 1e18 : 0;
        const modalBal = modalData.result ? parseInt(modalData.result, 16) / 1e18 : 0;

        setRubbiBalance(rubbiBal.toFixed(2));
        setModalBalance(modalBal.toFixed(2));
      } catch (err) {
        console.error("Error fetching balances:", err);
      }
      setLoading(false);
    }

    fetchBalances();
  }, [address, isConnected]);

  const totalBalance = (Number(rubbiBalance) + Number(modalBalance)).toFixed(2);
  const activeSubs = userSubscriptions.filter((s: any) => s.active).length;
  const totalStreams = dailyStreams.length + monthlyStreams.length;

  const activities = [
    { id: "1", icon: "subscription", label: activeSubs > 0 ? "Active Subscriptions" : "No Active Subscriptions", amount: `-${(activeSubs * 10).toFixed(2)} RUBBI`, time: "Now", status: activeSubs > 0 ? "ACTIVE" : "NONE", positive: false },
    { id: "2", icon: "stream", label: totalStreams > 0 ? "Salary Streams Active" : "No Salary Streams", amount: totalStreams > 0 ? `${totalStreams} Active` : "—", time: "Now", status: totalStreams > 0 ? "AUTOMATED" : "NONE", positive: true },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="RUBBI Balance"
          value={loading ? "—" : Number(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          sub={loading ? "Loading..." : `${Number(rubbiBalance)} in wallet, ${Number(modalBalance)} in contract`}
          icon={<span className="text-primary text-[11px] font-extrabold">RUB</span>}
        />
        <StatsCard
          label="Modal Contract"
          value={loading ? "—" : Number(modalBalance).toFixed(2)}
          sub={loading ? "Loading..." : "Available for subscriptions"}
          icon={<div className="w-4 h-4 rounded-full bg-blue-300" />}
        />
        <StatsCard
          label="Active Subscriptions"
          value={activeSubs.toString()}
          sub={activeSubs > 0 ? `${activeSubs} plan${activeSubs > 1 ? "s" : ""} active` : "No active plans"}
          icon={<Calendar size={14} className="text-primary" />}
        />
        <StatsCard
          label="Salary Streams"
          value={totalStreams.toString()}
          sub={totalStreams > 0 ? `${dailyStreams.length} daily, ${monthlyStreams.length} monthly` : "No streams"}
          icon={<TrendingUp size={14} className="text-primary" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <ActivityChart className="lg:col-span-2" />

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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColors[a.status] || "bg-neutral-100 text-neutral-500"}`}>
                      {a.status}
                    </span>
                    <span className={`text-sm font-bold ${a.positive ? "text-green-600" : "text-neutral-600"}`}>
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