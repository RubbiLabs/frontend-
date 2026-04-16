"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { isConnected, isHydrated } = useWallet();

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(isConnected ? "/dashboard" : "/");
  }, [isConnected, isHydrated, router]);

  return null;
}
