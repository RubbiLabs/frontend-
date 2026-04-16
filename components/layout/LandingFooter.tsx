"use client";
import React from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";

export default function LandingFooter() {
  const year = new Date().getFullYear();
  const { isConnected } = useWallet();
  const logoHref = isConnected ? "/dashboard" : "/";

  const protocol = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Subscriptions", href: "/dashboard/subscriptions" },
    { label: "Salary Streams", href: "/dashboard/salary-streams" },
    { label: "Wallet Connect", href: isConnected ? "/dashboard/wallet" : "/" },
  ];

  const connect = [
    { label: "Documentation", href: "#" },
    { label: "Github", href: "#" },
    { label: "Twitter", href: "#" },
    { label: "Support", href: "#" },
  ];

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={logoHref} className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                  <path d="M12 8H26C31.523 8 36 12.477 36 18C36 22.072 33.572 25.572 30.08 27.2L36 40H28L22.8 28H20V40H12V8Z" fill="#F7F7F2"/>
                  <path d="M20 14V22H26C28.209 22 30 20.209 30 18C30 15.791 28.209 14 26 14H20Z" fill="#22577A"/>
                  <circle cx="38" cy="38" r="4" fill="#8C7851"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-primary">Rubbi</span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Building the architectural foundations for a decentralized, autonomous financial era.
              Permanent. Trustworthy. Tactile.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Secure Enclave Active
              </span>
            </div>
          </div>

          {/* Protocol links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Protocol</h4>
            <ul className="space-y-3">
              {protocol.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-neutral-600 hover:text-primary transition-colors font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Connect</h4>
            <ul className="space-y-3">
              {connect.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-neutral-600 hover:text-primary transition-colors font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            © {year} Rubbi Financial Automation. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-xs text-neutral-400 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-neutral-400 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
