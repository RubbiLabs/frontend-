"use client";
import React, { useState } from "react";
import {
  ArrowDown,
  ArrowLeftRight,
  ChevronDown,
  Check,
  Settings,
  Info,
  ExternalLink,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useSwap } from "@/hooks/useSwap";
import type { SwapToken } from "@/types";

const TOKENS: SwapToken[] = ["ETH", "ARB"];

const tokenMeta: Record<
  SwapToken,
  { color: string; label: string; logo: string }
> = {
  ETH: {
    color: "bg-indigo-500",
    label: "Ethereum",
    logo: "⟠",
  },
  ARB: {
    color: "bg-sky-500",
    label: "Arbitrum",
    logo: "A",
  },
};

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatTokenAmount(value: bigint, decimals = 18): string {
  if (value === 0n) return "0";
  const str = value.toString();
  if (str.length <= decimals) {
    return `0.${str.padStart(decimals, "0")}`;
  }
  const intPart = str.slice(0, str.length - decimals);
  const fracPart = str.slice(str.length - decimals);
  // Trim trailing zeros
  const trimmed = fracPart.replace(/0+$/, "");
  return trimmed ? `${intPart}.${trimmed}` : intPart;
}

function formatUSD(value: bigint, price: number, decimals = 18): string {
  const num = Number(value) / 10 ** decimals;
  return (num * price).toFixed(2);
}

export default function BridgeAssetsModal({ open, onClose }: Props) {
  const {
    inputToken,
    setInputToken,
    inputAmount,
    setInputAmount,
    slippage,
    setSlippage,
    estimatedOutput,
    inputBalance,
    needsApproval,
    approve,
    isApproving,
    swap,
    isSwapping,
    isLoading,
    isQuoting,
    swapTxHash,
  } = useSwap();

  const [tokenOpen, setTokenOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const meta = tokenMeta[inputToken];
  const hasInput = inputAmount && Number(inputAmount) > 0;
  const hasOutput = estimatedOutput > 0n;

  const inputBalanceFormatted = formatTokenAmount(inputBalance);
  const outputFormatted = hasOutput ? formatTokenAmount(estimatedOutput) : "—";

  const handleMaxClick = () => {
    // Leave a small buffer for gas if ETH
    if (inputToken === "ETH") {
      const max = inputBalance > parseEther("0.001") ? inputBalance - parseEther("0.001") : 0n;
      setInputAmount(formatTokenAmount(max));
    } else {
      setInputAmount(formatTokenAmount(inputBalance));
    }
  };

  const handleSwap = async () => {
    if (needsApproval) {
      await approve();
    } else {
      await swap();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Swap to RUB"
      subtitle="Convert tokens to RUB via Uniswap V2"
      size="sm"
    >
      <div className="space-y-4">
        {/* From token + amount */}
        <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4 focus-within:border-primary transition-all">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              You Pay
            </label>
            <button
              type="button"
              onClick={handleMaxClick}
              className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Max
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTokenOpen(!tokenOpen);
                  setShowSettings(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-semibold hover:border-primary/40 transition-all"
              >
                <span
                  className={`w-6 h-6 rounded-full ${meta.color} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {meta.logo}
                </span>
                <span>{inputToken}</span>
                <ChevronDown
                  size={14}
                  className={`text-neutral-400 transition-transform ${tokenOpen ? "rotate-180" : ""}`}
                />
              </button>
              {tokenOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown min-w-[140px]">
                  {TOKENS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setInputToken(t);
                        setTokenOpen(false);
                        setInputAmount("");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-sm"
                    >
                      <span
                        className={`w-6 h-6 rounded-full ${tokenMeta[t].color} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {tokenMeta[t].logo}
                      </span>
                      <span
                        className={
                          inputToken === t
                            ? "text-primary font-semibold"
                            : "text-neutral-700"
                        }
                      >
                        {tokenMeta[t].label}
                      </span>
                      {inputToken === t && (
                        <Check size={14} className="ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="flex-1 text-right text-2xl font-extrabold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-neutral-400">
              Balance: {inputBalanceFormatted} {inputToken}
            </p>
            {hasInput && (
              <p className="text-[11px] text-neutral-400">
                ≈${formatUSD(parseEther(inputAmount || "0"), inputToken === "ETH" ? 3200 : 1)}
              </p>
            )}
          </div>
        </div>

        {/* Swap direction arrow */}
        <div className="flex items-center justify-center -my-1 relative z-10">
          <div
            className="w-9 h-9 bg-neutral-100 border-2 border-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-all"
            onClick={() => {
              setInputAmount("");
            }}
          >
            <ArrowDown size={16} className="text-primary" />
          </div>
        </div>

        {/* Output - RUB */}
        <div className="bg-primary/5 border-2 border-primary/10 rounded-xl p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 block">
            You Receive
          </label>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-extrabold">R</span>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-primary">
                {isQuoting ? (
                  <span className="text-neutral-300">Calculating...</span>
                ) : hasOutput ? (
                  outputFormatted
                ) : (
                  "—"
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">RUB Token</p>
            </div>
          </div>
          {hasOutput && (
            <p className="text-[11px] text-neutral-400 mt-2">
              ≈${formatUSD(estimatedOutput, 50 / 3200)} USD · Rate varies by pool
            </p>
          )}
        </div>

        {/* Slippage settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <Settings size={12} />
            <span>
              Slippage: {slippage}%
            </span>
          </button>
          {showSettings && (
            <div className="mt-2 flex items-center gap-2">
              {[0.1, 0.5, 1.0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlippage(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    slippage === s
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {s}%
                </button>
              ))}
              <input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                className="w-16 px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-center focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-neutral-400">%</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-tertiary/5 rounded-xl">
          <Info size={14} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-500 leading-relaxed">
            Powered by Uniswap V2 on Arbitrum Sepolia. Swap {inputToken === "ETH" ? "ETH (wrapped as WETH)" : "ARB"} for RUB tokens. 
            A liquidity pair (WETH/RUB or ARB/RUB) must exist on the deployed Uniswap V2 factory.
          </p>
        </div>

        {/* Swap / Approve button */}
        <Button
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={!hasInput || !hasOutput || isLoading}
          icon={<ArrowLeftRight size={16} />}
          onClick={handleSwap}
        >
          {needsApproval
            ? `Approve ${inputToken}`
            : isQuoting
              ? "Fetching Quote..."
              : isSwapping
                ? "Swapping..."
                : `Swap ${inputToken} for RUB`}
        </Button>

        {/* View on explorer */}
        {isSwapping && swapTxHash && (
          <a
            href={`https://sepolia.arbiscan.io/tx/${swapTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
          >
            View on Arbiscan <ExternalLink size={10} />
          </a>
        )}
      </div>
    </Modal>
  );
}

function parseEther(value: string): bigint {
  if (!value || Number(value) <= 0) return 0n;
  const parts = value.split(".");
  const intPart = parts[0] || "0";
  const fracPart = (parts[1] || "").padEnd(18, "0").slice(0, 18);
  return BigInt(intPart) * BigInt(10 ** 18) + BigInt(fracPart);
}
