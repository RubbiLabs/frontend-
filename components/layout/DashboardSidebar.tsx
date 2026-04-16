"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Repeat2,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/dashboard/salary-streams", label: "Salary Streams", icon: Repeat2 },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
];

interface DashboardSidebarProps {
  onBridgeClick: () => void;
}

export default function DashboardSidebar({ onBridgeClick }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-neutral-50 border-r border-neutral-200 shrink-0 h-full">
      {/* Brand */}
      <div className="p-5 border-b border-neutral-100">
        <div className="flex items-center gap-0.5">
          <div className="w-9 h-9 bg-primary rounded-l flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path
                d="M12 8H26C31.523 8 36 12.477 36 18C36 22.072 33.572 25.572 30.08 27.2L36 40H28L22.8 28H20V40H12V8Z"
                fill="#F7F7F2"
              />
              <path
                d="M20 14V22H26C28.209 22 30 20.209 30 18C30 15.791 28.209 14 26 14H20Z"
                fill="#22577A"
              />
              <circle cx="36" cy="38" r="3" fill="#8C7851" />
            </svg>
            {/* <img src="" alt="Rubbi logo" /> */}
          </div>
          <div>
            <p className="font-bold text-primary text-[15px] leading-tight">ubbi Ledger</p>
            {/* <p className="text-[10px] text-neutral-400 font-semibold tracking-widest uppercase">
              Monad Network
            </p> */}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold
                uppercase tracking-widest transition-all duration-150 group
                ${active
                  ? "bg-white text-primary shadow-sm"
                  : "text-neutral-500 hover:bg-white/70 hover:text-neutral-800"
                }
              `}
            >
              <Icon
                size={16}
                className={
                  active
                    ? "text-primary"
                    : "text-neutral-400 group-hover:text-neutral-600 transition-colors"
                }
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bridge Assets CTA */}
      <div className="p-4 border-t border-neutral-100">
        <button
          onClick={onBridgeClick}
          className="
            w-full bg-primary text-white rounded-xl py-3 px-4
            text-[11px] font-bold uppercase tracking-widest
            flex items-center justify-center gap-2
            hover:bg-[#1B4562] active:bg-[#14344A]
            transition-colors duration-200 shadow-sm
          "
        >
          <ArrowLeftRight size={15} />
          Bridge Assets
        </button>
      </div>
    </aside>
  );
}
