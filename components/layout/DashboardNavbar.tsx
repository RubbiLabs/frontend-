"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { navItems } from "@/components/layout/DashboardSidebar";
import RubbiLogo from "@/components/ui/RubbiLogo";
import Button from "@/components/ui/Button";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { disconnect, address } = useWallet();
  const { info } = useToast();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    info("Wallet Disconnected", "You have been signed out.");
    router.push("/");
  };

  const activeLabel =
    navItems.find((n) => n.href === pathname)?.label ?? "Dashboard";
  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <>
      <header className="bg-neutral-50 border-b border-neutral-200 px-5 py-3.5 flex items-center justify-between shrink-0">
        {/* Left: hamburger (mobile) + brand/title */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Logo mark visible on mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <RubbiLogo size={28} />
          </div>

          {/* Desktop: brand name + current page */}
          <div className="hidden lg:flex items-center gap-2">
            {/* <span className="font-bold text-primary text-base">Rubbi</span>
            <span className="text-neutral-300">|</span> */}
            {/* <span className="text-sm text-primary-400 font-bold">{activeLabel}</span> */}
          </div>
        </div>

        {/* Right: network badge + wallet address + disconnect */}
        <div className="flex items-center gap-2.5">
          {/* <NetworkBadge chainId={chainId} /> */}

          {/* Wallet address pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
              <Wallet size={11} className="text-primary" />
            </div>
            <span className="text-[11px] font-mono text-neutral-600 leading-none">
              {shortAddr}
            </span>
          </div>

          {/* Disconnect */}
          <button
            onClick={() => setShowDisconnectModal(true)}
            title="Disconnect wallet"
            className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scaleIn">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Disconnect Wallet?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to disconnect your wallet? You will be redirected to the homepage.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowDisconnectModal(false)}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant="danger"
                onClick={() => {
                  setShowDisconnectModal(false);
                  handleDisconnect();
                }}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
