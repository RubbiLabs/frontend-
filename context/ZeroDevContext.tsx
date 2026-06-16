"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useWalletClient } from "wagmi";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createPublicClient, http, type WalletClient } from "viem";
import { getZeroDevRpc, ZERODEV_CHAIN } from "@/lib/zerodev";
import { useWallet } from "@/context/WalletContext";
import { useSocialAuth } from "@/context/SocialAuthContext";

interface ZeroDevContextValue {
  kernelClient: any | null;
  smartAccountAddress: string | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

const ZeroDevContext = createContext<ZeroDevContextValue>({
  kernelClient: null,
  smartAccountAddress: null,
  isReady: false,
  isLoading: false,
  error: null,
});

export function ZeroDevProvider({ children }: { children: React.ReactNode }) {
  const { address: walletAddress, isConnected: walletConnected } = useWallet();
  const { isSocialLogin, socialAddress, socialWalletClient } = useSocialAuth();
  const { data: wagmiWalletClient } = useWalletClient();
  const [kernelClient, setKernelClient] = useState<any | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef<string | null>(null);

  const effectiveAddress = isSocialLogin ? socialAddress : walletAddress;
  const effectiveWalletClient: WalletClient | null = isSocialLogin
    ? socialWalletClient
    : (wagmiWalletClient as WalletClient | null);
  const isEffectiveConnected = isSocialLogin ? !!socialAddress : walletConnected;

  const initKernel = useCallback(async (wc: WalletClient, userAddress: string) => {
    if (initializedRef.current === userAddress) return;
    setIsLoading(true);
    setError(null);

    try {
      const rpc = getZeroDevRpc();
      console.log("[ZeroDev] Initializing smart account for:", userAddress);

      const publicClient = createPublicClient({
        transport: http(rpc),
        chain: ZERODEV_CHAIN,
      });

      const entryPoint = getEntryPoint("0.7");
      const kernelVersion = KERNEL_V3_1;

      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: wc as any,
        entryPoint,
        kernelVersion,
      });

      const account = await createKernelAccount(publicClient, {
        plugins: { sudo: ecdsaValidator },
        entryPoint,
        kernelVersion,
      });

      const paymasterClient = createZeroDevPaymasterClient({
        chain: ZERODEV_CHAIN,
        transport: http(rpc),
      });

      const client = createKernelAccountClient({
        account,
        chain: ZERODEV_CHAIN,
        bundlerTransport: http(rpc),
        client: publicClient,
        paymaster: {
          getPaymasterData(userOperation) {
            return paymasterClient.sponsorUserOperation({ userOperation });
          },
        },
      });

      console.log("[ZeroDev] Smart account created:", account.address);
      setKernelClient(client);
      setSmartAccountAddress(account.address);
      initializedRef.current = userAddress;
    } catch (err: any) {
      console.error("[ZeroDev] Init failed:", err);
      setError(err.message || "Failed to initialize smart account");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEffectiveConnected && effectiveAddress && effectiveWalletClient) {
      initKernel(effectiveWalletClient, effectiveAddress);
    } else {
      setKernelClient(null);
      setSmartAccountAddress(null);
      initializedRef.current = null;
    }
  }, [isEffectiveConnected, effectiveAddress, effectiveWalletClient, initKernel]);

  return (
    <ZeroDevContext.Provider
      value={{
        kernelClient,
        smartAccountAddress,
        isReady: !!kernelClient && !isLoading,
        isLoading,
        error,
      }}
    >
      {children}
    </ZeroDevContext.Provider>
  );
}

export function useZeroDev() {
  return useContext(ZeroDevContext);
}
