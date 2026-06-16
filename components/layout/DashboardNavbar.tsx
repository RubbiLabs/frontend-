"use client";
import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, Wallet, User } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useSocialAuth } from "@/context/SocialAuthContext";
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
  const { isSocialLogin, socialUser, socialAddress, logoutSocial } = useSocialAuth();
  const { info } = useToast();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleDisconnect = () => {
    if (isSocialLogin) {
      logoutSocial();
    } else {
      disconnect();
    }
    info("Signed Out", "You have been signed out.");
    router.push("/");
  };

  const isSocial = isSocialLogin && socialUser;
  const displayName = isSocial
    ? socialUser.name.split(" ")[0]
    : address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "";

  const profilePicture = isSocial && socialUser.picture ? socialUser.picture : null;

  return (
    <>
      <header className="bg-neutral-50 border-b border-neutral-200 px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <RubbiLogo size={28} />
          </div>

          <div className="hidden lg:flex items-center gap-2">
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Profile pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2">
            {profilePicture ? (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <Image
                  src={profilePicture}
                  alt={socialUser?.name || "User"}
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                {isSocial ? (
                  <User size={11} className="text-primary" />
                ) : (
                  <Wallet size={11} className="text-primary" />
                )}
              </div>
            )}
            <span className="text-[13px] font-medium text-neutral-600 leading-none">
              {displayName}
            </span>
          </div>

          {/* Disconnect */}
          <button
            onClick={() => setShowDisconnectModal(true)}
            title="Sign out"
            className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scaleIn">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              {isSocial ? "Sign Out?" : "Disconnect Wallet?"}
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              {isSocial
                ? `Are you sure you want to sign out of ${socialUser.email}? You will be redirected to the homepage.`
                : "Are you sure you want to disconnect your wallet? You will be redirected to the homepage."}
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
                {isSocial ? "Sign Out" : "Disconnect"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
