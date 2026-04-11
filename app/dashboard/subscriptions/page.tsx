"use client";
import React, { useState } from "react";
import { Pause, Play, X, Settings, Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import VirtualCardModal from "../../../components/dashboard/VirtualCardModal";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";

interface Subscription {
  id: string;
  name: string;
  fee: number;
  nextPayment: string;
  streamId: string;
  uptime: string;
  status: "active" | "paused";
  color: string;
}

interface CatalogItem {
  name: string;
  fee: number;
  period: string;
  color: string;
  category: "entertainment" | "cloud" | "finance";
}

const mockSubs: Subscription[] = [
  { id: "1", name: "Netflix Premium", fee: 15.99, nextPayment: "Nov 24, 2024", streamId: "#RB-7729-001", uptime: "342 Days", status: "active", color: "bg-red-600" },
  { id: "2", name: "DSTV Premium Plus", fee: 45.00, nextPayment: "Pending", streamId: "#RB-7730-002", uptime: "120 Days", status: "paused", color: "bg-blue-800" },
  { id: "3", name: "Spotify Family Plan", fee: 9.99, nextPayment: "Nov 30, 2024", streamId: "#RB-7731-003", uptime: "200 Days", status: "active", color: "bg-green-600" },
  { id: "4", name: "AWS Cloud Instance", fee: 71.52, nextPayment: "Dec 1, 2024", streamId: "#RB-7732-004", uptime: "90 Days", status: "active", color: "bg-orange-500" },
];

const catalog: CatalogItem[] = [
  { name: "Disney+ Standard", fee: 7.99, period: "MONTH", color: "bg-blue-600", category: "entertainment" },
  { name: "YouTube Premium", fee: 11.99, period: "MONTH", color: "bg-red-500", category: "entertainment" },
  { name: "Creative Cloud", fee: 52.99, period: "MONTH", color: "bg-red-700", category: "cloud" },
  { name: "Figma Professional", fee: 15.00, period: "MONTH", color: "bg-purple-600", category: "finance" },
  { name: "GitHub Pro", fee: 4.00, period: "MONTH", color: "bg-neutral-800", category: "cloud" },
  { name: "Notion Plus", fee: 8.00, period: "MONTH", color: "bg-neutral-700", category: "cloud" },
];

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700 uppercase",
};

type CategoryFilter = "all" | "entertainment" | "cloud" | "finance";

export default function SubscriptionsPage() {
  const { hasVirtualCard } = useWallet();
  const { success, error, info } = useToast();
  const [subs, setSubs] = useState<Subscription[]>(mockSubs);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState<CatalogItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const totalMonthly = subs.filter(s => s.status === "active").reduce((acc, s) => acc + s.fee, 0);

  const handlePauseResume = async (sub: Subscription) => {
    setLoadingId(sub.id);
    await new Promise(r => setTimeout(r, 900));
    setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, status: s.status === "active" ? "paused" : "active" } : s));
    success(sub.status === "active" ? "Subscription Paused" : "Subscription Resumed", sub.name);
    setLoadingId(null);
  };

  const handleCancel = (sub: Subscription) => {
    setSubs(prev => prev.filter(s => s.id !== sub.id));
    info("Subscription Cancelled", `${sub.name} has been removed.`);
  };

  const handleSubscribe = (item: CatalogItem) => {
    if (!hasVirtualCard) {
      setPendingSubscribe(item);
      setCardModalOpen(true);
      return;
    }
    doSubscribe(item);
  };

  const doSubscribe = (item: CatalogItem) => {
    const alreadySubscribed = subs.some(s => s.name === item.name);
    if (alreadySubscribed) { error("Already Subscribed", `You're already subscribed to ${item.name}.`); return; }
    const newSub: Subscription = {
      id: Date.now().toString(), name: item.name, fee: item.fee,
      nextPayment: "Next month", streamId: `#RB-${Math.floor(7000 + Math.random() * 1000)}-00${subs.length + 1}`,
      uptime: "0 Days", status: "active", color: item.color,
    };
    setSubs(prev => [...prev, newSub]);
    success("Subscribed!", `You're now subscribed to ${item.name}.`);
  };

  const onCardComplete = () => {
    if (pendingSubscribe) { doSubscribe(pendingSubscribe); setPendingSubscribe(null); }
  };

  const filteredCatalog = categoryFilter === "all" ? catalog : catalog.filter(c => c.category === categoryFilter);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Subscriptions</h1>
          <p className="text-sm text-neutral-500 mt-1">Automating {subs.length} recurring agreement{subs.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-white -ml-3" />
            <div className="w-8 h-8 rounded-full bg-tertiary/30 border-2 border-white -ml-3" />
          </div>
          <Button size="sm" variant="outlined">
            <span className="uppercase tracking-wider text-xs">Connect Wallet</span>
          </Button>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Active Subscriptions</h2>

        {/* Featured sub */}
        {subs[0] && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-14 h-14 ${subs[0].color} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="text-white font-bold text-xl">{subs[0].name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-neutral-900">{subs[0].name}</h3>
                  <p className="text-sm text-neutral-400">Next payment: {subs[0].nextPayment}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-neutral-900">{subs[0].fee.toFixed(2)}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusBadge[subs[0].status]}`}>{subs[0].status.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-neutral-100">
              <div className="flex gap-6 text-sm">
                <div><p className="text-xs text-neutral-400 mb-0.5">Stream ID</p><p className="font-semibold text-neutral-700">{subs[0].streamId}</p></div>
                <div><p className="text-xs text-neutral-400 mb-0.5">Uptime</p><p className="font-semibold text-neutral-700">{subs[0].uptime}</p></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outlined" icon={subs[0].status === "active" ? <Pause size={14} /> : <Play size={14} />}
                  loading={loadingId === subs[0].id} onClick={() => handlePauseResume(subs[0])}>
                  {subs[0].status === "active" ? "Pause" : "Resume"}
                </Button>
                <Button size="sm" variant="danger" icon={<X size={14} />} onClick={() => handleCancel(subs[0])}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Remaining subs grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subs.slice(1).map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 ${sub.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold">{sub.name.charAt(0)}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-neutral-900">{sub.fee.toFixed(2)}</p>
                  <p className="text-xs font-semibold text-neutral-400">USDC</p>
                </div>
              </div>
              <h3 className="font-bold text-neutral-800 mb-1">{sub.name}</h3>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusBadge[sub.status]}`}>
                  {sub.status === "paused" ? "ON HOLD" : "ACTIVE"}
                </span>
              </div>
              <div className="flex gap-2">
                {sub.status === "paused" ? (
                  <Button size="sm" fullWidth loading={loadingId === sub.id} onClick={() => handlePauseResume(sub)} icon={<Play size={13} />}>
                    Resume
                  </Button>
                ) : (
                  <Button size="sm" variant="outlined" fullWidth loading={loadingId === sub.id} onClick={() => handlePauseResume(sub)} icon={<Pause size={13} />}>
                    Pause
                  </Button>
                )}
                <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"><Settings size={14} className="text-neutral-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total outflow */}
      <div className="bg-primary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Total Outflow (Monthly)</p>
          <p className="text-3xl font-extrabold text-white mt-1">{totalMonthly.toFixed(2)} <span className="text-lg font-bold text-white/60">USDC</span></p>
          <p className="text-xs text-white/50 mt-1">{subs.filter(s => s.status === "active").length} active streams</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Gas Optimization</p>
          <p className="text-sm text-white/80">Batching {subs.length} subscriptions saved 4.2 USDC this month.</p>
        </div>
      </div>

      {/* Available Catalog */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Available Catalog</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Instant Ledger-to-Vendor settlements</p>
          </div>
          <div className="flex gap-2">
            {(["all", "entertainment", "cloud", "finance"] as CategoryFilter[]).map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${categoryFilter === cat ? "bg-primary text-white" : "bg-white border border-neutral-200 text-neutral-500 hover:border-primary/30"}`}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCatalog.map((item) => {
            const subscribed = subs.some(s => s.name === item.name);
            return (
              <div key={item.name} className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-card transition-all">
                <div className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-white font-bold">{item.name.charAt(0)}</span>
                </div>
                <p className="font-bold text-neutral-800 text-sm mb-1">{item.name}</p>
                <p className="text-xs text-neutral-400 mb-4">{item.fee.toFixed(2)} USDC / {item.period}</p>
                <Button
                  size="sm"
                  fullWidth
                  variant={subscribed ? "ghost" : "outlined"}
                  disabled={subscribed}
                  onClick={() => handleSubscribe(item)}
                >
                  {subscribed ? "Subscribed ✓" : "Subscribe"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <VirtualCardModal open={cardModalOpen} onClose={() => setCardModalOpen(false)} onComplete={onCardComplete} />
    </div>
  );
}
