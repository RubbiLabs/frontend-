"use client";
import React, { useEffect, useState } from "react";
import { Droplets, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";

const CLAIM_LIMIT = 3;
const FAUCET_CLAIMS_KEY = "rubbi_faucet_claims";

const mockActivity = [
  { id: "1", label: "Faucet Claim", sub: "TODAY, 08:45 AM", amount: "+1000.00", positive: true, icon: "faucet" },
  { id: "2", label: "Contract Deposit", sub: "YESTERDAY", amount: "-500.00", positive: false, icon: "deposit" },
  { id: "3", label: "Salary Stream", sub: "2 DAYS AGO", amount: "+1,245.00", positive: true, icon: "stream" },
  { id: "4", label: "Subscription Fee", sub: "3 DAYS AGO", amount: "-15.99", positive: false, icon: "subscription" },
];

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === "faucet") return (
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
      <Droplets size={16} className="text-primary" />
    </div>
  );
  if (type === "deposit") return (
    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
      <ArrowDownRight size={16} className="text-neutral-500" />
    </div>
  );
  if (type === "stream") return (
    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
      <ArrowUpRight size={16} className="text-green-600" />
    </div>
  );
  return (
    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
      <RefreshCw size={16} className="text-amber-600" />
    </div>
  );
};

export default function WalletPage() {
  const { rubBalance, setRubBalance, address } = useWallet();
  const { success, error, info } = useToast();
  const [claimCount, setClaimCount] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [activity, setActivity] = useState(mockActivity);

  const balance = Number(rubBalance || 12450);
  const usdValue = (balance * 0.02).toFixed(2); // RUB at $0.02
  const claimsRemaining = Math.max(0, CLAIM_LIMIT - claimCount);

  useEffect(() => {
    if (typeof window === "undefined" || !address) {
      setClaimCount(0);
      return;
    }

    try {
      const stored = localStorage.getItem(FAUCET_CLAIMS_KEY);
      const parsed = stored ? (JSON.parse(stored) as Record<string, number>) : {};
      setClaimCount(parsed[address] ?? 0);
    } catch {
      setClaimCount(0);
    }
  }, [address]);
  // Get RUBBI token balance
  const { data: rubbiBalanceData, refetch: refetchRubbiBalance } = useReadContract({
    address: rubbiTokenAddress,
    abi: RubbiTokenABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && chainId === MONAD_TESTNET_CHAIN_ID }
  });

  // Get ModalContract balance (internal RUBBI balance)
  const { data: modalBalanceData, refetch: refetchModalBalance } = useReadContract({
    address: modalContractAddress,
    abi: ModalABI.abi,
    functionName: "getBalances",
    args: address ? [address] : undefined,
    query: { enabled: !!address && chainId === MONAD_TESTNET_CHAIN_ID }
  });

  // Get faucet claim time
  const { data: lastClaimData } = useReadContract({
    address: rubbiTokenAddress,
    abi: RubbiTokenABI.abi,
    functionName: "lastFaucetClaim",
    args: address ? [address] : undefined,
    query: { enabled: !!address && chainId === MONAD_TESTNET_CHAIN_ID }
  });

  // Get faucet claim count
  const { data: claimCountData } = useReadContract({
    address: rubbiTokenAddress,
    abi: RubbiTokenABI.abi,
    functionName: "faucetClaimCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address && chainId === MONAD_TESTNET_CHAIN_ID }
  });

  // Write: Claim faucet
  const { writeContract: claimFaucet } = useWriteContract();
  const { isPending: isClaiming } = useWaitForTransactionReceipt({ 
    query: { enabled: false } 
  });

  // Write: Deposit to ModalContract  
  const { writeContract: deposit } = useWriteContract();
  const { isPending: isDepositing } = useWaitForTransactionReceipt({ 
    query: { enabled: false } 
  });

  const formatBalance = (bal: string | bigint | undefined, decimals: number = 18) => {
    if (!bal) return "0";
    return (Number(bal) / Math.pow(10, decimals)).toFixed(2);
  };

  const rubbiBalance = rubbiBalanceData ? formatBalance(rubbiBalanceData as bigint) : "0";
  const modalBalance = modalBalanceData ? formatBalance(modalBalanceData as bigint) : "0";
  const contractBalance = (Number(rubbiBalance) + Number(modalBalance)).toFixed(2);
  
  // Use contract balance if available, fallback to localStorage
  const displayBalance = contractBalance && Number(contractBalance) > 0 ? contractBalance : (rubBalance || "0");
  
  // Check if user can claim (24h cooldown)
  const lastClaim = lastClaimData ? (lastClaimData as bigint).toString() : "0";
  const canClaim = lastClaim === "0" || (Date.now() / 1000 - Number(lastClaim)) >= 86400;

  const handleClaim = async () => {
    if (!address) { error("Wallet Required", "Connect your wallet to claim RUB."); return; }
    if (claimsRemaining <= 0) { error("No Claims Remaining", "This wallet has already used all 3 lifetime faucet claims."); return; }
    setClaimLoading(true);
    info("Claiming Faucet...", "Broadcasting transaction to Monad testnet.");
    await new Promise(r => setTimeout(r, 1800));
    const newBal = balance + 100;
    const nextClaimCount = claimCount + 1;
    setRubBalance(String(newBal));
    setClaimCount(nextClaimCount);
    try {
      const stored = localStorage.getItem(FAUCET_CLAIMS_KEY);
      const parsed = stored ? (JSON.parse(stored) as Record<string, number>) : {};
      parsed[address] = nextClaimCount;
      localStorage.setItem(FAUCET_CLAIMS_KEY, JSON.stringify(parsed));
    } catch {}
    setActivity(prev => [{ id: Date.now().toString(), label: "Faucet Claim", sub: "JUST NOW", amount: "+100.00", positive: true, icon: "faucet" }, ...prev]);
    success("100 RUB Claimed!", `${Math.max(0, CLAIM_LIMIT - nextClaimCount)} lifetime claim${Math.max(0, CLAIM_LIMIT - nextClaimCount) !== 1 ? "s" : ""} remaining for this wallet.`);
    setClaimLoading(false);
  };

  // Handle deposit: first approve token, then deposit
  const handleDeposit = async () => {
    if (!isConnected) {
      toast("error", "Not Connected", "Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      toast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast("error", "Invalid Amount", "Enter a valid deposit amount");
      return;
    }

    const amountWei = BigInt(Math.floor(Number(depositAmount) * 1e18));
    setDepositLoading(true);

    try {
      await deposit({
        address: modalContractAddress,
        abi: ModalABI.abi,
        functionName: "deposit",
        args: [amountWei],
      });
      toast("success", "Transaction Submitted", `Depositing ${depositAmount} RUBBI`);
      setDepositAmount("");
      setDepositModal(false);
    } catch (err: any) {
      toast("error", "Deposit Failed", err.message);
      setDepositLoading(false);
    }
  };

  const balance = Number(displayBalance);
  const usdValue = (balance / 50).toFixed(2); // 50 RUBBI = $1 USD

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Wallet</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your RUBBI balance and claim faucet rewards.</p>
      </div>

      {!isCorrectNetwork && isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-800">Wrong Network</p>
              <p className="text-sm text-yellow-600">Please switch to Monad Testnet</p>
            </div>
          </div>
          <Button size="sm" onClick={switchToMonad}>Switch to Monad</Button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
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

            {/* <div className="flex flex-wrap gap-3 mt-6">
              <Button size="md" icon={<Plus size={15} />} onClick={() => setDepositModal(true)}>Deposit</Button>
              <Button size="md" variant="outlined" icon={<Minus size={15} />}>Withdraw</Button>
            </div> */}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-100 mt-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-5">Recent Ledger Activity</h3>
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
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Rubbi Faucet</h3>
              </div>
              <Droplets size={24} className="text-primary/30" />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              Claim RUB to test the network. Each wallet can only receive this 100 RUB faucet a total of 3 times forever.
            </p>

            <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Claims Remaining</span>
              <span className="font-extrabold text-primary text-sm">1 / Day</span>
            </div>

            <Button
              size="md"
              fullWidth
              loading={claimLoading || isClaiming}
              disabled={!isConnected || !isCorrectNetwork || !canClaim}
              icon={<Droplets size={15} />}
              onClick={handleClaim}
            >
              {canClaim ? "Claim 1000 RUBBI" : "Cooldown Active"}
            </Button>
            <p className="text-center text-xs text-neutral-400 mt-3">Claim limit: 3 lifetime claims per wallet</p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Protocol Status</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The faucet distribution is wallet-scoped. Once a wallet has claimed 3 times, it cannot claim again.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs font-semibold text-neutral-600">All systems operational</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-100">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Connected Wallet</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">👤</span>
              </div>
              <p className="font-mono text-xs text-neutral-600 break-all">
                {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "Not connected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDepositModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-neutral-900 mb-5">Deposit RUBBI</h2>
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
              <p className="text-xs text-neutral-400">Deposit RUBBI tokens to ModalContract for subscription payments.</p>
              <div className="flex gap-3">
                <Button variant="ghost" size="md" fullWidth onClick={() => setDepositModal(false)}>Cancel</Button>
                <Button size="md" fullWidth loading={depositLoading || isDepositing} onClick={handleDeposit}>Deposit</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}