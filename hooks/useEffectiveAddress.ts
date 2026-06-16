"use client";
import { useAccount } from "wagmi";
import { useWallet } from "@/context/WalletContext";
import { useSocialAuth } from "@/context/SocialAuthContext";

export function useEffectiveAddress() {
  const { address: wagmiAddress } = useAccount();
  const { address: walletAddress } = useWallet();
  const { isSocialLogin, socialAddress } = useSocialAuth();

  if (isSocialLogin && socialAddress) return socialAddress;
  return wagmiAddress || walletAddress;
}

export function useIsSocialLogin() {
  const { isSocialLogin } = useSocialAuth();
  return isSocialLogin;
}
