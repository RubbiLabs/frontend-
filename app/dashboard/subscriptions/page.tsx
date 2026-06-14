"use client";
import React, { useState, useMemo } from "react";
import {
  Pause,
  Play,
  Search,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { useSubscription } from "@/hooks/useContracts";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import VirtualCardModal from "@/components/dashboard/VirtualCardModal";
import SubscriptionPlanModal from "@/components/dashboard/SubscriptionPlanModal";
import {
  subscriptionChannels,
  categoryLabels,
  type CatalogChannel,
  type SubscriptionPlanTier,
} from "@/lib/subscriptions";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export default function SubscriptionsPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { hasVirtualCard } = useWallet();
  const { showToast } = useToast();

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
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] =
    useState<CatalogChannel | null>(null);
  const [pendingSubscribe, setPendingSubscribe] = useState<{
    channel: CatalogChannel;
    tier: SubscriptionPlanTier;
  } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isWrongNetwork = chainId !== ARBITRUM_SEPOLIA_CHAIN_ID;

  // Map on-chain subscriptions to lookup set
  const subscribedNames = useMemo(() => {
    if (!userSubscriptions) return new Set<string>();
    return new Set(
      (userSubscriptions as any[]).map((s: any) =>
        s.planName?.toLowerCase() || ""
      )
    );
  }, [userSubscriptions]);

  // Map on-chain plans for lookup
  const onChainPlanMap = useMemo(() => {
    if (!subscriptionPlans) return new Map<string, number>();
    const m = new Map<string, number>();
    (subscriptionPlans as any[]).forEach((p: any, i: number) => {
      m.set(p.name?.toLowerCase(), Number(p.planId ?? i));
    });
    return m;
  }, [subscriptionPlans]);

  // User subscription status lookup
  const userSubStatus = useMemo(() => {
    if (!userSubscriptions) return new Map<string, boolean>();
    const m = new Map<string, boolean>();
    (userSubscriptions as any[]).forEach((s: any) => {
      m.set(s.planName?.toLowerCase(), s.active);
    });
    return m;
  }, [userSubscriptions]);

  const monthlyOutflow = useMemo(() => {
    if (!userSubscriptions) return 0;
    return (userSubscriptions as any[]).reduce(
      (sum: number, s: any) => sum + Number(s.fee || 0n) / 1e18,
      0
    );
  }, [userSubscriptions]);

  const filteredChannels = useMemo(() => {
    return subscriptionChannels.filter((ch) => {
      const matchesCategory =
        categoryFilter === "all" || ch.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const handleChannelClick = (channel: CatalogChannel) => {
    if (isWrongNetwork) {
      showToast(
        "error",
        "Wrong Network",
        "Please switch to Arbitrum Sepolia."
      );
      return;
    }
    setSelectedChannel(channel);
    setPlanModalOpen(true);
  };

  const handleSelectTier = (channel: CatalogChannel, tier: SubscriptionPlanTier) => {
    setPlanModalOpen(false);

    if (!hasVirtualCard) {
      setPendingSubscribe({ channel, tier });
      setCardModalOpen(true);
      return;
    }

    doSubscribe(channel, tier);
  };

  const doSubscribe = async (channel: CatalogChannel, tier: SubscriptionPlanTier) => {
    if (!address) {
      showToast("error", "No Wallet", "Please connect your wallet.");
      return;
    }

    setLoadingId(tier.id);
    try {
      // Find the on-chain plan that matches this tier
      const planId = onChainPlanMap.get(tier.id);
      if (planId === undefined) {
        showToast(
          "error",
          "Plan Not Found",
          `"${tier.name}" plan not found on-chain. Admin must add it first.`
        );
        setLoadingId(null);
        return;
      }

      const email = `user@rubbi.finance`;
      const password = "rubbi-sub";
      await startSubscription(planId, email, password);

      showToast(
        "success",
        "Subscribed!",
        `You're now subscribed to ${channel.name} ${tier.name}.`
      );
      refetchSubs();
      refetchPlans();
    } catch (err: any) {
      showToast("error", "Subscription Failed", err.message || "Transaction failed.");
    } finally {
      setLoadingId(null);
    }
  };

  const handlePauseResume = async (
    planName: string,
    isActive: boolean
  ) => {
    if (isWrongNetwork) {
      showToast("error", "Wrong Network", "Switch to Arbitrum Sepolia.");
      return;
    }
    setLoadingId(planName);
    try {
      const planId = onChainPlanMap.get(planName.toLowerCase());
      if (planId === undefined) {
        showToast("error", "Plan Not Found", "Could not find on-chain plan ID.");
        setLoadingId(null);
        return;
      }

      if (isActive) {
        await pauseSubscription(planId);
        showToast("info", "Paused", `${planName} subscription paused.`);
      } else {
        await resumeSubscription(planId);
        showToast("success", "Resumed", `${planName} subscription resumed.`);
      }
      refetchSubs();
    } catch (err: any) {
      showToast("error", "Action Failed", err.message || "Transaction failed.");
    } finally {
      setLoadingId(null);
    }
  };

  const onCardComplete = () => {
    if (pendingSubscribe) {
      doSubscribe(pendingSubscribe.channel, pendingSubscribe.tier);
      setPendingSubscribe(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">
          Subscriptions
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your streaming and service subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Active
          </p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {userSubscriptions
              ? (userSubscriptions as any[]).filter((s: any) => s.active).length
              : 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Monthly Outflow
          </p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {monthlyOutflow.toFixed(2)} RUB
          </p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Available Plans
          </p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {subscriptionChannels.length}
          </p>
        </div>
      </div>

      {/* Active Subscriptions */}
      {userSubscriptions && (userSubscriptions as any[]).length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-neutral-900 mb-3">
            Your Subscriptions
          </h2>
          <div className="space-y-2">
            {(userSubscriptions as any[]).map((sub: any, i: number) => {
              const name = sub.planName || "Unknown";
              const fee = Number(sub.fee || 0n) / 1e18;
              const isActive = sub.active;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{name}</p>
                      <p className="text-xs text-neutral-500">
                        {fee.toFixed(2)} RUB/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isActive ? "Active" : "Paused"}
                    </span>
                    <Button
                      size="sm"
                      variant={isActive ? "outlined" : "primary"}
                      loading={loadingId === name.toLowerCase()}
                      onClick={() => handlePauseResume(name, isActive)}
                      icon={
                        isActive ? (
                          <Pause size={12} />
                        ) : (
                          <Play size={12} />
                        )
                      }
                    >
                      {isActive ? "Pause" : "Resume"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Browse Catalog */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900 mb-3">
          Browse Channels
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoryFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === key
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Channel Grid */}
        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => {
              const lowestPrice = Math.min(
                ...channel.tiers.map((t) => t.priceUsd)
              );
              const highestPrice = Math.max(
                ...channel.tiers.map((t) => t.priceUsd)
              );
              const lowestRub = Math.min(
                ...channel.tiers.map((t) => t.priceRub)
              );

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => handleChannelClick(channel)}
                  className="text-left bg-white rounded-xl border border-neutral-200 p-4 hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: channel.color }}
                    >
                      {channel.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 group-hover:text-primary transition-colors">
                        {channel.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        {categoryLabels[channel.category] || channel.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-neutral-900">
                      ${lowestPrice.toFixed(2)}
                    </span>
                    {lowestPrice !== highestPrice && (
                      <span className="text-xs text-neutral-400">
                        - ${highestPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">/mo</span>
                  </div>
                  <p className="text-xs text-primary font-semibold mt-1">
                    From {lowestRub.toLocaleString()} RUB/mo
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">
                      {channel.tiers.length} plan
                      {channel.tiers.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <VirtualCardModal
        open={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setPendingSubscribe(null);
        }}
        onComplete={onCardComplete}
      />

      <SubscriptionPlanModal
        open={planModalOpen}
        onClose={() => {
          setPlanModalOpen(false);
          setSelectedChannel(null);
        }}
        channel={selectedChannel}
        onSelectTier={handleSelectTier}
        loading={isSubscribing}
      />
    </div>
  );
}
