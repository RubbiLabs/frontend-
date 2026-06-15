"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CreditCard, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { subscriptionChannels } from "@/lib/subscriptions";

const cardStatusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  inactive: "bg-neutral-100 text-neutral-600",
  canceled: "bg-red-100 text-red-700",
};

const pageSize = 4;

export default function CardPage() {
  const { hasVirtualCard, virtualCardData, setVirtualCardActive } = useWallet();
  const { info, success } = useToast();
  const [page, setPage] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  const toggleCardStatus = () => {
    if (!virtualCardData) return;

    const nextState = !virtualCardData.isActive;
    setVirtualCardActive(nextState);

    if (nextState) {
      success("Card Reactivated", "Your virtual card can now be used for subscriptions again.");
    } else {
      info("Card Deactivated", "Your virtual card is locked until you reactivate it.");
    }
  };

  const cardSubscriptions = useMemo(() => {
    if (!virtualCardData) return [];
    return subscriptionChannels.map((channel, idx) => ({
      id: idx,
      name: channel.name,
      fee: channel.tiers[0]?.priceUsd || 0,
      status: "inactive" as const,
      logo: channel.logo,
      plan: channel.tiers[0]?.name || "Basic",
      nextPayment: "N/A",
      streamId: `--`,
      cardLastFour: virtualCardData.lastFour,
    }));
  }, [virtualCardData]);

  const totalPages = Math.max(1, Math.ceil(cardSubscriptions.length / pageSize));
  const visibleSubscriptions = cardSubscriptions.slice((page - 1) * pageSize, page * pageSize);

  if (!hasVirtualCard || !virtualCardData) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Card</h1>
          <p className="text-sm text-neutral-500 mt-1">Your Rubbi virtual card will appear here after you generate it from a subscription checkout.</p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 p-8 lg:p-10 max-w-3xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <CreditCard size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900">No virtual card yet</h2>
          <p className="text-neutral-500 mt-3 max-w-xl leading-relaxed">
            You’ll only be asked to generate your card when you click a subscription button for the first time. Once created, the full front and back of the card will live here.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-dashed border-neutral-200 bg-neutral-50 aspect-[1.586/1] p-6" />
            <div className="rounded-[28px] border border-dashed border-neutral-200 bg-neutral-50 aspect-[1.586/1] p-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Card</h1>
          <p className="text-sm text-neutral-500 mt-1">View the front and back of your virtual card and control whether it can be used for subscriptions.</p>
        </div>

        <Button
          size="md"
          variant={virtualCardData.isActive ? "danger" : "primary"}
          icon={virtualCardData.isActive ? <ShieldAlert size={15} /> : <RefreshCw size={15} />}
          onClick={toggleCardStatus}
        >
          {virtualCardData.isActive ? "Deactivate Card" : "Reactivate Card"}
        </Button>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <div className="flex flex-col 2xl:flex-row gap-6">
          <div className="bg-primary rounded-[15px] p-6 lg:p-7 card-shine aspect-[1.586/1] max-w-[430px] w-full shadow-[0_24px_70px_rgba(34,87,122,0.18)]">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/55">Rubbi Virtual Card</p>
                {/* <p className="text-xs text-white/55 mt-2">{virtualCardData.network}</p> */}
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.28em] ${virtualCardData.isActive ? "bg-white/14 text-white" : "bg-red-500/20 text-red-100 border border-red-200/20"}`}>
                {virtualCardData.isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="w-10 h-10 rounded-lg bg-[#EBCB7B] mb-8 shadow-inner shadow-white/20" />

            <p className="font-mono text-[clamp(1rem,2vw,1.35rem)] tracking-[0.26em] text-white mb-8">
              {virtualCardData.cardNumber}
            </p>

            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[10px] text-white/45 uppercase tracking-[0.28em] mb-1">Card Holder</p>
                <p className="text-sm lg:text-base font-bold text-white">{virtualCardData.cardHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/45 uppercase tracking-[0.28em] mb-1">Expires</p>
                <p className="text-sm lg:text-base font-bold text-white">{virtualCardData.expiry}</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-[15px] p-6 lg:p-7 aspect-[1.586/1] max-w-[430px] w-full shadow-[0_24px_70px_rgba(26,26,23,0.14)]">
            <div className="h-12 bg-neutral-950/80 rounded-md -mx-6 lg:-mx-7 mt-4 mb-7" />
            <div className="bg-white rounded-xl px-4 py-4 max-w-[220px] ml-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-2">CVV</p>
              <p className="font-mono text-2xl tracking-[0.3em] text-neutral-900">{virtualCardData.cvv}</p>
            </div>
            <p className="text-xs text-white/55 mt-6 leading-relaxed max-w-xs">
              Use the back-of-card security code only on trusted subscription platforms. Deactivate the card anytime from this page.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${virtualCardData.isActive ? "bg-green-100" : "bg-amber-100"}`}>
              {virtualCardData.isActive ? <ShieldCheck size={20} className="text-green-600" /> : <ShieldAlert size={20} className="text-amber-600" />}
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">{virtualCardData.isActive ? "Card is active" : "Card is inactive"}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {virtualCardData.isActive ? "Subscriptions can charge this card normally." : "Subscription payments are paused until reactivation."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-neutral-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-1">Card Number</p>
              <p className="font-mono text-sm text-neutral-800">{virtualCardData.cardNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-1">Expiry</p>
                <p className="font-semibold text-neutral-800">{virtualCardData.expiry}</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-1">CVV</p>
                <p className="font-semibold text-neutral-800">{virtualCardData.cvv}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-md">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-neutral-900">Card Subscriptions</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Active, inactive, and canceled subscriptions connected to this virtual card.
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Card ending {virtualCardData.lastFour}
          </span>
        </div>

        {visibleSubscriptions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    {["Subscription", "Plan", "Status", "Next Payment", "Monthly Fee", "Stream ID"].map((heading) => (
                      <th key={heading} className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-primary-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {visibleSubscriptions.map((subscription) => (
                    <tr 
                      key={subscription.id} 
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedSubscription(subscription)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                            <Image src={subscription.logo} alt={`${subscription.name} logo`} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-900">{subscription.name}</p>
                            <p className="text-xs text-neutral-400">Card •••• {subscription.cardLastFour}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-700">{subscription.plan}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cardStatusBadge[subscription.status]}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{subscription.nextPayment}</td>
                      <td className="px-6 py-4 text-sm font-bold text-neutral-900">{subscription.fee.toFixed(2)} RUB</td>
                      <td className="px-6 py-4 text-xs font-mono text-neutral-500">{subscription.streamId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-neutral-400">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, cardSubscriptions.length)} of {cardSubscriptions.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outlined"
                  icon={<ChevronLeft size={14} />}
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-bold text-neutral-500 px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outlined"
                  icon={<ChevronRight size={14} />}
                  iconPosition="right"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard size={24} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-900">No connected subscriptions</h3>
            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">
              You do not have any current subscription connected to this virtual card.
            </p>
          </div>
        )}
      </div>

      {/* Subscription Detail Modal */}
      <Modal
        open={!!selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
        title="Subscription Details"
        subtitle={selectedSubscription?.name}
        size="md"
      >
        {selectedSubscription && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                <Image src={selectedSubscription.logo} alt={`${selectedSubscription.name} logo`} fill className="object-cover" sizes="56px" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">{selectedSubscription.name}</h3>
                <p className="text-sm text-neutral-500">{selectedSubscription.plan}</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Monthly Fee</span>
                <span className="text-sm font-bold text-neutral-900">{selectedSubscription.fee.toFixed(2)} RUB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Status</span>
                <span className={`text-sm font-bold ${selectedSubscription.status === "active" ? "text-green-600" : selectedSubscription.status === "paused" ? "text-amber-600" : "text-neutral-600"}`}>
                  {selectedSubscription.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Next Payment</span>
                <span className="text-sm font-bold text-neutral-900">{selectedSubscription.nextPayment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Card</span>
                <span className="text-sm font-bold text-neutral-900">•••• {selectedSubscription.cardLastFour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Stream ID</span>
                <span className="text-sm font-mono text-neutral-600">{selectedSubscription.streamId}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setSelectedSubscription(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
