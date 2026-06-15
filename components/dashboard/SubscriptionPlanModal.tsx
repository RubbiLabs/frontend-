"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Check, ExternalLink, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { CatalogChannel, SubscriptionPlanTier } from "@/lib/subscriptions";

interface Props {
  open: boolean;
  onClose: () => void;
  channel: CatalogChannel | null;
  onSelectTier: (channel: CatalogChannel, tier: SubscriptionPlanTier) => void;
  loading?: boolean;
}

function formatRub(amount: number): string {
  return amount.toLocaleString("en-US");
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function SubscriptionPlanModal({
  open,
  onClose,
  channel,
  onSelectTier,
  loading,
}: Props) {
  const [selectedTier, setSelectedTier] =
    useState<SubscriptionPlanTier | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!channel) return null;

  const handleConfirm = () => {
    if (selectedTier) {
      setConfirmStep(true);
    }
  };

  const handleFinalConfirm = () => {
    if (selectedTier) {
      onSelectTier(channel, selectedTier);
    }
  };

  const handleGoBack = () => {
    setConfirmStep(false);
  };

  const handleClose = () => {
    setConfirmStep(false);
    setSelectedTier(null);
    onClose();
  };

  if (confirmStep && selectedTier) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title={`Confirm Subscription`}
        subtitle={`Subscribe to ${channel.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
              <Image
                src={channel.logo}
                alt={`${channel.name} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-neutral-900">{channel.name}</p>
              <p className="text-xs text-neutral-500">{selectedTier.name} Plan</p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Monthly Cost</span>
              <span className="text-sm font-bold text-neutral-900">{formatUsd(selectedTier.priceUsd)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">RUB Equivalent</span>
              <span className="text-sm font-bold text-primary">{formatRub(selectedTier.priceRub)} RUB/mo</span>
            </div>
          </div>

          {selectedTier && (
            <div className="p-3 bg-tertiary/5 rounded-xl flex items-start gap-2">
              <AlertCircle
                size={14}
                className="text-tertiary shrink-0 mt-0.5"
              />
              <p className="text-xs text-neutral-500 leading-relaxed">
                <span className="font-semibold text-neutral-700">
                  {formatRub(selectedTier.priceRub)} RUB
                </span>{" "}
                will be deducted from your virtual card balance. Ensure you have
                sufficient RUB tokens deposited into your ModalContract balance.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="ghost"
              onClick={handleGoBack}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
              onClick={handleFinalConfirm}
              className="flex-1"
            >
              {loading ? "Processing..." : "Confirm Subscription"}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Subscribe to ${channel.name}`}
      subtitle="Choose a plan that works for you"
      size="md"
    >
      <div className="space-y-3">
        {/* Channel Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
            <Image
              src={channel.logo}
              alt={`${channel.name} logo`}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-neutral-900">{channel.name}</p>
            <p className="text-xs text-neutral-500">{channel.tiers.length} plan{channel.tiers.length > 1 ? "s" : ""} available</p>
          </div>
        </div>
        {channel.tiers.map((tier) => {
          const isSelected = selectedTier?.id === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">
                      {tier.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {tier.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tier.features.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-lg font-extrabold text-neutral-900">
                    {formatUsd(tier.priceUsd)}
                  </div>
                  <div className="text-xs text-primary font-semibold">
                    {formatRub(tier.priceRub)} RUB/mo
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {selectedTier && (
          <div className="p-3 bg-tertiary/5 rounded-xl flex items-start gap-2">
            <AlertCircle
              size={14}
              className="text-tertiary shrink-0 mt-0.5"
            />
            <p className="text-xs text-neutral-500 leading-relaxed">
              <span className="font-semibold text-neutral-700">
                {formatRub(selectedTier.priceRub)} RUB
              </span>{" "}
              will be deducted from your virtual card balance. Ensure you have
              sufficient RUB tokens deposited into your ModalContract balance.
            </p>
          </div>
        )}

        <Button
          size="lg"
          fullWidth
          loading={loading}
          disabled={!selectedTier || loading}
          onClick={handleConfirm}
        >
          {loading
            ? "Processing..."
            : selectedTier
              ? `Subscribe — ${formatUsd(selectedTier.priceUsd)}/mo`
              : "Select a plan"}
        </Button>
      </div>
    </Modal>
  );
}
