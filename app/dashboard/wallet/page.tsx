"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Droplets,
  RefreshCw,
  ArrowLeftRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useModalContract } from "@/hooks/useContracts";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import RubbiTokenABI from "@/Abis/RubbiToken.json";

const RUB_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RUBBI_TOKEN_ADDRESS as `0x${string}`;

function ActivityIcon({ type }: { type: string }) {
  if (type === "faucet") {
    return (
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
        <Droplets size={16} className="text-primary" />
      </div>
    );
  }

  if (type === "deposit") {
    return (
      <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
        <ArrowDownRight size={16} className="text-neutral-500" />
      </div>
    );
  }

  if (type === "stream") {
    return (
      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
        <ArrowUpRight size={16} className="text-green-600" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
      <RefreshCw size={16} className="text-amber-600" />
    </div>
  );
}

export default function WalletPage() {
  const { rubBalance, setRubBalance, address } = useWallet();
  const { success, error, info } = useToast();
  const { isCorrectNetwork, isConnected, switchToArbitrum } = useNetworkSwitch();
  const { balance: modalBalance, depositFunds, refetchBalance } = useModalContract();
  const { isConnected: wagmiConnected } = useAccount();

  const [claimLoading, setClaimLoading] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);

  // Faucet claim: call RubbiToken.claimFaucet()
  const { writeContract: writeClaimFaucet, data: claimTxHash, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimTxHash });

  // Read faucet claim count from contract
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
  const usdValue = (balance / 50).toFixed(2);

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
      error("No Claims Remaining", "This wallet has already used all 3 lifetime faucet claims.");
      return;
    }

    setClaimLoading(true);
    info("Claiming Faucet...", "Broadcasting transaction to Arbitrum Sepolia.");

    try {
      writeClaimFaucet({
        address: RUB_TOKEN_ADDRESS,
        abi: RubbiTokenABI.abi,
        functionName: "claimFaucet",
      });
    } catch (err: any) {
      error("Claim Failed", err.message);
      setClaimLoading(false);
    }
  };

  // After claim succeeds, update activity and balance
  useEffect(() => {
    if (claimSuccess) {
      const newCount = claimCount + 1;
      const newBalance = balance + CLAIM_AMOUNT;
      setRubBalance(String(newBalance));

      setActivity((prev) => [
        {
          id: Date.now().toString(),
          label: "Faucet Claim",
          sub: "JUST NOW",
          amount: `+${CLAIM_AMOUNT}.00`,
          positive: true,
          icon: "faucet",
        },
        ...prev,
      ]);

      success(
        `${CLAIM_AMOUNT} RUBBI Claimed!`,
        `${Math.max(0, CLAIM_LIMIT - newCount)} lifetime claim${Math.max(0, CLAIM_LIMIT - newCount) === 1 ? "" : "s"} remaining.`
      );
      setClaimLoading(false);
    }
  }, [claimSuccess]);

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
      error("Invalid Amount", "Enter a valid deposit amount.");
      return;
    }

    setDepositLoading(true);
    info("Depositing RUBBI...", "Approving and depositing to ModalContract.");

    try {
      const amountBigInt = BigInt(Math.floor(amount * 1e18));
      await depositFunds(amountBigInt);

      setActivity((prev) => [
        {
          id: Date.now().toString(),
          label: "Contract Deposit",
          sub: "JUST NOW",
          amount: `-${amount.toFixed(2)}`,
          positive: false,
          icon: "deposit",
        },
        ...prev,
      ]);

      setDepositAmount("");
      setDepositModal(false);
      success("Deposit Submitted", `${amount.toFixed(2)} RUBBI deposited to ModalContract.`);
    } catch (err: any) {
      error("Deposit Failed", err.message);
    }
    setDepositLoading(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Wallet</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your RUBBI balance, claim faucet rewards, and deposit to ModalContract.</p>
      </div>

      {!isCorrectNetwork && isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">!</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-800">Wrong Network</p>
              <p className="text-sm text-yellow-600">Please switch to Arbitrum Sepolia.</p>
            </div>
          </div>
          <Button size="sm" onClick={switchToArbitrum}>Switch to Arbitrum</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-7 border border-neutral-100">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/8 px-3 py-1.5 rounded-full mb-5">
              RUBBI Balance
            </div>
            <p className="text-5xl font-extrabold text-neutral-900">
              {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-2xl font-bold text-neutral-400 ml-2">RUBBI</span>
            </p>
            <p className="text-neutral-400 mt-2">≈ ${usdValue} USD (at 50 RUBBI = $1)</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button size="md" onClick={() => setDepositModal(true)}>Deposit to Contract</Button>
              <Button size="md" variant="outlined" onClick={() => window.location.href = "/dashboard/card"}>
                <ArrowLeftRight size={14} className="mr-1" /> Swap Tokens
              </Button>
            </div>
          </div>

          {/* ModalContract Balance */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">ModalContract Balance</h3>
              <span className="text-xs text-neutral-400">For subscriptions & streams</span>
            </div>
            <p className="text-2xl font-extrabold text-primary">
              {modalBalance ? (Number(modalBalance) / 1e18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              <span className="text-lg font-bold text-neutral-400 ml-2">RUBBI</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">Deposited funds available for automated payments</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-100 mt-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-5">Recent Ledger Activity</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <ActivityIcon type={item.icon} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-800">{item.label}</p>
                      <p className="text-xs text-neutral-400 font-medium tracking-wider">{item.sub}</p>
                    </div>
                    <p className={`text-sm font-extrabold ${item.positive ? "text-green-600" : "text-red-500"}`}>
                      {item.amount}
                      <span className="text-xs font-bold text-neutral-400 ml-1">RUBBI</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 text-base">Rubbi Faucet</h3>
              <Droplets size={24} className="text-primary/30" />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              Claim 100 RUBBI per claim to test the platform. Each wallet can claim up to 3 times lifetime.
            </p>

            <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Claims Remaining</span>
              <span className="font-extrabold text-primary text-sm">{claimsRemaining} / {CLAIM_LIMIT}</span>
            </div>

            <Button
              size="md"
              fullWidth
              loading={claimLoading || isClaimPending || isClaimConfirming}
              disabled={!isConnected || !isCorrectNetwork || claimsRemaining <= 0}
              icon={<Droplets size={15} />}
              onClick={handleClaim}
            >
              {claimsRemaining > 0 ? `Claim ${CLAIM_AMOUNT} RUBBI` : "Limit Reached"}
            </Button>
            <p className="text-center text-xs text-neutral-400 mt-3">On-chain faucet • 3 lifetime claims per wallet</p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Protocol Status</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Faucet distribution is on-chain via RubbiToken.claimFaucet(). Deposits go to ModalContract for subscription/stream payments.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs font-semibold text-neutral-600">Arbitrum Sepolia ready</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Connected Wallet</p>
            <p className="font-mono text-xs text-neutral-600 break-all">
              {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "Not connected"}
            </p>
          </div>
        </div>
      </div>

      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDepositModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Deposit RUBBI</h2>
            <p className="text-xs text-neutral-400 mb-5">Deposit RUB tokens into ModalContract for subscriptions and salary streams.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 pr-14 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">RUBBI</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400">
                Your wallet balance: {balance.toFixed(2)} RUBBI. 
                This calls ModalContract.deposit() on-chain to transfer tokens.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="md" fullWidth onClick={() => setDepositModal(false)}>Cancel</Button>
                <Button size="md" fullWidth loading={depositLoading} onClick={handleDeposit}>Deposit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
