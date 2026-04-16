"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CreditCard, Shield, Wallet, Zap } from "lucide-react";
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
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-tertiary/6 blur-3xl -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-secondary/4 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-24 left-[8%] w-24 h-24 rounded-full border border-primary/10 animate-driftSideways" />
        <div className="absolute bottom-24 right-[12%] w-40 h-40 rounded-full border border-tertiary/10 animate-floatReverse" />
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

        {/* ── Right animated scene ── */}
        <div className="relative hidden lg:block">
          <div className="relative w-full max-w-[560px] ml-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-tertiary/10 blur-3xl scale-95" />

            <div className="relative bg-white/80 border border-white rounded-[32px] shadow-[0_28px_90px_rgba(34,87,122,0.12)] backdrop-blur-md p-6 animate-slideUp">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-400">Rubbi Motion Layer</p>
                  <h3 className="text-xl font-extrabold text-neutral-900 mt-2">Streaming activity in motion</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap size={22} className="text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-[1.15fr_0.85fr] gap-4 items-start">
                <div className="bg-primary rounded-[28px] p-6 text-white card-shine aspect-[1.586/1] animate-floatSlow shadow-[0_22px_60px_rgba(34,87,122,0.24)]">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/55">Virtual Card</p>
                    <CreditCard size={18} className="text-white/70" />
                  </div>
                  <div className="w-11 h-7 rounded-lg bg-[#EBCB7B] mb-7" />
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

                <div className="space-y-4 pt-4">
                  <div className="bg-neutral-950 text-white rounded-3xl p-5 animate-floatReverse shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">Automations</p>
                      <Shield size={16} className="text-white/55" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
                        <span className="text-sm font-semibold">Netflix</span>
                        <span className="text-xs text-green-300">LIVE</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
                        <span className="text-sm font-semibold">Salary Flow</span>
                        <span className="text-xs text-white/65">0.25 MON/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 animate-driftSideways">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-3">Live Signal</p>
                    <div className="flex items-end gap-2 h-20">
                      {[48, 72, 36, 90, 60, 82, 52].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-full bg-gradient-to-t from-primary to-tertiary/80"
                          style={{ height }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-10 top-28 rounded-2xl bg-white border border-neutral-200 px-4 py-3 shadow-lg animate-floatReverse">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-1">Subscription</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold">N</div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Netflix Premium</p>
                  <p className="text-xs text-neutral-500">15.99 RUB / month</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-12 rounded-2xl bg-primary text-white px-4 py-3 shadow-lg animate-floatSlow">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/12 flex items-center justify-center">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">Salary Stream</p>
                  <p className="text-sm font-semibold">+245 RUB settling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
