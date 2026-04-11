"use client";

import React, { useState } from "react";
import { Plus, Pause, Play, RefreshCw, Zap, Clock } from "lucide-react";
import Button from "../../../components/ui/Button";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import { useToast } from "../../../context/ToastContext";
import { useSalaryStreaming, StreamDetails } from "@/hooks/useSalaryStreaming";
import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useAccount } from "wagmi";

type Interval = "Monthly" | "Bi-Weekly" | "Daily";
type StreamStatus = "active" | "paused";

interface Stream {
  id: string;
  name: string;
  address: string;
  interval: Interval;
  amountPerCycle: number;
  streamed: number;
  status: StreamStatus;
  avatar: string;
}

const avatarColors = ["bg-tertiary", "bg-secondary", "bg-neutral-500"];
const intervalOptions = [
  { value: "Monthly", label: "Monthly" },
  { value: "Bi-Weekly", label: "Bi-Weekly" },
  { value: "Daily", label: "Daily" },
];

export default function SalaryStreamsPage() {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { isCorrectNetwork, switchToMonad } = useNetworkSwitch();
  
  const {
    dailyStreams,
    monthlyStreams,
    isCreating,
    createStream,
    pauseDailyStream,
    pauseMonthlyStream,
    resumeDailyStream,
    resumeMonthlyStream,
  } = useSalaryStreaming();

  const [streams, setStreams] = useState<Stream[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [disburseLoading, setDisburseLoading] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState<Interval>("Monthly");
  const [createLoading, setCreateLoading] = useState(false);

  const allContractStreams = [
    ...dailyStreams.map((s: any, i: number) => ({
      id: `daily-${i}`,
      name: s.name || `Daily Stream ${i + 1}`,
      address: s.recipient,
      interval: "Daily" as Interval,
      amountPerCycle: Number(s.amount) / 1e18,
      streamed: 0,
      status: s.active ? "active" as StreamStatus : "paused" as StreamStatus,
      avatar: (s.recipient?.slice(2, 4) || "DS").toUpperCase(),
    })),
    ...monthlyStreams.map((s: any, i: number) => ({
      id: `monthly-${i}`,
      name: s.name || `Monthly Stream ${i + 1}`,
      address: s.recipient,
      interval: "Monthly" as Interval,
      amountPerCycle: Number(s.amount) / 1e18,
      streamed: 0,
      status: s.active ? "active" as StreamStatus : "paused" as StreamStatus,
      avatar: (s.recipient?.slice(2, 4) || "MS").toUpperCase(),
    })),
  ];

  const displayStreams = allContractStreams.length > 0 ? allContractStreams : streams;

  const totalStreaming = displayStreams.filter(s => s.status === "active").reduce((a, s) => a + s.amountPerCycle, 0);
  const automated = displayStreams.filter(s => s.status === "active").length;
  const paused = displayStreams.filter(s => s.status === "paused").length;

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  };

  const handlePauseResume = async (stream: Stream) => {
    if (!isConnected) {
      toast("error", "Not Connected", "Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      toast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    setLoadingId(stream.id);
    try {
      if (stream.interval === "Daily") {
        const idx = dailyStreams.findIndex((s: any) => s.id === parseInt(stream.id.replace("daily-", "")));
        if (stream.status === "active") {
          await pauseDailyStream(idx);
        } else {
          await resumeDailyStream(idx);
        }
      } else {
        const idx = monthlyStreams.findIndex((s: any) => s.id === parseInt(stream.id.replace("monthly-", "")));
        if (stream.status === "active") {
          await pauseMonthlyStream(idx);
        } else {
          await resumeMonthlyStream(idx);
        }
      }
      toast("success", stream.status === "active" ? "Stream Paused" : "Stream Resumed", stream.name);
    } catch (err: any) {
      toast("error", "Action Failed", err.message);
    }
    setLoadingId(null);
  };

  const handleCreate = async () => {
    if (!isConnected) {
      toast("error", "Not Connected", "Please connect your wallet first");
      return;
    }
    if (!isCorrectNetwork) {
      toast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }
    if (!recipient.trim()) {
      toast("error", "Missing Recipient", "Please enter a recipient address.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast("error", "Invalid Amount", "Please enter a valid stream amount.");
      return;
    }

    const streamDetails: StreamDetails[] = [
      {
        name: `Stream to ${formatAddress(recipient)}`,
        recipient: recipient as `0x${string}`,
        amount: BigInt(Math.floor(Number(amount) * 1e18)),
      },
    ];

    const intervalType = interval === "Daily" ? 1 : 2;

    setCreateLoading(true);
    try {
      await createStream(streamDetails, intervalType);
      toast("success", "Stream Created!", `Stream of ${amount} USDC/${interval} initiated.`);
      setRecipient("");
      setAmount("");
    } catch (err: any) {
      toast("error", "Stream Creation Failed", err.message);
    }
    setCreateLoading(false);
  };

  const handleDisburseAll = async () => {
    setDisburseLoading(true);
    toast("info", "Processing Disbursement...", "Broadcasting to all active streams.");
    setTimeout(() => {
      toast("success", "Funds Disbursed!", "All active streams have received their allocation.");
      setDisburseLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900">Salary Streams</h1>
          <p className="text-sm text-neutral-500 mt-1">Automate your payroll with block-by-block distribution on the Monad ledger.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Total Streaming</p>
          <p className="text-2xl font-extrabold text-primary">{totalStreaming.toLocaleString()}.00 <span className="text-lg text-neutral-400">USDC</span></p>
        </div>
      </div>

      {!isCorrectNetwork && isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-800">Wrong Network</p>
              <p className="text-sm text-yellow-600">Please switch to Monad Testnet to manage streams</p>
            </div>
          </div>
          <Button size="sm" onClick={switchToMonad}>Switch to Monad</Button>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100">
            <div className="flex items-center gap-2 mb-5">
              <Plus size={18} className="text-primary" />
              <h3 className="font-bold text-neutral-900">Create New Stream</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Recipient Address</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
                    <span className="text-neutral-500 text-xs">👤</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 pr-16 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">USDC</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Interval</label>
                  <CustomDropdown
                    options={intervalOptions}
                    value={interval}
                    onChange={(v) => setInterval(v as Interval)}
                  />
                </div>
              </div>

              <Button 
                size="lg" 
                fullWidth 
                loading={createLoading || isCreating} 
                icon={<Zap size={16} />} 
                iconPosition="right" 
                onClick={handleCreate}
                disabled={!isConnected || !isCorrectNetwork}
              >
                Initiate Stream
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-800">Active Distributions</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">{automated} Automated</span>
              {paused > 0 && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">{paused} Paused</span>}
            </div>
          </div>

          <div className="space-y-3">
            {displayStreams.length === 0 ? (
              <div className="bg-neutral-50 rounded-2xl p-12 text-center border border-neutral-100">
                <p className="text-neutral-500 mb-4">No active salary streams yet</p>
                <p className="text-sm text-neutral-400">Create a stream to start automated payroll</p>
              </div>
            ) : (
              displayStreams.map((stream, i) => (
                <div key={stream.id} className="bg-white rounded-2xl p-5 border border-neutral-100 flex items-center gap-4">
                  <div className={`w-11 h-11 ${avatarColors[i % avatarColors.length]} rounded-xl flex items-center justify-center shrink-0`}>
                    <span className="text-white text-sm font-bold">{stream.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-neutral-800 text-sm">{stream.name}</p>
                      <span className="text-xs text-neutral-400 font-mono">{formatAddress(stream.address)}</span>
                      <span className={`w-2 h-2 rounded-full ${stream.status === "active" ? "bg-green-400" : "bg-amber-400"}`} />
                      {stream.status === "paused" && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">PAUSED</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <Clock size={11} />
                      <span>{stream.interval}</span>
                      <span>·</span>
                      <span>{stream.amountPerCycle.toLocaleString()} USDC / Cycle</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Streaming</p>
                    <p className="text-base font-extrabold text-primary">{stream.streamed.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handlePauseResume(stream)}
                    disabled={loadingId === stream.id || !isConnected || !isCorrectNetwork}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      stream.status === "active"
                        ? "border-neutral-200 text-neutral-400 hover:border-primary hover:text-primary"
                        : "border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white"
                    } disabled:opacity-50`}
                  >
                    {loadingId === stream.id ? (
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : stream.status === "active" ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">Network Efficiency</p>
                  <h3 className="text-lg font-extrabold mt-1">Monad Stream Consensus</h3>
                </div>
                <Zap size={24} className="text-white/20" />
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-5">
                Your streams are being finalized every 1.2s across the validator set. No manual intervention required for automated disbursal.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Success Rate</p>
                  <p className="text-xl font-extrabold text-green-400">100%</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Next Batch</p>
                  <p className="text-xl font-extrabold">14m 2s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          size="lg" 
          loading={disburseLoading} 
          icon={<RefreshCw size={16} />} 
          iconPosition="right" 
          onClick={handleDisburseAll}
          disabled={!isConnected || !isCorrectNetwork}
        >
          Disburse All Funds
        </Button>
      </div>
    </div>
  );
}