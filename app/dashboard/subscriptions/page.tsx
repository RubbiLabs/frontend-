"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import VirtualCardModal from "../../../components/dashboard/VirtualCardModal";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";
import { defaultSubscriptions, subscriptionCatalog, type CatalogItem, type SubscriptionPlan } from "@/lib/subscriptions";

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700 uppercase",
  inactive: "bg-neutral-100 text-neutral-600 uppercase",
  canceled: "bg-red-100 text-red-700 uppercase",
};

type CategoryFilter = "all" | "entertainment" | "cloud" | "productivity";

export default function SubscriptionsPage() {
  const { hasVirtualCard, virtualCardData } = useWallet();
  const { success, error, info } = useToast();
  const [subs, setSubs] = useState<SubscriptionPlan[]>(defaultSubscriptions);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState<CatalogItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const activeSubscriptionsRef = useRef<HTMLDivElement>(null);

  const totalMonthly = subs.filter((s) => s.status === "active").reduce((acc, s) => acc + s.fee, 0);

  const focusActiveSubscriptions = () => {
    window.setTimeout(() => {
      activeSubscriptionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const handlePauseResume = async (sub: SubscriptionPlan) => {
    if (sub.status !== "active" && sub.status !== "paused") return;
    setLoadingId(sub.id);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubs((prev) =>
      prev.map((item) =>
        item.id === sub.id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item
      )
    );
    success(sub.status === "active" ? "Subscription Paused" : "Subscription Resumed", sub.name);
    setLoadingId(null);
  };

  const handleCancel = (sub: SubscriptionPlan) => {
    setSubs((prev) =>
      prev.map((item) =>
        item.id === sub.id ? { ...item, status: "canceled", nextPayment: "Canceled" } : item
      )
    );
    info("Subscription Cancelled", `${sub.name} has been canceled.`);
  };

  const doSubscribe = (item: CatalogItem) => {
    const alreadySubscribed = subs.some((sub) => sub.name === item.name);
    if (alreadySubscribed) {
      error("Already Subscribed", `You're already subscribed to ${item.name}.`);
      return;
    }

    const newSub: SubscriptionPlan = {
      id: Date.now().toString(),
      name: item.name,
      fee: item.fee,
      nextPayment: "Next month",
      streamId: `#RB-${Math.floor(7000 + Math.random() * 1000)}-00${subs.length + 1}`,
      uptime: "0 Days",
      status: "active",
      color: item.color,
      logo: item.logo,
      plan: item.plan,
      cardLastFour: virtualCardData?.lastFour ?? "6721",
    };

    setSubs((prev) => [...prev, newSub]);
    success("Subscribed!", `You're now subscribed to ${item.name}.`);
    focusActiveSubscriptions();
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

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Subscriptions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Automating {subs.length} recurring agreement{subs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div ref={activeSubscriptionsRef}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Active Subscriptions</h2>

        {subs[0] && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                  <Image src={subs[0].logo} alt={`${subs[0].name} logo`} fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-neutral-900">{subs[0].name}</h3>
                  <p className="text-sm text-neutral-400">Next payment: {subs[0].nextPayment}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-neutral-900">{subs[0].fee.toFixed(2)}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusBadge[subs[0].status]}`}>
                    {subs[0].status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-neutral-100">
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Stream ID</p>
                  <p className="font-semibold text-neutral-700">{subs[0].streamId}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Uptime</p>
                  <p className="font-semibold text-neutral-700">{subs[0].uptime}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(subs[0].status === "active" || subs[0].status === "paused") && (
                  <Button
                    size="sm"
                    variant="outlined"
                    icon={subs[0].status === "active" ? <Pause size={14} /> : <Play size={14} />}
                    loading={loadingId === subs[0].id}
                    onClick={() => handlePauseResume(subs[0])}
                  >
                    {subs[0].status === "active" ? "Pause" : "Resume"}
                  </Button>
                )}
                <Button size="sm" variant="danger" icon={<X size={14} />} onClick={() => handleCancel(subs[0])}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subs.slice(1).map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-100">
                  <Image src={sub.logo} alt={`${sub.name} logo`} fill className="object-cover" sizes="44px" />
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
                ) : sub.status === "active" ? (
                  <Button size="sm" variant="outlined" fullWidth loading={loadingId === sub.id} onClick={() => handlePauseResume(sub)} icon={<Pause size={13} />}>
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" fullWidth disabled>
                    {sub.status === "canceled" ? "Canceled" : "Inactive"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Total Outflow (Monthly)</p>
          <p className="text-3xl font-extrabold text-white mt-1">
            {totalMonthly.toFixed(2)} <span className="text-lg font-bold text-white/60">RUB</span>
          </p>
          <p className="text-xs text-white/50 mt-1">{subs.filter((s) => s.status === "active").length} active streams</p>
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCatalog.map((item) => {
            const subscribed = subs.some((sub) => sub.name === item.name);
            return (
              <div key={item.name} className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-card transition-all">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 mb-4">
                  <Image src={item.logo} alt={`${item.name} logo`} fill className="object-cover" sizes="44px" />
                </div>
                <p className="font-bold text-neutral-800 text-sm mb-1">{item.name}</p>
                <p className="text-xs text-neutral-400 mb-4">
                  {item.fee.toFixed(2)} RUB / {item.period}
                </p>
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
