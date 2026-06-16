"use client";
import { useCallback, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import type { Abi, Address } from "viem";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

interface ContractWriteParams {
  abi: Abi;
  address: Address;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  onSuccess?: (txHash: string) => void;
  backendSync?: {
    endpoint:
      | "subscriptions.start"
      | "subscriptions.pause"
      | "subscriptions.resume"
      | "faucet.claim"
      | "salaryStreaming.create"
      | "salaryStreaming.pause"
      | "salaryStreaming.resume"
      | "salaryStreaming.disburse";
    params: Record<string, any>;
  };
}

export function useContractWrite() {
  const { address, chainId } = useAccount();
  const { kernelClient, isReady: isZeroDevReady, isLoading: isZeroDevLoading, error: zeroDevError } = useZeroDev();
  const { showToast } = useToast();
  const syncCalledRef = useRef<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  const execute = useCallback(
    async ({
      abi,
      address: contractAddress,
      functionName,
      args = [],
      value = 0n,
      onSuccess,
      backendSync,
    }: ContractWriteParams) => {
      if (chainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
        showToast("error", "Wrong Network", "Please switch to Arbitrum Sepolia in your wallet.");
        return null;
      }

      if (!address) {
        showToast("error", "Not Connected", "Please connect your wallet first.");
        return null;
      }

      if (!kernelClient || !isZeroDevReady) {
        const msg = zeroDevError
          ? `ZeroDev error: ${zeroDevError}`
          : isZeroDevLoading
            ? "Smart account is still initializing. Please wait for the blue 'Gasless transactions active' banner and try again."
            : "ZeroDev smart account not initialized. Open browser console for details.";
        showToast("error", "Gasless Transactions Not Ready", msg);
        console.error(`[ContractWrite] ZeroDev not ready for ${functionName}. isLoading=${isZeroDevLoading} error=${zeroDevError}`);
        return null;
      }

      setIsWriting(true);
      let txHash: string | null = null;

      try {
        const client = kernelClient as any;
        showToast("info", "Submitting Transaction", `Sending ${functionName} via gasless transaction...`);

        const hash = await client.writeContract({
          address: contractAddress,
          abi,
          functionName,
          args,
          value,
        });

        showToast("info", "Transaction Sent", "Waiting for on-chain confirmation...");

        const receipt = await client.waitForUserOperationReceipt({
          hash,
          timeout: 120_000,
        });

        txHash = receipt.receipt.transactionHash;

        if (txHash) {
          if (backendSync) {
            const syncKey = `${backendSync.endpoint}:${txHash}`;
            if (syncCalledRef.current !== syncKey) {
              syncCalledRef.current = syncKey;
              try {
                await syncToBackend(backendSync.endpoint, backendSync.params, txHash);
              } catch (syncErr) {
                console.error("Backend sync failed:", syncErr);
              }
            }
          }

          showToast("success", "Transaction Confirmed", `${functionName} completed successfully.`);
          onSuccess?.(txHash);
        }

        return txHash;
      } catch (err: any) {
        console.error(`[ContractWrite] ${functionName} failed:`, err);
        const msg = err?.message || "Transaction was rejected or failed.";
        if (msg.includes("User rejected") || msg.includes("user rejected")) {
          showToast("error", "Transaction Rejected", "You rejected the transaction in your wallet.");
        } else if (msg.includes("insufficient")) {
          showToast("error", "Insufficient Funds", "You don't have enough funds for this transaction.");
        } else {
          showToast("error", "Transaction Failed", msg);
        }
        return null;
      } finally {
        setIsWriting(false);
      }
    },
    [address, chainId, kernelClient, isZeroDevReady, isZeroDevLoading, zeroDevError, showToast]
  );

  return {
    execute,
    isWriting,
    smartAccountAddress: kernelClient ? "connected" : null,
  };
}

async function syncToBackend(
  endpoint: string,
  params: Record<string, any>,
  txHash: string
) {
  switch (endpoint) {
    case "subscriptions.start":
      await api.subscriptions.start(params.planId, txHash);
      break;
    case "subscriptions.pause":
      await api.subscriptions.pause(params.planId, txHash);
      break;
    case "subscriptions.resume":
      await api.subscriptions.resume(params.planId, txHash);
      break;
    case "faucet.claim":
      await api.faucet.claim(txHash);
      break;
    case "salaryStreaming.create":
      await api.salaryStreaming.create(txHash);
      break;
    case "salaryStreaming.pause":
      await api.salaryStreaming.pause(params.streamId, txHash);
      break;
    case "salaryStreaming.resume":
      await api.salaryStreaming.resume(params.streamId, txHash);
      break;
    case "salaryStreaming.disburse":
      await api.salaryStreaming.disburse(txHash);
      break;
  }
}
