"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [username, setUsernameState] = useState<string | null>(null);
  const [hasVirtualCard, setHasVirtualCard] = useState(false);
  const [virtualCardData, setVirtualCardDataState] = useState<VirtualCardData | null>(null);
  const [rubBalance, setRubBalanceState] = useState("0");
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("rubbi_wallet");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.address) {
          setAddress(parsed.address);
          setIsConnected(true);
          setChainId(parsed.chainId);
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
    if (typeof window === "undefined") return;
    setIsConnecting(true);
    try {
      // Try MetaMask / injected wallet
      if ((window as any).ethereum) {
        const accounts: string[] = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          const addr = accounts[0] as `0x${string}`;
          const chainIdHex = await (window as any).ethereum.request({ method: "eth_chainId" });
          const cId = parseInt(chainIdHex, 16);
          setAddress(addr);
          setIsConnected(true);
          setChainId(cId);
          localStorage.setItem("rubbi_wallet", JSON.stringify({ address: addr, chainId: cId }));

          // Listen for account/chain changes
          (window as any).ethereum.on("accountsChanged", (accs: string[]) => {
            if (accs.length === 0) {
              setAddress(undefined);
              setIsConnected(false);
              localStorage.removeItem("rubbi_wallet");
            } else {
              setAddress(accs[0] as `0x${string}`);
            }
          });
          (window as any).ethereum.on("chainChanged", (hex: string) => {
            setChainId(parseInt(hex, 16));
          });
        }
      } else {
        // Demo mode - generate a mock address for testing
        const mockAddr = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
        setAddress(mockAddr);
        setIsConnected(true);
        setChainId(10143); // Monad testnet
        localStorage.setItem("rubbi_wallet", JSON.stringify({ address: mockAddr, chainId: 10143 }));
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(undefined);
    setIsConnected(false);
    setChainId(undefined);
    localStorage.removeItem("rubbi_wallet");
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
        address,
        isConnected,
        isConnecting,
        chainId,
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
