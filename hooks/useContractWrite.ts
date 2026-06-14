"use client";
import { useCallback, useRef } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { createPublicClient, http, formatGwei, type Abi, type Address } from "viem";
import { arbitrumSepolia } from "viem/chains";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
const ARB_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc";

interface ContractWriteParams {
  abi: Abi;
  address: Address;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  onSuccess?: (txHash: string) => void;
  backendSync?: {
    endpoint: "subscriptions.start" | "subscriptions.pause" | "subscriptions.resume"
      | "faucet.claim" | "salaryStreaming.create" | "salaryStreaming.pause"
      | "salaryStreaming.resume" | "salaryStreaming.disburse";
    params: Record<string, any>;
  };
}

export function useContractWrite() {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { kernelClient, isReady: isZeroDevReady, smartAccountAddress } = useZeroDev();
  const { showToast } = useToast();
  const syncCalledRef = useRef<string | null>(null);

  const { writeContract, data: wagmiTxHash, isPending: isWagmiPending } = useWriteContract();
  const { isLoading: isWagmiConfirming, isSuccess: isWagmiSuccess } =
    useWaitForTransactionReceipt({ hash: wagmiTxHash });

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
        showToast("error", "Wrong Network", "Please switch to Arbitrum Sepolia");
        return null;
      }

      if (!address) {
        showToast("error", "Not Connected", "Please connect your wallet first");
        return null;
      }

      let txHash: string | null = null;

      try {
        if (kernelClient && isZeroDevReady) {
          // === ZERO DEV GASLESS PATH ===
          const client = kernelClient as any;
          const hash = await client.writeContract({
            address: contractAddress,
            abi,
            functionName,
            args,
            value,
          });

          const receipt = await client.waitForUserOperationReceipt({
            hash,
            timeout: 120_000,
          });

          txHash = receipt.receipt.transactionHash;
        } else {
          // === WAGMI FALLBACK (NOT GASLESS) ===
          // Fetch current gas prices from the network
          const publicClient = createPublicClient({
            transport: http(ARB_SEPOLIA_RPC),
            chain: arbitrumSepolia,
          });

          const [gasPrice, block] = await Promise.all([
            publicClient.getGasPrice(),
            publicClient.getBlock(),
          ]);

          // Set maxFeePerGas to 2x base fee + priority fee for Arbitrum
          const baseFee = block.baseFeePerGas || gasPrice;
          const maxPriorityFeePerGas = 1000000000n; // 1 gwei priority
          const maxFeePerGas = baseFee * 2n + maxPriorityFeePerGas;

          // Estimate gas limit
          const gas = await publicClient.estimateContractGas({
            address: contractAddress,
            abi,
            functionName,
            args,
            account: address,
            value,
          });

          // Add 20% buffer to gas estimate
          const gasWithBuffer = (gas * 120n) / 100n;

          await new Promise<void>((resolve, reject) => {
            writeContract(
              {
                address: contractAddress,
                abi,
                functionName,
                args,
                value,
                gas: gasWithBuffer,
                maxFeePerGas,
                maxPriorityFeePerGas,
              },
              {
                onSuccess: (hash) => {
                  txHash = hash;
                  resolve();
                },
                onError: (err) => reject(err),
              }
            );
          });

          // Wait for confirmation
          if (txHash) {
            await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
          }
        }

        if (txHash) {
          // === BACKEND SYNC ===
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

          showToast("success", "Transaction Confirmed", `${functionName} completed.`);
          onSuccess?.(txHash);
        }

        return txHash;
      } catch (err: any) {
        console.error(`Contract write error (${functionName}):`, err);
        showToast("error", "Transaction Failed", err.message || "Transaction failed.");
        return null;
      }
    },
    [address, chainId, kernelClient, isZeroDevReady, writeContract, showToast]
  );

  return {
    execute,
    isWriting: isWagmiPending || isWagmiConfirming,
    smartAccountAddress,
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
