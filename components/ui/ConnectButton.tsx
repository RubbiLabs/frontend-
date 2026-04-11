"use client";

import { useAccount, useDisconnect } from "wagmi";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export function ConnectButton({ variant = "inline" }: { variant?: "navbar" | "landing" | "inline" }) {
  const { isConnected, address } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  // Navigate after successful connection
  useEffect(() => {
    if (isConnected && !hasNavigated) {
      setHasNavigated(true);
      const onboarded = localStorage.getItem("rubbi_onboarding_complete");
      if (onboarded === "true") {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [isConnected, hasNavigated, router]);

  const handleConnect = () => {
    open({ view: "Connect" });
  };

  const handleDashboard = () => {
    router.push("/dashboard");
    setShowDropdown(false);
  };

  const handleDisconnect = () => {
    wagmiDisconnect();
    localStorage.removeItem("rubbi_wallet");
    localStorage.removeItem("rubbi_token");
    router.push("/");
    setShowDropdown(false);
    setHasNavigated(false);
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="font-mono text-sm text-neutral-700">{shortAddr}</span>
        <ChevronDown size={14} className="text-neutral-400" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 z-50">
          <button
            onClick={handleDashboard}
            className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
          >
            <Wallet size={14} />
            Dashboard
          </button>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}