"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount, useDisconnect, useChainId as useWagmiChainId } from "wagmi";

interface WalletContextValue {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
  username: string | null;
  setUsername: (name: string) => void;
  hasVirtualCard: boolean;
  setHasVirtualCard: (val: boolean) => void;
  virtualCardData: VirtualCardData | null;
  setVirtualCardData: (data: VirtualCardData) => void;
  rubBalance: string;
  setRubBalance: (val: string) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (val: boolean) => void;
}

export interface VirtualCardData {
  cardHolder: string;
  lastFour: string;
  expiry: string;
  network: string;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address: wagmiAddress, isConnected: wagmiConnected, isConnecting: wagmiConnecting } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const wagmiChainId = useWagmiChainId();

  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [username, setUsernameState] = useState<string | null>(null);
  const [hasVirtualCard, setHasVirtualCard] = useState(false);
  const [virtualCardData, setVirtualCardDataState] = useState<VirtualCardData | null>(null);
  const [rubBalance, setRubBalanceState] = useState("0");
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  // Sync wagmi state to context
  useEffect(() => {
    if (wagmiAddress) {
      setAddress(wagmiAddress);
      localStorage.setItem("rubbi_wallet", JSON.stringify({ address: wagmiAddress, chainId: wagmiChainId }));
    }
  }, [wagmiAddress, wagmiChainId]);

  useEffect(() => {
    setChainId(wagmiChainId);
    const stored = localStorage.getItem("rubbi_wallet");
    if (stored && wagmiConnected) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.chainId !== wagmiChainId) {
          localStorage.setItem("rubbi_wallet", JSON.stringify({ address: wagmiAddress, chainId: wagmiChainId }));
        }
      } catch {}
    }
  }, [wagmiChainId, wagmiConnected, wagmiAddress]);

  // Restore from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const stored = localStorage.getItem("rubbi_wallet");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.address) {
          // Address will be set from wagmi when wallet connects
        }
      } catch {}
    }
    const uname = localStorage.getItem("rubbi_username");
    if (uname) setUsernameState(uname);
    const card = localStorage.getItem("rubbi_virtual_card");
    if (card) { setHasVirtualCard(true); setVirtualCardDataState(JSON.parse(card)); }
    const bal = localStorage.getItem("rubbi_rub_balance");
    if (bal) setRubBalanceState(bal);
    const onboarded = localStorage.getItem("rubbi_onboarding_complete");
    if (onboarded === "true") setOnboardingCompleteState(true);
  }, []);

  const connect = async () => {
    // Wallet connection is handled by wagmi, this is just for triggering the modal
    // The actual connection happens via the Web3Provider
    setIsConnecting(true);
    setTimeout(() => setIsConnecting(false), 1000);
  };

  const disconnect = () => {
    wagmiDisconnect();
    setAddress(undefined);
    setChainId(undefined);
    localStorage.removeItem("rubbi_wallet");
    localStorage.removeItem("rubbi_token");
  };

  const setUsername = (name: string) => {
    setUsernameState(name);
    localStorage.setItem("rubbi_username", name);
  };

  const setVirtualCardData = (data: VirtualCardData) => {
    setVirtualCardDataState(data);
    setHasVirtualCard(true);
    localStorage.setItem("rubbi_virtual_card", JSON.stringify(data));
  };

  const setRubBalance = (val: string) => {
    setRubBalanceState(val);
    localStorage.setItem("rubbi_rub_balance", val);
  };

  const setOnboardingComplete = (val: boolean) => {
    setOnboardingCompleteState(val);
    localStorage.setItem("rubbi_onboarding_complete", String(val));
  };

  return (
    <WalletContext.Provider
      value={{
        address: wagmiAddress,
        isConnected: wagmiConnected,
        isConnecting: wagmiConnecting || isConnecting,
        chainId: wagmiChainId,
        connect,
        disconnect,
        username,
        setUsername,
        hasVirtualCard,
        setHasVirtualCard,
        virtualCardData,
        setVirtualCardData,
        rubBalance,
        setRubBalance,
        onboardingComplete,
        setOnboardingComplete,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
