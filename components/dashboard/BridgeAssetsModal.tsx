"use client";
import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowLeftRight, ChevronDown, Check, X, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { BridgeToken, BridgeNetwork, TOKEN_USD_PRICES, RUB_PER_USD } from "@/types";

const TOKENS: BridgeToken[] = ["USDC", "USDT", "DAI", "MON", "ETH"];
const NETWORKS: BridgeNetwork[] = ["ERC20", "BSC (BEP20)", "TRON20"];

interface Props { open: boolean; onClose: () => void; }

export default function BridgeAssetsModal({ open, onClose }: Props) {
  const { success, error, info } = useToast();
  const [token, setToken] = useState<BridgeToken>("USDC");
  const [network, setNetwork] = useState<BridgeNetwork>("ERC20");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);

  const usdValue = Number(amount || 0) * TOKEN_USD_PRICES[token];
  const rubReceive = usdValue * RUB_PER_USD;

  const tokenColors: Record<BridgeToken, string> = {
    USDC: "bg-blue-500", USDT: "bg-green-500", DAI: "bg-yellow-500", MON: "bg-purple-500", ETH: "bg-indigo-500",
  };

  const networkColors: Record<BridgeNetwork, string> = {
    "ERC20": "text-blue-600", "BSC (BEP20)": "text-yellow-600", "TRON20": "text-red-600",
  };

  const handleBridge = async () => {
    if (!amount || Number(amount) <= 0) { error("Invalid Amount", "Please enter a valid amount to bridge."); return; }
    setLoading(true);
    info("Bridging Assets...", `Converting ${amount} ${token} to RUB`);
    await new Promise(r => setTimeout(r, 2200));
    success("Bridge Successful!", `${rubReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })} RUB has been credited to your wallet.`);
    setAmount("");
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Bridge Assets" subtitle="Convert tokens to RUB at $1 = 50 RUB" size="sm">
      <div className="space-y-4">
        {/* Token selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">From Token</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setTokenOpen(p => !p); setNetworkOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-3 bg-neutral-50 border-2 rounded-xl text-sm font-semibold transition-all ${tokenOpen ? "border-primary" : "border-neutral-200 hover:border-primary/40"}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full ${tokenColors[token]} flex items-center justify-center text-white text-xs font-bold`}>{token.charAt(0)}</span>
                <span>{token}</span>
              </div>
              <ChevronDown size={16} className={`text-neutral-400 transition-transform ${tokenOpen ? "rotate-180" : ""}`} />
            </button>
            {tokenOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown">
                {TOKENS.map((t) => (
                  <button key={t} type="button" onClick={() => { setToken(t); setTokenOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-sm"
                  >
                    <span className={`w-6 h-6 rounded-full ${tokenColors[t]} flex items-center justify-center text-white text-xs font-bold`}>{t.charAt(0)}</span>
                    <span className={token === t ? "text-primary font-semibold" : "text-neutral-700"}>{t}</span>
                    {token === t && <Check size={14} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Network selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Network</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setNetworkOpen(p => !p); setTokenOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-3 bg-neutral-50 border-2 rounded-xl text-sm font-semibold transition-all ${networkOpen ? "border-primary" : "border-neutral-200 hover:border-primary/40"}`}
            >
              <span className={`font-semibold ${networkColors[network]}`}>{network}</span>
              <ChevronDown size={16} className={`text-neutral-400 transition-transform ${networkOpen ? "rotate-180" : ""}`} />
            </button>
            {networkOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown">
                {NETWORKS.map((n) => (
                  <button key={n} type="button" onClick={() => { setNetwork(n); setNetworkOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-sm"
                  >
                    <span className={network === n ? "text-primary font-semibold" : "text-neutral-700"}>{n}</span>
                    {network === n && <Check size={14} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Amount</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 pr-16 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">{token}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center">
            <ArrowDown size={16} className="text-primary" />
          </div>
        </div>

        {/* Receive output */}
        <div className="bg-primary/5 border-2 border-primary/10 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">You Receive</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-primary">
              {rubReceive > 0 ? rubReceive.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
            </span>
            <span className="text-sm font-bold text-primary">RUB</span>
          </div>
          {amount && Number(amount) > 0 && (
            <p className="text-xs text-neutral-400 mt-1">≈ ${usdValue.toFixed(2)} USD · Rate: $1 = 50 RUB</p>
          )}
        </div>

        {/* Rate info */}
        <div className="flex items-start gap-2 p-3 bg-tertiary/5 rounded-xl">
          <Info size={14} className="text-tertiary shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-500 leading-relaxed">
            Bridge fee: <strong>0%</strong> during beta. Tokens are converted at the fixed rate of <strong>$1 = 50 RUB</strong>. Settlement time: ~30 seconds on Monad Testnet.
          </p>
        </div>

        <Button size="lg" fullWidth loading={loading} icon={<ArrowLeftRight size={16} />} onClick={handleBridge}>
          Bridge to RUB
        </Button>
      </div>
    </Modal>
  );
}
