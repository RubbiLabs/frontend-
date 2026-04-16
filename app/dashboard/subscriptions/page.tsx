"use client";
import React, { useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import VirtualCardModal from "../../../components/dashboard/VirtualCardModal";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";
import { useSubscription, useModalContract } from "@/hooks/useContracts";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useAccount } from "wagmi";

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

const colorMap: Record<string, string> = {
  "Disney+ Standard": "bg-blue-600",
  "YouTube Premium": "bg-red-500",
  "Creative Cloud": "bg-red-700",
  "Figma Professional": "bg-purple-600",
  "GitHub Pro": "bg-neutral-800",
  "Notion Plus": "bg-neutral-700",
};

type CategoryFilter = "all" | "entertainment" | "cloud" | "finance";

export default function SubscriptionsPage() {
  const { hasVirtualCard, virtualCardData } = useWallet();
  const { showToast } = useToast();
  const { isConnected, address } = useAccount();
  const { isCorrectNetwork, switchToMonad } = useNetworkSwitch();
  
  const { 
    subscriptionPlans, 
    userSubscriptions, 
    startSubscription, 
    isSubscribing,
    pauseSubscription,
    resumeSubscription,
  } = useSubscription();
  
  const { balance, depositFunds } = useModalContract();
  
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState<CatalogItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const activeSubscriptionsRef = useRef<HTMLDivElement>(null);

  const totalMonthly = subs.filter(s => s.status === "active").reduce((acc, s) => acc + s.fee, 0);

  const focusActiveSubscriptions = () => {
    window.setTimeout(() => {
      activeSubscriptionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const handlePauseResume = async (sub: Subscription) => {
    if (!isConnected) {
      showToast("error", "Not Connected", "Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }
    
    setLoadingId(sub.id);
    try {
      if (sub.status === "active") {
        await pauseSubscription(parseInt(sub.id));
        showToast("success", "Subscription Paused", sub.name);
      } else {
        await resumeSubscription(parseInt(sub.id));
        showToast("success", "Subscription Resumed", sub.name);
      }
    } catch (err: any) {
      showToast("error", "Action Failed", err.message);
    }
    setLoadingId(null);
  };

  const handleCancel = (sub: Subscription) => {
    showToast("info", "Subscription Cancelled", `${sub.name} has been removed.`);
  };

  const handleSubscribe = (item: CatalogItem) => {
    if (!isConnected) {
      showToast("error", "Not Connected", "Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet first");
      return;
    }
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
    focusActiveSubscriptions();
  };

  const onCardComplete = () => {
    if (pendingSubscribe) {
      doSubscribe(pendingSubscribe);
      setPendingSubscribe(null);
    }
  };

  const filteredCatalog = categoryFilter === "all" ? catalog : catalog.filter(c => c.category === categoryFilter);

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal) / 1e18;
    return num.toFixed(4);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Subscriptions</h1>
          <p className="text-sm text-neutral-500 mt-1">Automating {userSubsList.length} recurring agreement{userSubsList.length !== 1 ? "s" : ""}</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white" />
            <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-white -ml-3" />
            <div className="w-8 h-8 rounded-full bg-tertiary/30 border-2 border-white -ml-3" />
          </div>
          <Button size="sm" variant="outlined">
            <span className="uppercase tracking-wider text-xs">Connect Wallet</span>
          </Button>
        </div> */}
      </div>

      {hasVirtualCard && virtualCardData && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Saved Subscription Card</p>
              <h2 className="text-lg font-bold text-neutral-900">Ready for instant checkout</h2>
              <p className="text-sm text-neutral-500 mt-1">This wallet already has a Rubbi card, so new subscriptions can start immediately.</p>
            </div>
            <div className="bg-primary rounded-2xl p-5 min-w-[280px] card-shine">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Rubbi Virtual Card</p>
              <p className="font-mono text-white tracking-widest mb-4">{virtualCardData.cardNumber}</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-white/40">HOLDER</p>
                  <p className="text-sm font-bold text-white">{virtualCardData.cardHolder}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">EXP</p>
                  <p className="text-sm font-bold text-white">{virtualCardData.expiry}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">CVV</p>
                  <p className="text-sm font-bold text-white">{virtualCardData.cvv}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Subscriptions */}
      <div ref={activeSubscriptionsRef}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Active Subscriptions</h2>

        {userSubsList.length === 0 ? (
          <div className="bg-neutral-50 rounded-2xl p-12 text-center border border-neutral-100">
            <p className="text-neutral-500 mb-4">No active subscriptions yet</p>
            <p className="text-sm text-neutral-400">Browse the catalog below to subscribe to services</p>
          </div>
        ) : (
          <>
            {userSubsList[0] && (
              <div className="bg-white rounded-2xl p-6 border border-neutral-100 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-14 h-14 ${userSubsList[0].color} rounded-xl flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-xl">{userSubsList[0].name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-neutral-900">{userSubsList[0].name}</h3>
                      <p className="text-sm text-neutral-400">Next payment: {userSubsList[0].nextPayment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-neutral-900">{userSubsList[0].fee.toFixed(2)}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusBadge[userSubsList[0].status]}`}>{userSubsList[0].status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-neutral-100">
                  <div className="flex gap-6 text-sm">
                    <div><p className="text-xs text-neutral-400 mb-0.5">Stream ID</p><p className="font-semibold text-neutral-700">{userSubsList[0].streamId}</p></div>
                    <div><p className="text-xs text-neutral-400 mb-0.5">Uptime</p><p className="font-semibold text-neutral-700">{userSubsList[0].uptime}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outlined" icon={userSubsList[0].status === "active" ? <Pause size={14} /> : <Play size={14} />}
                      loading={loadingId === userSubsList[0].id} onClick={() => handlePauseResume(userSubsList[0])}>
                      {userSubsList[0].status === "active" ? "Pause" : "Resume"}
                    </Button>
                    <Button size="sm" variant="danger" icon={<X size={14} />} onClick={() => handleCancel(userSubsList[0])}>Cancel</Button>
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
                  <p className="text-xs font-semibold text-neutral-400">RUB</p>
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
                {/* <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"><Settings size={14} className="text-neutral-400" /></button> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Total Outflow (Monthly)</p>
          <p className="text-3xl font-extrabold text-white mt-1">{totalMonthly.toFixed(2)} <span className="text-lg font-bold text-white/60">RUB</span></p>
          <p className="text-xs text-white/50 mt-1">{subs.filter(s => s.status === "active").length} active streams</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Gas Optimization</p>
          <p className="text-sm text-white/80">Batching {subs.length} subscriptions saved 4.2 RUB this month.</p>
        </div>
      </div>

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
            const subscribed = userSubsList.some(s => s.name === item.name);
            return (
              <div key={item.name} className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-card transition-all">
                <div className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-white font-bold">{item.name.charAt(0)}</span>
                </div>
                <p className="font-bold text-neutral-800 text-sm mb-1">{item.name}</p>
                <p className="text-xs text-neutral-400 mb-4">{item.fee.toFixed(2)} RUB / {item.period}</p>
                <Button
                  size="sm"
                  fullWidth
                  variant={subscribed ? "ghost" : "outlined"}
                  disabled={subscribed || isSubscribing}
                  loading={isSubscribing}
                  onClick={() => handleSubscribe(item)}
                >
                  {subscribed ? "Subscribed ✓" : "Subscribe"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <VirtualCardModal
        open={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setPendingSubscribe(null);
        }}
        onComplete={onCardComplete}
      />
    </div>
  );
}