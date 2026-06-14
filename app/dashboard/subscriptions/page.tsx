"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Pause, Play, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import VirtualCardModal from "../../../components/dashboard/VirtualCardModal";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";
import { useSubscription } from "@/hooks/useContracts";
import { subscriptionCatalog, type CatalogItem } from "@/lib/subscriptions";
import { useAccount, useChainId } from "wagmi";

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700 uppercase",
  inactive: "bg-neutral-100 text-neutral-600 uppercase",
  canceled: "bg-red-100 text-red-700 uppercase",
};

type CategoryFilter = "all" | "entertainment" | "cloud" | "productivity";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export default function SubscriptionsPage() {
  const { hasVirtualCard, virtualCardData } = useWallet();
  const { success, error, info } = useToast();
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const {
    subscriptionPlans,
    userSubscriptions,
    isLoadingPlans,
    startSubscription,
    isSubscribing,
    subscribeSuccess,
    pauseSubscription,
    resumeSubscription,
    refetchPlans,
    refetchSubs,
  } = useSubscription();

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState<CatalogItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const activeSubscriptionsRef = useRef<HTMLDivElement>(null);

  const isCorrectNetwork = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;

  // Map on-chain subscription plans to UI format
  const onChainPlans = (subscriptionPlans as any[] || []).map((plan: any, i: number) => ({
    id: String(i),
    name: plan.name,
    fee: Number(plan.fee) / 1e18,
    active: plan.active,
  }));

  // Map on-chain user subscriptions to UI format
  const userSubs = (userSubscriptions as any[] || []).map((sub: any) => ({
    planId: String(sub.subPlanId),
    name: sub.name,
    fee: Number(sub.fee) / 1e18,
    active: sub.active,
    address: sub.userAddress,
  }));

  const activeSubs = userSubs.filter((s: any) => s.active);
  const totalMonthly = activeSubs.reduce((acc: number, s: any) => acc + s.fee, 0);

  // Case-insensitive plan matching helper
  const findOnChainPlan = (itemName: string) => {
    return onChainPlans.find((p: any) => p.name.toLowerCase() === itemName.toLowerCase());
  };

  const focusActiveSubscriptions = () => {
    window.setTimeout(() => {
      activeSubscriptionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const handlePauseResume = async (planId: string, isActive: boolean, name: string) => {
    if (!isConnected) {
      error("Not Connected", "Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      error("Wrong Network", "Please switch to Arbitrum Sepolia");
      return;
    }

    setLoadingId(planId);
    try {
      const numPlanId = parseInt(planId);
      if (isActive) {
        await pauseSubscription(numPlanId);
      } else {
        await resumeSubscription(numPlanId);
      }
      success(isActive ? "Subscription Paused" : "Subscription Resumed", name);
      await refetchSubs();
    } catch (err: any) {
      error("Action Failed", err.message);
    }
    setLoadingId(null);
  };

  const doSubscribe = async (item: CatalogItem) => {
    if (!isConnected) {
      error("Not Connected", "Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      error("Wrong Network", "Please switch to Arbitrum Sepolia");
      return;
    }

    // Find the on-chain plan ID for this catalog item
    const planIndex = onChainPlans.findIndex((p: any) => p.name === item.name);
    if (planIndex === -1) {
      error("Plan Not Found", `Subscription plan "${item.name}" not found on-chain. The admin needs to add it first.`);
      return;
    }

    // Check if already subscribed
    const alreadySubscribed = userSubs.some((s: any) => s.planId === String(planIndex) && s.active);
    if (alreadySubscribed) {
      error("Already Subscribed", `You're already subscribed to ${item.name}.`);
      return;
    }

    setLoadingId(String(planIndex));
    try {
      // Use a dummy email/password for now (the contract requires these params)
      const email = `${virtualCardData?.cardHolder || "user"}@rubbi.finance`;
      const password = "rubbi-sub";
      await startSubscription(planIndex, email, password);
      success("Subscribed!", `You're now subscribed to ${item.name}.`);
      focusActiveSubscriptions();
      await refetchSubs();
    } catch (err: any) {
      error("Subscription Failed", err.message);
    }
    setLoadingId(null);
  };

  const handleSubscribe = (item: CatalogItem) => {
    if (!hasVirtualCard) {
      setPendingSubscribe(item);
      setCardModalOpen(true);
      return;
    }

    if (!virtualCardData?.isActive) {
      error("Card Inactive", "Reactivate your virtual card from the Card page before starting a new subscription.");
      return;
    }

    doSubscribe(item);
  };

  const onCardComplete = () => {
    if (!pendingSubscribe) return;
    doSubscribe(pendingSubscribe);
    setPendingSubscribe(null);
  };

  const filteredCatalog =
    categoryFilter === "all" ? subscriptionCatalog : subscriptionCatalog.filter((item) => item.category === categoryFilter);

  // Get logo for a plan name
  const getLogo = (name: string) => {
    const catalogItem = subscriptionCatalog.find(c => c.name === name);
    return catalogItem?.logo || "/subscriptions/default.svg";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Subscriptions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Automating {userSubs.length} recurring agreement{userSubs.length !== 1 ? "s" : ""}
            {isLoadingPlans && <span className="ml-2 text-xs text-neutral-400">(loading from chain...)</span>}
          </p>
        </div>
      </div>

      {!isCorrectNetwork && isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">!</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-800">Wrong Network</p>
              <p className="text-sm text-yellow-600">Switch to Arbitrum Sepolia to manage subscriptions</p>
            </div>
          </div>
        </div>
      )}

      <div ref={activeSubscriptionsRef}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Active Subscriptions</h2>

        {userSubs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-neutral-100 text-center">
            <p className="text-neutral-400 text-sm">No active subscriptions. Browse the catalog below to subscribe.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userSubs.map((sub: any) => (
              <div key={sub.planId} className="bg-white rounded-2xl p-6 border border-neutral-100">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                      <Image src={getLogo(sub.name)} alt={`${sub.name} logo`} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-neutral-900">{sub.name}</h3>
                      <p className="text-sm text-neutral-400">Plan ID: #{sub.planId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-neutral-900">{sub.fee.toFixed(2)}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${sub.active ? statusBadge.active : statusBadge.paused}`}>
                        {sub.active ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-neutral-100">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-xs text-neutral-400 mb-0.5">Subscriber</p>
                      <p className="font-semibold text-neutral-700 font-mono text-xs">{sub.address?.slice(0, 10)}...</p>
                    </div>
                  </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <Button
                      size="sm"
                      variant="outlined"
                      icon={sub.active ? <Pause size={14} /> : <Play size={14} />}
                      loading={loadingId === sub.planId}
                      onClick={() => handlePauseResume(sub.planId, sub.active, sub.name)}
                    >
                      {sub.active ? "Pause" : "Resume"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-primary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Total Outflow (Monthly)</p>
          <p className="text-3xl font-extrabold text-white mt-1">
            {totalMonthly.toFixed(2)} <span className="text-lg font-bold text-white/60">RUB</span>
          </p>
          <p className="text-xs text-white/50 mt-1">{activeSubs.length} active streams</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Available Catalog</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Instant Ledger-to-Vendor settlements</p>
          </div>
          <div className="flex gap-2">
            {(["all", "entertainment", "cloud", "productivity"] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${categoryFilter === cat ? "bg-primary text-white" : "bg-white border border-neutral-200 text-neutral-500 hover:border-primary/30"}`}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredCatalog.map((item) => {
            const onChainPlan = findOnChainPlan(item.name);
            const isSubscribed = userSubs.some((s: any) => s.planId === onChainPlan?.id && s.active);
            const planExists = !!onChainPlan;

            return (
              <div key={item.name} className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-card transition-all">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 mb-4">
                  <Image src={item.logo} alt={`${item.name} logo`} fill className="object-cover" sizes="44px" />
                </div>
                <p className="font-bold text-neutral-800 text-sm mb-1">{item.name}</p>
                <p className="text-xs text-neutral-400 mb-4">
                  {item.fee.toFixed(2)} RUB / {item.period}
                </p>
                {!planExists ? (
                  <Button size="sm" fullWidth variant="ghost" disabled className="!text-neutral-400">
                    Coming Soon
                  </Button>
                ) : isSubscribed ? (
                  <Button size="sm" fullWidth variant="ghost" disabled>
                    Subscribed ✓
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    fullWidth
                    variant="outlined"
                    loading={loadingId === onChainPlan?.id}
                    onClick={() => handleSubscribe(item)}
                  >
                    Subscribe
                  </Button>
                )}
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
