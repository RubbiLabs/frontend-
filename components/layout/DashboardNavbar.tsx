"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { navItems } from "@/components/layout/DashboardSidebar";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { disconnect, address } = useWallet();
  const { info } = useToast();

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
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                <path
                  d="M12 8H26C31.523 8 36 12.477 36 18C36 22.072 33.572 25.572 30.08 27.2L36 40H28L22.8 28H20V40H12V8Z"
                  fill="#F7F7F2"
                />
              </svg>
            </div>
            <span className="font-bold text-primary text-sm">Rubbi</span>
          </div>

          {/* Desktop: brand name + current page */}
          <div className="hidden lg:flex items-center gap-2">
            {/* <span className="font-bold text-primary text-base">Rubbi</span>
            <span className="text-neutral-300">|</span> */}
            <span className="text-sm text-neutral-500 font-medium">{activeLabel}</span>
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
            onClick={handleDisconnect}
            title="Disconnect wallet"
            className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>
    </>
  );
}
