"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface WalletContextValue {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isHydrated: boolean;
  chainId: number | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
  username: string | null;
  setUsername: (name: string) => void;
  hasVirtualCard: boolean;
  setHasVirtualCard: (val: boolean) => void;
  virtualCardData: VirtualCardData | null;
  setVirtualCardData: (data: VirtualCardData) => void;
  setVirtualCardActive: (val: boolean) => void;
  rubBalance: string;
  setRubBalance: (val: string) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (val: boolean) => void;
}

export interface VirtualCardData {
  cardHolder: string;
  cardNumber: string;
  lastFour: string;
  expiry: string;
  cvv: string;
  network: string;
  isActive: boolean;
}

const WALLET_KEY = "rubbi_wallet";
const USERNAMES_KEY = "rubbi_usernames";
const CARDS_KEY = "rubbi_virtual_cards";
const BALANCES_KEY = "rubbi_rub_balances";
const ONBOARDING_KEY = "rubbi_onboarding_complete_map";

const WalletContext = createContext<WalletContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function randomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join("");
}

function normalizeVirtualCardData(raw: Partial<VirtualCardData> | null | undefined): VirtualCardData | null {
  if (!raw) return null;

  const existingNumber =
    typeof raw.cardNumber === "string" && /^\d{4}( \d{4}){3}$/.test(raw.cardNumber.trim())
      ? raw.cardNumber.trim()
      : "";
  const existingLastFour =
    typeof raw.lastFour === "string" && /^\d{4}$/.test(raw.lastFour.trim()) ? raw.lastFour.trim() : "";
  const lastFour = existingLastFour || existingNumber.slice(-4) || randomDigits(4);
  const cardNumber = existingNumber || `5234 ${randomDigits(4)} ${randomDigits(4)} ${lastFour}`;
  const expiry =
    typeof raw.expiry === "string" && /^\d{2}\/\d{2}$/.test(raw.expiry.trim())
      ? raw.expiry.trim()
      : `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 4).slice(-2)}`;
  const cvv =
    typeof raw.cvv === "string" && /^\d{3}$/.test(raw.cvv.trim()) ? raw.cvv.trim() : randomDigits(3);

  return {
    cardHolder:
      typeof raw.cardHolder === "string" && raw.cardHolder.trim()
        ? raw.cardHolder.trim().toUpperCase()
        : "RUBBI USER",
    cardNumber,
    lastFour,
    expiry,
    cvv,
    network:
      typeof raw.network === "string" && raw.network.trim() ? raw.network.trim() : "MONAD L1",
    isActive: raw.isActive !== false,
  };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address: wagmiAddress, isConnected: wagmiConnected, isConnecting: wagmiConnecting } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const wagmiChainId = useWagmiChainId();

  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [username, setUsernameState] = useState<string | null>(null);
  const [hasVirtualCard, setHasVirtualCardState] = useState(false);
  const [virtualCardData, setVirtualCardDataState] = useState<VirtualCardData | null>(null);
  const [rubBalance, setRubBalanceState] = useState("0");
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  const resetWalletScopedState = () => {
    setUsernameState(null);
    setHasVirtualCardState(false);
    setVirtualCardDataState(null);
    setRubBalanceState("0");
    setOnboardingCompleteState(false);
  };

  const writeWalletScopedValue = <T,>(storageKey: string, value: T | null, targetAddress = address) => {
    if (typeof window === "undefined" || !targetAddress) return;
    const scoped = readJSON<Record<string, T>>(storageKey, {});
    if (value === null) {
      delete scoped[targetAddress];
    } else {
      scoped[targetAddress] = value;
    }
    writeJSON(storageKey, scoped);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(WALLET_KEY);
    let restoredAddress: `0x${string}` | undefined;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.address) {
          restoredAddress = parsed.address;
          setAddress(parsed.address);
          setIsConnected(true);
          setChainId(parsed.chainId);
        }
      } catch {}
    }

    if (restoredAddress) {
      const legacyUsername = localStorage.getItem("rubbi_username");
      if (legacyUsername) {
        const usernames = readJSON<Record<string, string>>(USERNAMES_KEY, {});
        if (!usernames[restoredAddress]) {
          usernames[restoredAddress] = legacyUsername;
          writeJSON(USERNAMES_KEY, usernames);
        }
      }

      try {
        const legacyCardRaw = localStorage.getItem("rubbi_virtual_card");
        if (legacyCardRaw) {
          const cards = readJSON<Record<string, VirtualCardData>>(CARDS_KEY, {});
          if (!cards[restoredAddress]) {
            const normalizedCard = normalizeVirtualCardData(JSON.parse(legacyCardRaw));
            if (normalizedCard) {
              cards[restoredAddress] = normalizedCard;
              writeJSON(CARDS_KEY, cards);
            }
          }
        }
      } catch {}

      const legacyBalance = localStorage.getItem("rubbi_rub_balance");
      if (legacyBalance) {
        const balances = readJSON<Record<string, string>>(BALANCES_KEY, {});
        if (!balances[restoredAddress]) {
          balances[restoredAddress] = legacyBalance;
          writeJSON(BALANCES_KEY, balances);
        }
      }

      const legacyOnboarding = localStorage.getItem("rubbi_onboarding_complete");
      if (legacyOnboarding) {
        const onboardingMap = readJSON<Record<string, boolean>>(ONBOARDING_KEY, {});
        if (onboardingMap[restoredAddress] === undefined) {
          onboardingMap[restoredAddress] = legacyOnboarding === "true";
          writeJSON(ONBOARDING_KEY, onboardingMap);
        }
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!address) {
      resetWalletScopedState();
      return;
    }

    const usernames = readJSON<Record<string, string>>(USERNAMES_KEY, {});
    const cards = readJSON<Record<string, Partial<VirtualCardData>>>(CARDS_KEY, {});
    const balances = readJSON<Record<string, string>>(BALANCES_KEY, {});
    const onboardingMap = readJSON<Record<string, boolean>>(ONBOARDING_KEY, {});

    setUsernameState(usernames[address] ?? null);

    const normalizedCard = normalizeVirtualCardData(cards[address]);
    setVirtualCardDataState(normalizedCard);
    setHasVirtualCardState(Boolean(normalizedCard));
    if (normalizedCard) {
      const persistedCard = cards[address] as VirtualCardData | undefined;
      if (
        !persistedCard ||
        persistedCard.cardNumber !== normalizedCard.cardNumber ||
        persistedCard.cvv !== normalizedCard.cvv
      ) {
        writeWalletScopedValue(CARDS_KEY, normalizedCard, address);
      }
    }

    setRubBalanceState(balances[address] ?? "0");
    setOnboardingCompleteState(Boolean(onboardingMap[address]));
  }, [address, isHydrated]);

  const connect = async () => {
    // Wallet connection is handled by wagmi, this is just for triggering the modal
    // The actual connection happens via the Web3Provider
    setIsConnecting(true);

    try {
      if ((window as Window & { ethereum?: any }).ethereum) {
        const ethereum = (window as Window & { ethereum: any }).ethereum;
        const accounts: string[] = await ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          const nextAddress = accounts[0] as `0x${string}`;
          const chainIdHex = await ethereum.request({ method: "eth_chainId" });
          const nextChainId = parseInt(chainIdHex, 16);

          setAddress(nextAddress);
          setIsConnected(true);
          setChainId(nextChainId);
          localStorage.setItem(WALLET_KEY, JSON.stringify({ address: nextAddress, chainId: nextChainId }));

          ethereum.on("accountsChanged", (accs: string[]) => {
            if (accs.length === 0) {
              setAddress(undefined);
              setIsConnected(false);
              setChainId(undefined);
              resetWalletScopedState();
              localStorage.removeItem(WALLET_KEY);
            } else {
              const updatedAddress = accs[0] as `0x${string}`;
              setAddress(updatedAddress);
              setIsConnected(true);
              localStorage.setItem(
                WALLET_KEY,
                JSON.stringify({ address: updatedAddress, chainId: nextChainId })
              );
            }
          });

          ethereum.on("chainChanged", (hex: string) => {
            const updatedChainId = parseInt(hex, 16);
            setChainId(updatedChainId);
            localStorage.setItem(
              WALLET_KEY,
              JSON.stringify({ address: nextAddress, chainId: updatedChainId })
            );
          });
        }
      } else {
        const mockAddr = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
        setAddress(mockAddr);
        setIsConnected(true);
        setChainId(10143);
        localStorage.setItem(WALLET_KEY, JSON.stringify({ address: mockAddr, chainId: 10143 }));
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    wagmiDisconnect();
    setAddress(undefined);
    setChainId(undefined);
    resetWalletScopedState();
    if (typeof window !== "undefined") {
      localStorage.removeItem(WALLET_KEY);
    }
  };

  const setUsername = (name: string) => {
    const sanitizedName = name.trim().toLowerCase();
    setUsernameState(sanitizedName || null);
    writeWalletScopedValue(USERNAMES_KEY, sanitizedName || null);
  };

  const setHasVirtualCard = (val: boolean) => {
    setHasVirtualCardState(val);
    if (!val) {
      setVirtualCardDataState(null);
      writeWalletScopedValue(CARDS_KEY, null);
    }
  };

  const setVirtualCardData = (data: VirtualCardData) => {
    const normalized = normalizeVirtualCardData(data);
    if (!normalized) return;
    setVirtualCardDataState(normalized);
    setHasVirtualCardState(true);
    writeWalletScopedValue(CARDS_KEY, normalized);
  };

  const setVirtualCardActive = (val: boolean) => {
    setVirtualCardDataState((current) => {
      if (!current) return current;
      const nextCard = { ...current, isActive: val };
      writeWalletScopedValue(CARDS_KEY, nextCard);
      return nextCard;
    });
  };

  const setRubBalance = (val: string) => {
    setRubBalanceState(val);
    writeWalletScopedValue(BALANCES_KEY, val);
  };

  const setOnboardingComplete = (val: boolean) => {
    setOnboardingCompleteState(val);
    writeWalletScopedValue(ONBOARDING_KEY, val);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        isHydrated,
        chainId,
        connect,
        disconnect,
        username,
        setUsername,
        hasVirtualCard,
        setHasVirtualCard,
        virtualCardData,
        setVirtualCardData,
        setVirtualCardActive,
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
