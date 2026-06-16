"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Droplets,
  RefreshCw,
  ArrowLeftRight,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useModalContract } from "@/hooks/useContracts";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useAccount, useReadContract } from "wagmi";
import RubbiTokenABI from "@/Abis/RubbiToken.json";
import ERC20ABI from "@/Abis/ERC20.json";
import { trackTransaction } from "@/components/dashboard/DuneAnalytics";

const RUB_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RUBBI_TOKEN_ADDRESS as `0x${string}`;
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

interface WalletActivity {
  id: string;
  type: "faucet" | "deposit" | "withdraw" | "swap" | "subscription" | "stream";
  label: string;
  amount: string;
  positive: boolean;
  timestamp: Date;
  txHash?: string;
  details: string;
  status: "completed" | "pending" | "failed";
}

function ActivityTypeIcon({ type }: { type: string }) {
  const iconClass = "w-4 h-4";
  if (type === "faucet")
    return <Droplets className={iconClass} />;
  if (type === "deposit")
    return <ArrowDownRight className={iconClass} />;
  if (type === "withdraw")
    return <ArrowUpRight className={iconClass} />;
  if (type === "swap")
    return <ArrowLeftRight className={iconClass} />;
  if (type === "stream")
    return <RefreshCw className={iconClass} />;
  return <FileText className={iconClass} />;
}

function activityTypeColor(type: string) {
  if (type === "faucet") return "bg-primary/10 text-primary";
  if (type === "deposit") return "bg-blue-100 text-blue-600";
  if (type === "withdraw") return "bg-orange-100 text-orange-600";
  if (type === "swap") return "bg-green-100 text-green-600";
  if (type === "stream") return "bg-purple-100 text-purple-600";
  return "bg-neutral-100 text-neutral-500";
}

function statusBadge(status: string) {
  if (status === "completed") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function WalletPage() {
  const { rubBalance, setRubBalance, address } = useWallet();
  const { success, error, info } = useToast();
  const { isCorrectNetwork, isConnected, switchToArbitrum } = useNetworkSwitch();
  const { balance: modalBalance, depositFunds, refetchBalance } = useModalContract();
  const { isConnected: wagmiConnected } = useAccount();
  const { execute, isWriting } = useContractWrite();
  const { isReady: isZeroDevReady, isLoading: isZeroDevLoading, error: zeroDevError, smartAccountAddress } = useZeroDev();

  const [claimLoading, setClaimLoading] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [activities, setActivities] = useState<WalletActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<WalletActivity | null>(null);

  const { data: onChainRubBalance, refetch: refetchRubBalance } = useReadContract({
    address: RUB_TOKEN_ADDRESS,
    abi: ERC20ABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!RUB_TOKEN_ADDRESS && wagmiConnected },
  });

  useEffect(() => {
    if (onChainRubBalance !== undefined) {
      const onChainBal = (Number(onChainRubBalance) / 1e18).toFixed(2);
      if (Number(onChainBal) > 0) {
        setRubBalance(onChainBal);
      }
    }
  }, [onChainRubBalance, setRubBalance]);

  const { data: faucetClaimCount } = useReadContract({
    address: RUB_TOKEN_ADDRESS,
    abi: RubbiTokenABI.abi,
    functionName: "faucetClaimCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!RUB_TOKEN_ADDRESS },
  });

  const CLAIM_LIMIT = 3;
  const CLAIM_AMOUNT = 100;
  const claimCount = faucetClaimCount ? Number(faucetClaimCount) : 0;
  const claimsRemaining = Math.max(0, CLAIM_LIMIT - claimCount);
  const balance = Number(rubBalance || 0);

  const addActivity = (activity: Omit<WalletActivity, "id" | "timestamp">) => {
    setActivities((prev) => [
      { ...activity, id: Date.now().toString(), timestamp: new Date() },
      ...prev,
    ]);
  };

  const handleClaim = async () => {
    if (!address) {
      error("Wallet Required", "Connect your wallet to claim RUBBI.");
      return;
    }
    if (!isCorrectNetwork) {
      error("Wrong Network", "Please switch to Arbitrum Sepolia.");
      return;
    }
    if (claimsRemaining <= 0) {
      error("No Claims Remaining", "All 3 lifetime faucet claims used.");
      return;
    }

    setClaimLoading(true);
    info("Claiming Faucet...", "Broadcasting transaction...");

    const txHash = await execute({
      abi: RubbiTokenABI.abi as any,
      address: RUB_TOKEN_ADDRESS,
      functionName: "claimFaucet",
      backendSync: {
        endpoint: "faucet.claim",
        params: {},
      },
      onSuccess: (hash) => {
        const newCount = claimCount + 1;
        const newBalance = balance + CLAIM_AMOUNT;
        setRubBalance(String(newBalance));
        trackTransaction();
        addActivity({
          type: "faucet",
          label: "Faucet Claim",
          amount: `+${CLAIM_AMOUNT}.00`,
          positive: true,
          txHash: hash,
          details: `Claimed ${CLAIM_AMOUNT} RUB from the faucet. ${Math.max(0, CLAIM_LIMIT - newCount)} claims remaining out of ${CLAIM_LIMIT} lifetime limit.`,
          status: "completed",
        });
        success(
          `${CLAIM_AMOUNT} RUBBI Claimed!`,
          `${Math.max(0, CLAIM_LIMIT - newCount)} claims remaining.`
        );
        setTimeout(() => refetchRubBalance(), 2000);
      },
    });

    setClaimLoading(false);
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);

    if (!address) {
      error("Wallet Required", "Connect your wallet before depositing.");
      return;
    }
    if (!isCorrectNetwork) {
      error("Wrong Network", "Please switch to Arbitrum Sepolia.");
      return;
    }
    if (!amount || amount <= 0) {
      error("Invalid Amount", "Enter a valid RUB amount to deposit.");
      return;
    }

    setDepositLoading(true);
    const amountBigInt = BigInt(Math.floor(amount * 1e18));

    await depositFunds(amountBigInt);

    addActivity({
      type: "deposit",
      label: "Deposited to Contract",
      amount: `-${amount.toFixed(2)}`,
      positive: false,
      details: `Deposited ${amount.toFixed(2)} RUB to ModalContract for subscription payments.`,
      status: "completed",
    });

    setDepositModal(false);
    setDepositAmount("");
    setDepositLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Wallet</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your RUB token balance</p>
      </div>

      {isZeroDevLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs text-blue-700">Initializing smart account for gasless transactions...</p>
        </div>
      )}
      {isZeroDevReady && smartAccountAddress && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          <p className="text-xs text-green-700">
            Gasless transactions active. Smart account: {smartAccountAddress.slice(0, 6)}...{smartAccountAddress.slice(-4)}
          </p>
        </div>
      )}
      {zeroDevError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <p className="text-xs text-amber-700">
            ZeroDev unavailable (using standard transactions). Error: {zeroDevError.slice(0, 80)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">RUB Balance</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{balance.toFixed(2)}</p>
          <p className="text-xs text-neutral-400 mt-0.5">≈ ${(balance / 50).toFixed(2)} USD</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">ModalContract</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{Number(modalBalance || 0).toFixed(2)}</p>
          <p className="text-xs text-neutral-400 mt-0.5">Available for subscriptions</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Faucet Claims</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{claimsRemaining}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{CLAIM_AMOUNT} RUB per claim</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleClaim}
          loading={claimLoading || isWriting}
          disabled={claimsRemaining <= 0}
          icon={<Droplets size={16} />}
        >
          {claimsRemaining <= 0 ? "No Claims Remaining" : `Claim ${CLAIM_AMOUNT} RUBBI`}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setDepositModal(true)}
          icon={<ArrowDownRight size={16} />}
        >
          Deposit to Contract
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.dispatchEvent(new CustomEvent("open-swap-modal"))}
          icon={<ArrowLeftRight size={16} />}
        >
          Swap Assets
        </Button>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Activity</h2>
        </div>

        {activities.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-neutral-300" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">No Activity Yet</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              Your wallet activity will appear here. Start by claiming faucet tokens, depositing funds, or swapping assets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-5 py-3">Type</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-5 py-3">Description</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-5 py-3">Amount</th>
                  <th className="text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-5 py-3">Status</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-5 py-3">Time</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-5 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {activities.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-neutral-50 hover:bg-neutral-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedActivity(item)}
                  >
                    <td className="px-5 py-3.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activityTypeColor(item.type)}`}>
                        <ActivityTypeIcon type={item.type} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-bold ${item.positive ? "text-green-600" : "text-neutral-900"}`}>
                        {item.amount} RUB
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-neutral-400">{formatTimeAgo(item.timestamp)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <FileText size={14} className="text-neutral-300 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      <Modal
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title="Activity Details"
        subtitle={selectedActivity?.label}
        size="md"
      >
        {selectedActivity && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activityTypeColor(selectedActivity.type)}`}>
                <ActivityTypeIcon type={selectedActivity.type} />
              </div>
              <div>
                <p className="font-bold text-neutral-900">{selectedActivity.label}</p>
                <p className="text-xs text-neutral-500 capitalize">{selectedActivity.type} transaction</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Amount</span>
                <span className={`text-sm font-bold ${selectedActivity.positive ? "text-green-600" : "text-neutral-900"}`}>
                  {selectedActivity.amount} RUB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Status</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusBadge(selectedActivity.status)}`}>
                  {selectedActivity.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Time</span>
                <span className="text-sm font-bold text-neutral-900">
                  {selectedActivity.timestamp.toLocaleString()}
                </span>
              </div>
              {selectedActivity.txHash && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Transaction</span>
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${selectedActivity.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                  >
                    {selectedActivity.txHash.slice(0, 10)}...{selectedActivity.txHash.slice(-8)}
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
              <p className="text-sm text-neutral-600 leading-relaxed">{selectedActivity.details}</p>
            </div>

            <Button
              size="lg"
              fullWidth
              variant="ghost"
              onClick={() => setSelectedActivity(null)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>

      {depositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scaleIn">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Deposit to Contract</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Transfer RUB tokens to ModalContract for subscription payments.
            </p>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Amount in RUB"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDepositModal(false)}>
                Cancel
              </Button>
              <Button
                fullWidth
                loading={depositLoading}
                onClick={handleDeposit}
              >
                Deposit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
