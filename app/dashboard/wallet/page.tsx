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
import { useContractWrite } from "@/hooks/useContractWrite";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useAccount, useReadContract } from "wagmi";
import RubbiTokenABI from "@/Abis/RubbiToken.json";
import ERC20ABI from "@/Abis/ERC20.json";
import { api } from "@/lib/api";
import { trackTransaction } from "@/components/dashboard/DuneAnalytics";

const RUB_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RUBBI_TOKEN_ADDRESS as `0x${string}`;
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

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
  const { execute, isWriting } = useContractWrite();
  const { isReady: isZeroDevReady, isLoading: isZeroDevLoading, error: zeroDevError, smartAccountAddress } = useZeroDev();

  const [claimLoading, setClaimLoading] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);

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

    setActivity((prev) => [
      {
        id: Date.now().toString(),
        label: "Deposited to Contract",
        sub: "JUST NOW",
        amount: `-${amount.toFixed(2)}`,
        positive: false,
        icon: "deposit",
      },
      ...prev,
    ]);

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

      {/* ZeroDev Status Banner */}
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

      {activity.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-neutral-900 mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {activity.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ActivityIcon type={item.icon} />
                  <div>
                    <p className="font-semibold text-neutral-900">{item.label}</p>
                    <p className="text-xs text-neutral-400">{item.sub}</p>
                  </div>
                </div>
                <p className={`font-bold ${item.positive ? "text-green-600" : "text-neutral-900"}`}>
                  {item.amount} RUB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
