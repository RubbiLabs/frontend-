"use client";

import { useSwitchChain, useChainId } from "wagmi";
import { useToast } from "@/context/ToastContext";
import { useWallet } from "@/context/WalletContext";
import { useSocialAuth } from "@/context/SocialAuthContext";

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export function useNetworkSwitch() {
  const { switchChain, isPending } = useSwitchChain();
  const { showToast } = useToast();
  const { isConnected } = useWallet();
  const { isSocialLogin } = useSocialAuth();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;
  const connected = isConnected || isSocialLogin;

  const switchToArbitrum = () => {
    try {
      switchChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID });
    } catch (err: unknown) {
      showToast("error", "Switch Failed", "Please manually switch to Arbitrum Sepolia in your wallet");
    }
  };

  return {
    isCorrectNetwork,
    isPending,
    switchToArbitrum,
    ARBITRUM_SEPOLIA_CHAIN_ID,
    isConnected: connected,
  };
}
