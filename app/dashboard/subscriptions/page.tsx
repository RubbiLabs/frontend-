"use client";

import React, { useState } from "react";
import { Pause, Play, X, Plus } from "lucide-react";
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
  const { hasVirtualCard } = useWallet();
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
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  const userSubsList: Subscription[] = userSubscriptions.map((sub: any, idx: number) => ({
    id: idx.toString(),
    name: sub.name,
    fee: Number(sub.fee) / 1e18,
    nextPayment: "Next month",
    streamId: `#RB-${7000 + idx}-00${idx + 1}`,
    uptime: "0 Days",
    status: sub.active ? "active" : "paused",
    color: colorMap[sub.name] || "bg-primary",
  }));

  const totalMonthly = userSubsList.filter(s => s.status === "active").reduce((acc, s) => acc + s.fee, 0);

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

  const doSubscribe = async (item: CatalogItem) => {
    const planIndex = subscriptionPlans.findIndex((p: any) => p.name === item.name);
    if (planIndex === -1) {
      showToast("error", "Plan Not Found", "This subscription plan doesn't exist on-chain yet");
      return;
    }

    try {
      await startSubscription(planIndex, `${address}@rubbi.finance`, "default_password");
      showToast("success", "Subscribed!", `You're now subscribed to ${item.name}.`);
    } catch (err: any) {
      showToast("error", "Subscription Failed", err.message);
    }
  };

  const onCardComplete = () => {
    if (pendingSubscribe) { 
      doSubscribe(pendingSubscribe); 
      setPendingSubscribe(null); 
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("error", "Invalid Amount", "Please enter a valid amount");
      return;
    }
    const amountInWei = BigInt(Math.floor(amount * 1e18));
    await depositFunds(amountInWei);
    setShowDepositModal(false);
    setDepositAmount("");
    showToast("success", "Deposit Submitted", `Depositing ${amount} USDC`);
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
        {isConnected && (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-neutral-200">
            <div>
              <p className="text-xs text-neutral-400">Wallet Balance</p>
              <p className="text-lg font-bold text-neutral-900">{formatBalance(balance)} USDC</p>
            </div>
            <Button size="sm" variant="outlined" onClick={() => setShowDepositModal(true)}>
              Deposit
            </Button>
          </div>
        )}
      </div>

      {!isCorrectNetwork && isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-800">Wrong Network</p>
              <p className="text-sm text-yellow-600">Please switch to Monad Testnet to manage subscriptions</p>
            </div>
          </div>
          <Button size="sm" onClick={switchToMonad}>Switch to Monad</Button>
        </div>
      )}

      <div>
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSubsList.slice(1).map((sub) => (
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
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-primary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Total Outflow (Monthly)</p>
          <p className="text-3xl font-extrabold text-white mt-1">{totalMonthly.toFixed(2)} <span className="text-lg font-bold text-white/60">USDC</span></p>
          <p className="text-xs text-white/50 mt-1">{userSubsList.filter(s => s.status === "active").length} active streams</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Gas Optimization</p>
          <p className="text-sm text-white/80">Batching {userSubsList.length} subscriptions saved 4.2 USDC this month.</p>
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
                <p className="text-xs text-neutral-400 mb-4">{item.fee.toFixed(2)} USDC / {item.period}</p>
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

      <VirtualCardModal open={cardModalOpen} onClose={() => setCardModalOpen(false)} onComplete={onCardComplete} />

      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Deposit Funds</h3>
            <p className="text-sm text-neutral-500 mb-4">Current Balance: {formatBalance(balance)} USDC</p>
            <input
              type="number"
              placeholder="Amount in USDC"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl mb-4"
            />
            <div className="flex gap-2">
              <Button variant="outlined" fullWidth onClick={() => setShowDepositModal(false)}>Cancel</Button>
              <Button fullWidth onClick={handleDeposit}>Deposit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}