"use client";
import React from "react";
import { Loader2, CheckCircle, XCircle, ArrowLeftRight, Droplets, CreditCard, Zap, Download, RefreshCw } from "lucide-react";

export type TransactionStatus = "idle" | "submitting" | "confirming" | "success" | "error";

interface TransactionLoadingModalProps {
  open: boolean;
  status: TransactionStatus;
  title: string;
  description?: string;
  txHash?: string | null;
  error?: string | null;
  onClose: () => void;
}

const statusConfig: Record<TransactionStatus, { icon: React.ReactNode; color: string; bg: string }> = {
  idle: { icon: null, color: "", bg: "" },
  submitting: {
    icon: <Loader2 size={32} className="text-primary animate-spin" />,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  confirming: {
    icon: <Loader2 size={32} className="text-blue-500 animate-spin" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  success: {
    icon: <CheckCircle size={32} className="text-green-500" />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  error: {
    icon: <XCircle size={32} className="text-red-500" />,
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

const statusMessages: Record<string, { submitting: string; confirming: string; success: string }> = {
  swap: {
    submitting: "Submitting swap transaction via gasless relay...",
    confirming: "Waiting for on-chain confirmation...",
    success: "Swap completed successfully!",
  },
  approve: {
    submitting: "Submitting token approval via gasless relay...",
    confirming: "Waiting for approval confirmation...",
    success: "Token approved successfully!",
  },
  faucet: {
    submitting: "Claiming faucet tokens via gasless relay...",
    confirming: "Waiting for tokens to be credited...",
    success: "Faucet tokens claimed!",
  },
  deposit: {
    submitting: "Depositing funds to contract via gasless relay...",
    confirming: "Waiting for deposit confirmation...",
    success: "Funds deposited successfully!",
  },
  subscribe: {
    submitting: "Creating subscription via gasless relay...",
    confirming: "Waiting for subscription to be activated...",
    success: "Subscription activated!",
  },
  pause: {
    submitting: "Pausing subscription via gasless relay...",
    confirming: "Waiting for confirmation...",
    success: "Subscription paused!",
  },
  resume: {
    submitting: "Resuming subscription via gasless relay...",
    confirming: "Waiting for confirmation...",
    success: "Subscription resumed!",
  },
  stream: {
    submitting: "Creating salary stream via gasless relay...",
    confirming: "Waiting for stream to be created...",
    success: "Salary stream created!",
  },
  disburse: {
    submitting: "Disbursing funds via gasless relay...",
    confirming: "Waiting for disbursement confirmation...",
    success: "Funds disbursed!",
  },
  default: {
    submitting: "Submitting transaction via gasless relay...",
    confirming: "Waiting for on-chain confirmation...",
    success: "Transaction completed!",
  },
};

export function getTransactionMessages(type: string) {
  return statusMessages[type] || statusMessages.default;
}

export default function TransactionLoadingModal({
  open,
  status,
  title,
  description,
  txHash,
  error,
  onClose,
}: TransactionLoadingModalProps) {
  if (!open || status === "idle") return null;

  const config = statusConfig[status];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm animate-scaleIn text-center">
        <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center mx-auto mb-5`}>
          {config.icon}
        </div>

        <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{description}</p>
        )}

        {status === "submitting" && (
          <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Sending to ZeroDev relay...
          </div>
        )}

        {status === "confirming" && (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Transaction mined, confirming...
          </div>
        )}

        {txHash && (status === "success" || status === "confirming") && (
          <a
            href={`https://sepolia.arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-3 inline-block"
          >
            View on Arbiscan ↗
          </a>
        )}

        {status === "error" && error && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl">
            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
          </div>
        )}

        {(status === "success" || status === "error") && (
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl transition-colors"
          >
            {status === "success" ? "Done" : "Dismiss"}
          </button>
        )}
      </div>
    </div>
  );
}
