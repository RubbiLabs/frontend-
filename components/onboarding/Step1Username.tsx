"use client";
import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import Button from "@/components/ui/Button";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { useContractWrite } from "@/hooks/useContractWrite";
import AuthABI from "@/Abis/Authentication.json";
import { CONTRACTS } from "@/lib/contracts/config";

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

function hexEncodeString(str: string): `0x${string}` {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  ) as `0x${string}`;
}

export default function Step1Username({ onComplete, onSkip }: Props) {
  const { setUsername } = useWallet();
  const { success, error } = useToast();
  const { address } = useAccount();
  const { execute, isWriting } = useContractWrite();

  const [value, setValue] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value.trim() || value.length < 3) {
      setAvailable(null);
      return;
    }
    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const publicClient = createPublicClient({
          transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
          chain: arbitrumSepolia,
        });
        const nameBytes = hexEncodeString(value);
        const result = await publicClient.readContract({
          address: CONTRACTS.authentication,
          abi: AuthABI.abi as any,
          functionName: "usernameExist",
          args: [nameBytes],
        });
        setAvailable(!result);
      } catch (err) {
        console.error("Username check failed:", err);
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [value]);

  const handleContinue = useCallback(async () => {
    if (!available || !address) return;
    setLoading(true);

    const nameBytes = hexEncodeString(value);

    const txHash = await execute({
      abi: AuthABI.abi as any,
      address: CONTRACTS.authentication,
      functionName: "createAccount",
      args: [nameBytes],
      onSuccess: () => {
        setUsername(value);
        success("Username Created!", `@${value} is now your on-chain identity.`);
        onComplete();
      },
    });

    if (!txHash) {
      error("Transaction Failed", "Could not create account on-chain.");
    }
    setLoading(false);
  }, [available, address, value, execute, setUsername, success, error, onComplete]);

  const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9_]/g, "");

  const borderColor =
    available === true
      ? "border-green-400 focus:border-green-500"
      : available === false
      ? "border-red-400 focus:border-red-500"
      : "border-neutral-200 focus:border-primary";

  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8 animate-scaleIn">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
        Authentication &middot; Create Account
      </p>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Choose Your Username</h2>

      <div className="relative mb-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold select-none">
          @
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(sanitize(e.target.value))}
          placeholder="yourname"
          className={`w-full pl-8 pr-10 py-3.5 border-2 rounded-xl text-sm outline-none transition-all ${borderColor}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {checking && (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}
          {!checking && available === true && (
            <CheckCircle size={16} className="text-green-500" />
          )}
          {!checking && available === false && (
            <span className="text-red-400 text-xs font-bold">&#10005;</span>
          )}
        </div>
      </div>

      {available === false && (
        <p className="text-red-500 text-xs mb-3">
          Username is taken or too short (min 3 characters).
        </p>
      )}
      {available === true && (
        <p className="text-green-600 text-xs mb-3">Username is available</p>
      )}

      <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
        This will be your unique handle across the Rubbi Ledger ecosystem.
      </p>

      <div className="bg-primary rounded-xl p-5 mb-7 card-shine overflow-hidden">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-3">
          Rubbi Virtual Card
        </p>
        <p className="font-mono text-white text-lg tracking-widest mb-3">
          &#8226;&#8226;&#8226;&#8226; &#8226;&#8226;&#8226;&#8226; &#8226;&#8226;&#8226;&#8226; 1290
        </p>
        <div className="flex gap-6 mb-4">
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider">Valid Thru</p>
            <p className="text-sm font-semibold text-white">12/28</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider">Network</p>
            <p className="text-sm font-semibold text-white">Arbitrum Sepolia</p>
          </div>
        </div>
        <p className="text-sm font-bold text-white/90">@{value || "username"}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="md" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          size="md"
          fullWidth
          loading={loading || isWriting}
          disabled={!available}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
          onClick={handleContinue}
        >
          Continue to Security
        </Button>
      </div>
    </div>
  );
}
