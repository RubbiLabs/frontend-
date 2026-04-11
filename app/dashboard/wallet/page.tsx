"use client";
import React, { useState } from "react";
import { Droplets, ArrowUpRight, ArrowDownRight, Plus, Minus, RefreshCw, CheckCircle, Clock } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";

const mockActivity = [
  { id: "1", label: "Faucet Claim", sub: "TODAY, 08:45 AM", amount: "+100.00", positive: true, icon: "faucet" },
  { id: "2", label: "Contract Deposit", sub: "YESTERDAY", amount: "-500.00", positive: false, icon: "deposit" },
  { id: "3", label: "Salary Stream", sub: "2 DAYS AGO", amount: "+1,245.00", positive: true, icon: "stream" },
  { id: "4", label: "Subscription Fee", sub: "3 DAYS AGO", amount: "-15.99", positive: false, icon: "subscription" },
];

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === "faucet") return (
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
      <Droplets size={16} className="text-primary" />
    </div>
  );
  if (type === "deposit") return (
    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
      <ArrowDownRight size={16} className="text-neutral-500" />
    </div>
  );
  if (type === "stream") return (
    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
      <ArrowUpRight size={16} className="text-green-600" />
    </div>
  );
  return (
    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
      <RefreshCw size={16} className="text-amber-600" />
    </div>
  );
};

export default function WalletPage() {
  const { rubBalance, setRubBalance, address } = useWallet();
  const { success, error, info } = useToast();
  const [claimsRemaining, setClaimsRemaining] = useState(2);
  const [claimLoading, setClaimLoading] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [activity, setActivity] = useState(mockActivity);

  const balance = Number(rubBalance || 12450);
  const usdValue = (balance * 0.02).toFixed(2); // RUB at $0.02

  const handleClaim = async () => {
    if (claimsRemaining <= 0) { error("No Claims Remaining", "You have used all 3 daily faucet claims."); return; }
    setClaimLoading(true);
    info("Claiming Faucet...", "Broadcasting transaction to Monad testnet.");
    await new Promise(r => setTimeout(r, 1800));
    const newBal = balance + 100;
    setRubBalance(String(newBal));
    setClaimsRemaining(p => p - 1);
    setActivity(prev => [{ id: Date.now().toString(), label: "Faucet Claim", sub: "JUST NOW", amount: "+100.00", positive: true, icon: "faucet" }, ...prev]);
    success("100 RUB Claimed!", `${claimsRemaining - 1} claim${claimsRemaining - 1 !== 1 ? "s" : ""} remaining today.`);
    setClaimLoading(false);
  };

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) { error("Invalid Amount", "Enter a valid deposit amount."); return; }
    setDepositLoading(true);
    info("Depositing...", "Submitting to ModalContract.");
    await new Promise(r => setTimeout(r, 1600));
    const newBal = balance + Number(depositAmount);
    setRubBalance(String(newBal));
    setActivity(prev => [{ id: Date.now().toString(), label: "Deposit", sub: "JUST NOW", amount: `+${Number(depositAmount).toFixed(2)}`, positive: true, icon: "deposit" }, ...prev]);
    success("Deposit Successful!", `${depositAmount} RUB added to your balance.`);
    setDepositAmount("");
    setDepositModal(false);
    setDepositLoading(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Wallet</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your ecosystem liquidity and claim faucet rewards.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-7 border border-neutral-100">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/8 px-3 py-1.5 rounded-full mb-5">
              Liquidity Overview
            </div>
            <p className="text-5xl font-extrabold text-neutral-900">
              {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-2xl font-bold text-neutral-400 ml-2">RUB</span>
            </p>
            <p className="text-neutral-400 mt-2">≈ ${usdValue} USD</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button size="md" icon={<Plus size={15} />} onClick={() => setDepositModal(true)}>Deposit</Button>
              <Button size="md" variant="outlined" icon={<Minus size={15} />}>Withdraw</Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 mt-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-5">Recent Ledger Activity</h3>
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <ActivityIcon type={item.icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{item.label}</p>
                    <p className="text-xs text-neutral-400 font-medium tracking-wider">{item.sub}</p>
                  </div>
                  <p className={`text-sm font-extrabold ${item.positive ? "text-green-600" : "text-red-500"}`}>
                    {item.amount}
                    <span className="text-xs font-bold text-neutral-400 ml-1">RUB</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Faucet */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Rubbi Faucet</h3>
              </div>
              <Droplets size={24} className="text-primary/30" />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              Claim your daily allocation of RUB tokens to test network protocols and liquidity features.
            </p>

            <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Claims Remaining</span>
              <span className="font-extrabold text-primary text-sm">{claimsRemaining} / 3</span>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i < (3 - claimsRemaining) ? "bg-primary" : "bg-neutral-200"}`} />
              ))}
            </div>

            <Button
              size="md"
              fullWidth
              loading={claimLoading}
              disabled={claimsRemaining <= 0}
              icon={<Droplets size={15} />}
              onClick={handleClaim}
            >
              Claim RUB
            </Button>
            <p className="text-center text-xs text-neutral-400 mt-3">Daily limit: 3 claims per wallet</p>
          </div>

          {/* Protocol status */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Protocol Status</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The faucet distribution is governed by the RubbiToken smart contract. Limits reset every 24 hours UTC.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs font-semibold text-neutral-600">All systems operational</span>
            </div>
          </div>

          {/* Wallet address */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Connected Wallet</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">👤</span>
              </div>
              <p className="font-mono text-xs text-neutral-600 break-all">
                {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "Not connected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDepositModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-neutral-900 mb-5">Deposit RUB</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 pr-14 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">RUB</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400">Tokens will be deposited to the ModalContract and tracked in your internal balance.</p>
              <div className="flex gap-3">
                <Button variant="ghost" size="md" fullWidth onClick={() => setDepositModal(false)}>Cancel</Button>
                <Button size="md" fullWidth loading={depositLoading} onClick={handleDeposit}>Deposit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
