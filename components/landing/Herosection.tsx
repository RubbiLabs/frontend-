"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Shield, Wallet, Zap, ArrowUpRight, Repeat } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  const router = useRouter();
  const { isConnected, connect, isConnecting } = useWallet();
  const { success, error } = useToast();

  const handleConnect = async () => {
    try {
      if (isConnected) {
        router.push("/dashboard");
        return;
      }
      await connect();
      success("Wallet Connected!", "Redirecting to dashboard...");
      router.push("/dashboard");
    } catch {
      error("Connection Failed", "Please try again or install MetaMask.");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#8dbcd794] blur-3xl -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-secondary/4 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #22577A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="px-6 lg:px-36 py-24 w-full flex items-center justify-between gap-12">
        {/* Left copy */}
        <div className="flex-1 max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 animate-fadeIn tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Built on Arbitrum
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-extrabold text-neutral-900 leading-[1.04] tracking-tight mb-6 animate-slideUp">
            Automate Your
            <br />
            Financial <span className="text-primary">Life.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base lg:text-lg text-neutral-500 leading-relaxed max-w-xl mb-10">
            Subscribe to streaming services, stream salaries, and swap tokens — all gasless, all on-chain, all from one dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Button
              size="lg"
              icon={<Wallet size={18} />}
              loading={isConnecting}
              onClick={handleConnect}
            >
              {isConnected ? "Go to Dashboard" : "Begin Automation"}
            </Button>

          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 text-neutral-400">
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span className="text-xs font-semibold">Gasless Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} />
              <span className="text-xs font-semibold">Instant Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard size={14} />
              <span className="text-xs font-semibold">Virtual Cards</span>
            </div>
          </div>
        </div>

        {/* Right animated scene */}
        <div className="relative hidden lg:block flex-1 max-w-[520px]">
          {/* Virtual Card */}
          <div className="relative bg-primary rounded-[28px] p-6 text-white card-shine aspect-[1.586/1] animate-floatSlow shadow-[0_22px_60px_rgba(34,87,122,0.3)] max-w-[380px] ml-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/55">Rubbi Virtual Card</p>
              <CreditCard size={18} className="text-white/70" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#EBCB7B] mb-7" />
            <p className="font-mono tracking-[0.28em] text-sm mb-7">5234 1988 2400 6721</p>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] text-white/45 uppercase tracking-[0.28em] mb-1">Holder</p>
                <p className="text-sm font-bold text-white">RUBBI USER</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/45 uppercase tracking-[0.28em] mb-1">Expires</p>
                <p className="text-sm font-bold text-white">09/30</p>
              </div>
            </div>
          </div>

          {/* Floating notification - Subscription */}
          <div className="absolute -left-4 top-[220px] rounded-2xl bg-white border border-neutral-200 px-4 py-3 shadow-xl animate-floatReverse z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center overflow-hidden">
                <img src="/subscriptions/netflix.svg" alt="Netflix" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">Netflix Premium</p>
                <p className="text-xs text-green-600 font-semibold">Active Subscription</p>
              </div>
            </div>
          </div>

          {/* Floating notification - Swap */}
          <div className="absolute right-0 bottom-[60px] rounded-2xl bg-neutral-950 text-white px-4 py-3 shadow-xl animate-floatSlow z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Repeat size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">Swap Complete</p>
                <p className="text-sm font-semibold">1.5 ETH → 2,400 RUB</p>
              </div>
            </div>
          </div>

          {/* Floating notification - Salary */}
          <div className="absolute left-8 bottom-[-10px] rounded-2xl bg-primary text-white px-4 py-3 shadow-xl animate-driftSideways z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/12 flex items-center justify-center">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">Salary Stream</p>
                <p className="text-sm font-semibold">+245 RUB settled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
