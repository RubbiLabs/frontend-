"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Step1Username from "../../components/onboarding/Step1Username";
import Step2PIN from "../../components/onboarding/Step2PIN";
import Step3VirtualCard from "../../components/onboarding/Step3VirtualCard";
import { useWallet } from "../../context/WalletContext";

type Step = 1 | 2 | 3;

const steps = [
  { num: 1, label: "Choose your username", sub: "Active Task" },
  { num: 2, label: "Set wallet PIN", sub: "Security layer" },
  { num: 3, label: "Create virtual card", sub: "Instant spendability" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isConnected, setOnboardingComplete } = useWallet();
  const [step, setStep] = useState<Step>(1);

  useEffect(() => {
    if (!isConnected) router.replace("/");
  }, [isConnected, router]);

  if (!isConnected) return null;

  const finish = () => {
    setOnboardingComplete(true);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-manrope relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-primary/3 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-tertiary/5 blur-3xl" />
      </div>

      {/* Topbar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M12 8H26C31.523 8 36 12.477 36 18C36 22.072 33.572 25.572 30.08 27.2L36 40H28L22.8 28H20V40H12V8Z" fill="#F7F7F2"/>
              <path d="M20 14V22H26C28.209 22 30 20.209 30 18C30 15.791 28.209 14 26 14H20Z" fill="#22577A"/>
            </svg>
          </div>
          <span className="font-bold text-primary text-lg">Rubbi</span>
        </div>
        <span className="text-xs font-semibold text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full tracking-wider">
          STEP 0{step} OF 03
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-16 items-start">
        {/* ── Left panel ── */}
        <div className="lg:pt-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-4">
            Complete Your<br />On-Chain Identity
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-10">
            Establish your presence on the Monad network. Your identity is your
            secure gateway to automated salary streams and decentralised finance.
          </p>

          {/* Step tracker */}
          <div className="space-y-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  step === s.num
                    ? "bg-white shadow-card border border-primary/10"
                    : "opacity-40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    step > s.num
                      ? "bg-green-500 text-white"
                      : step === s.num
                      ? "bg-primary text-white"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${step === s.num ? "text-neutral-900" : "text-neutral-500"}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-neutral-400">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div>
          {step === 1 && (
            <Step1Username
              onComplete={() => setStep(2)}
              onSkip={() => router.push("/dashboard")}
            />
          )}
          {step === 2 && (
            <Step2PIN onComplete={() => setStep(3)} />
          )}
          {step === 3 && (
            <Step3VirtualCard
              onComplete={finish}
              onSkip={() => router.push("/dashboard")}
            />
          )}
        </div>
      </div>

      {/* Footer links */}
      <div className="relative z-10 pb-8 flex justify-center gap-6 text-xs text-neutral-400">
        <span className="cursor-default">Privacy Protocol</span>
        <span className="cursor-default">Service Ledger</span>
        <span className="cursor-default">System Status</span>
      </div>
    </div>
  );
}
