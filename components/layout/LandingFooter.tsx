"use client";
import React from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import RubbiLogo from "@/components/ui/RubbiLogo";

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
      <div className="px-6 lg:px-36 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={logoHref} className="flex items-center gap-2.5 mb-4">
              <RubbiLogo size={38} />
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
        <div className="px-6 lg:px-36 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
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
