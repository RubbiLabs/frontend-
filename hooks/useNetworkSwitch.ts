"use client";

import { useSwitchChain, useChainId } from "wagmi";
import { useToast } from "@/context/ToastContext";
import { useAccount } from "wagmi";

const MONAD_TESTNET_CHAIN_ID = 10143;

export function useNetworkSwitch() {
  const { switchChain, isPending } = useSwitchChain();
  const { showToast } = useToast();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === MONAD_TESTNET_CHAIN_ID;

  const switchToMonad = () => {
    try {
      switchChain({ chainId: MONAD_TESTNET_CHAIN_ID });
    } catch (err: unknown) {
      showToast("error", "Switch Failed", "Please manually switch to Monad Testnet in your wallet");
    }
  };

  return {
    isCorrectNetwork,
    isPending,
    switchToMonad,
    MONAD_TESTNET_CHAIN_ID,
    isConnected,
  };
}