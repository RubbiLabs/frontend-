"use client";
import { useCallback, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useWallet } from "@/context/WalletContext";
import { useSocialAuth } from "@/context/SocialAuthContext";
import { useToast } from "@/context/ToastContext";
import { useTransactionModal } from "@/context/TransactionModalContext";
import { api } from "@/lib/api";
import type { Abi, Address } from "viem";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

const txTypeLabels: Record<string, { title: string; submitting: string; confirming: string; success: string }> = {
  faucet: { title: "Claiming Faucet", submitting: "Claiming tokens via gasless relay...", confirming: "Waiting for tokens to be credited...", success: "Faucet tokens claimed!" },
  deposit: { title: "Depositing Funds", submitting: "Depositing to contract via gasless relay...", confirming: "Waiting for deposit confirmation...", success: "Funds deposited!" },
  subscribe: { title: "Creating Subscription", submitting: "Creating subscription via gasless relay...", confirming: "Waiting for subscription activation...", success: "Subscription activated!" },
  pause: { title: "Pausing Subscription", submitting: "Pausing via gasless relay...", confirming: "Waiting for confirmation...", success: "Subscription paused!" },
  resume: { title: "Resuming Subscription", submitting: "Resuming via gasless relay...", confirming: "Waiting for confirmation...", success: "Subscription resumed!" },
  createStream: { title: "Creating Salary Stream", submitting: "Creating stream via gasless relay...", confirming: "Waiting for stream creation...", success: "Stream created!" },
  pauseStream: { title: "Pausing Stream", submitting: "Pausing stream via gasless relay...", confirming: "Waiting for confirmation...", success: "Stream paused!" },
  resumeStream: { title: "Resuming Stream", submitting: "Resuming stream via gasless relay...", confirming: "Waiting for confirmation...", success: "Stream resumed!" },
  disburse: { title: "Disbursing Funds", submitting: "Disbursing via gasless relay...", confirming: "Waiting for disbursement...", success: "Funds disbursed!" },
  withdraw: { title: "Withdrawing Funds", submitting: "Withdrawing via gasless relay...", confirming: "Waiting for withdrawal...", success: "Funds withdrawn!" },
  createAccount: { title: "Creating Account", submitting: "Creating account via gasless relay...", confirming: "Waiting for account creation...", success: "Account created!" },
  approve: { title: "Approving Token", submitting: "Approving via gasless relay...", confirming: "Waiting for approval...", success: "Token approved!" },
  swap: { title: "Swapping Tokens", submitting: "Submitting swap via gasless relay...", confirming: "Waiting for swap completion...", success: "Swap complete!" },
  default: { title: "Processing Transaction", submitting: "Submitting via gasless relay...", confirming: "Waiting for confirmation...", success: "Transaction complete!" },
};

interface ContractWriteParams {
  abi: Abi;
  address: Address;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
  onSuccess?: (txHash: string) => void;
  txType?: string;
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
  const { address: wagmiAddress, chainId: wagmiChainId } = useAccount();
  const { address: walletAddress, chainId: walletChainId } = useWallet();
  const { isSocialLogin, socialAddress } = useSocialAuth();
  const { kernelClient, isReady: isZeroDevReady, isLoading: isZeroDevLoading, error: zeroDevError } = useZeroDev();
  const { showToast } = useToast();
  const { showTxModal, setTxStatus, hideTxModal } = useTransactionModal();
  const syncCalledRef = useRef<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  const address = isSocialLogin ? socialAddress : (wagmiAddress || walletAddress);
  const chainId = isSocialLogin ? ARBITRUM_SEPOLIA_CHAIN_ID : (wagmiChainId || walletChainId);

  const execute = useCallback(
    async ({
      abi,
      address: contractAddress,
      functionName,
      args = [],
      value = 0n,
      onSuccess,
      txType = "default",
      backendSync,
    }: ContractWriteParams) => {
      const labels = txTypeLabels[txType] || txTypeLabels.default;

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
            : "ZeroDev smart account not initialized. Check browser console for details.";
        showToast("error", "Gasless Not Ready", msg);
        console.error(`[ContractWrite] ZeroDev not ready for ${functionName}. isLoading=${isZeroDevLoading} error=${zeroDevError}`);
        return null;
      }

      setIsWriting(true);
      showTxModal({ type: txType, title: labels.title, description: labels.submitting });
      let txHash: string | null = null;

      try {
        const client = kernelClient as any;

        const hash = await client.writeContract({
          address: contractAddress,
          abi,
          functionName,
          args,
          value,
        });

        setTxStatus("confirming", labels.confirming);

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

          setTxStatus("success", labels.success, txHash);
          showToast("success", labels.title, labels.success);
          onSuccess?.(txHash);
        }

        return txHash;
      } catch (err: any) {
        console.error(`[ContractWrite] ${functionName} failed:`, err);
        const msg = err?.message || "Transaction was rejected or failed.";
        let userMsg = msg;
        if (msg.includes("User rejected") || msg.includes("user rejected")) {
          userMsg = "You rejected the transaction.";
        } else if (msg.includes("insufficient")) {
          userMsg = "Insufficient funds for this transaction.";
        }
        setTxStatus("error", userMsg, undefined, userMsg);
        showToast("error", "Transaction Failed", userMsg);
        return null;
      } finally {
        setIsWriting(false);
      }
    },
    [address, chainId, kernelClient, isZeroDevReady, isZeroDevLoading, zeroDevError, showToast, showTxModal, setTxStatus]
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
