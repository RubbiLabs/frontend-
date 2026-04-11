"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Wallet, Shield, Zap } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  const router = useRouter();
  const { isConnected, connect, isConnecting } = useWallet();
  const { success, error } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      success("Wallet Connected!", "Redirecting to onboarding...");
      router.push("/onboarding");
    } catch {
      error("Connection Failed", "Please try again or install MetaMask.");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-tertiary/6 blur-3xl -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-secondary/4 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* ── Left copy ── */}
        <div>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 animate-fadeIn tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            The Architectural Archive
          </div>

          {/* Headline */}
          <h1
            className="text-5xl lg:text-6xl xl:text-[68px] font-extrabold text-neutral-900 leading-[1.04] tracking-tight mb-6 animate-slideUp"
          >
            Decentralized
            <br />
            Financial
            <br />
            <span className="text-primary">Automation.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base lg:text-lg text-neutral-500 leading-relaxed max-w-md mb-10">
            A heavy-duty ledger protocol for the Monad Network. Secure
            your streams, automate your life, and archive your wealth with
            permanent precision.
          </p>

          {/* CTA */}
          <Button
            size="lg"
            icon={<Wallet size={18} />}
            loading={isConnecting}
            onClick={handleConnect}
          >
            {isConnected ? "Go to Dashboard" : "Connect Wallet"}
          </Button>
        </div>

        {/* ── Right feature cards ── */}
        <div className="relative hidden lg:block">
          {/* Primary card */}
          <div
            className="bg-primary rounded-2xl p-8 text-white shadow-2xl animate-slideUp"
            style={{ animationDelay: "250ms" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
              Immutable Logic
            </p>
            <p className="text-sm font-medium text-white/80 mb-5 leading-relaxed">
              Smart contracts audited for absolute resilience. Every
              transaction recorded with architectural precision.
            </p>
            <Shield size={32} className="text-white/20" />
          </div>

          {/* Secondary floating card */}
          <div
            className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-6 shadow-xl border border-neutral-100 animate-slideUp"
            style={{ animationDelay: "400ms" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
              AI Guided
            </p>
            <p className="text-sm font-medium text-neutral-600 mb-3 leading-relaxed">
              Intelligent automation that learns your flow.
            </p>
            <Zap size={22} className="text-tertiary" />
          </div>
        </div>
      </div>
    </section>
  );
}
