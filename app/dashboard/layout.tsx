"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ArrowLeftRight } from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import DashboardSidebar, { navItems } from "../../components/layout/DashboardSidebar";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import BridgeAssetsModal from "../../components/dashboard/BridgeAssetsModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) router.replace("/");
  }, [mounted, isConnected, router]);

  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-manrope">
      {/* Desktop sidebar */}
      <DashboardSidebar onBridgeClick={() => setBridgeOpen(true)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-neutral-50 flex flex-col shadow-2xl animate-slideDown">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <path d="M12 8H26C31.523 8 36 12.477 36 18C36 22.072 33.572 25.572 30.08 27.2L36 40H28L22.8 28H20V40H12V8Z" fill="#F7F7F2"/>
                    <path d="M20 14V22H26C28.209 22 30 20.209 30 18C30 15.791 28.209 14 26 14H20Z" fill="#22577A"/>
                  </svg>
                </div>
                <span className="font-bold text-primary">Rubbi</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-colors">
                <X size={17} />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                      active ? "bg-white text-primary shadow-sm" : "text-neutral-500 hover:bg-white/70"
                    }`}
                  >
                    <Icon size={15} /> {label}
                  </a>
                );
              })}
            </nav>

            <div className="p-4 border-t border-neutral-100">
              <button
                onClick={() => { setBridgeOpen(true); setSidebarOpen(false); }}
                className="w-full bg-primary text-white rounded-xl py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1B4562] transition-colors"
              >
                <ArrowLeftRight size={14} /> Bridge Assets
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-neutral-100 p-6 lg:p-8">
          {children}
        </main>

        <footer className="bg-neutral-50 border-t border-neutral-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Rubbi Protocol — The Architectural Archive of Λеb3
          </p>
          <div className="flex gap-4 text-xs text-neutral-400">
            <a href="#" className="hover:text-primary transition-colors">Docs</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Github</a>
          </div>
        </footer>
      </div>

      <BridgeAssetsModal open={bridgeOpen} onClose={() => setBridgeOpen(false)} />
    </div>
  );
}
