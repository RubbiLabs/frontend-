"use client";
import React, { useState } from "react";
import { Plus, Pause, Play, RefreshCw, Zap, Clock, CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import { useToast } from "../../../context/ToastContext";

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

const mockStreams: Stream[] = [
  { id: "1", name: "Alex Rivera", address: "0x4a...e89", interval: "Monthly", amountPerCycle: 4500, streamed: 1245.42, status: "active", avatar: "AR" },
  { id: "2", name: "Jordan Dax", address: "0x91...2c4", interval: "Bi-Weekly", amountPerCycle: 2800, streamed: 840.15, status: "active", avatar: "JD" },
  { id: "3", name: "Casey Chen", address: "0xf3...8b1", interval: "Monthly", amountPerCycle: 5000, streamed: 0, status: "paused", avatar: "CC" },
];

const avatarColors = ["bg-tertiary", "bg-secondary", "bg-neutral-500"];
const intervalOptions = [
  { value: "Monthly", label: "Monthly" },
  { value: "Bi-Weekly", label: "Bi-Weekly" },
  { value: "Daily", label: "Daily" },
];

export default function SalaryStreamsPage() {
  const { success, error, info } = useToast();
  const [streams, setStreams] = useState<Stream[]>(mockStreams);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [disburseLoading, setDisburseLoading] = useState(false);

  // Create form
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState<Interval>("Monthly");
  const [createLoading, setCreateLoading] = useState(false);

  const totalStreaming = streams.filter(s => s.status === "active").reduce((a, s) => a + s.amountPerCycle, 0);
  const automated = streams.filter(s => s.status === "active").length;
  const paused = streams.filter(s => s.status === "paused").length;

  const handlePauseResume = async (stream: Stream) => {
    setLoadingId(stream.id);
    await new Promise(r => setTimeout(r, 800));
    setStreams(prev => prev.map(s => s.id === stream.id ? { ...s, status: s.status === "active" ? "paused" : "active" } : s));
    success(stream.status === "active" ? "Stream Paused" : "Stream Resumed", stream.name);
    setLoadingId(null);
  };

  const handleCreate = async () => {
    if (!recipient.trim()) { error("Missing Recipient", "Please enter a recipient address or ENS name."); return; }
    if (!amount || Number(amount) <= 0) { error("Invalid Amount", "Please enter a valid stream amount."); return; }
    setCreateLoading(true);
    info("Creating Stream...", "Submitting to Monad ledger.");
    await new Promise(r => setTimeout(r, 1500));
    const short = recipient.length > 10 ? `${recipient.slice(0, 4)}...${recipient.slice(-3)}` : recipient;
    const newStream: Stream = {
      id: Date.now().toString(), name: `Recipient ${streams.length + 1}`, address: short,
      interval, amountPerCycle: Number(amount), streamed: 0, status: "active",
      avatar: recipient.slice(0, 2).toUpperCase(),
    };
    setStreams(prev => [...prev, newStream]);
    success("Stream Created!", `Stream of ${amount} RUB/${interval} initiated.`);
    setRecipient(""); setAmount("");
    setCreateLoading(false);
  };

  const handleDisburseAll = async () => {
    setDisburseLoading(true);
    info("Processing Disbursement...", "Broadcasting to all active streams.");
    await new Promise(r => setTimeout(r, 2000));
    setStreams(prev => prev.map(s => s.status === "active" ? { ...s, streamed: s.streamed + s.amountPerCycle * 0.1 } : s));
    success("Funds Disbursed!", "All active streams have received their allocation.");
    setDisburseLoading(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Create Stream Form */}
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
                    placeholder="0x... or ENS"
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

              <Button size="lg" fullWidth loading={createLoading} icon={<Zap size={16} />} iconPosition="right" onClick={handleCreate}>
                Initiate Stream
              </Button>
            </div>
          </div>
        </div>

        {/* Active Distributions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-800">Active Distributions</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">{automated} Automated</span>
              {paused > 0 && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">{paused} Paused</span>}
            </div>
          </div>

          <div className="space-y-3">
            {streams.map((stream, i) => (
              <div key={stream.id} className="bg-white rounded-2xl p-5 border border-neutral-100 flex items-center gap-4">
                <div className={`w-11 h-11 ${avatarColors[i % avatarColors.length]} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="text-white text-sm font-bold">{stream.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-neutral-800 text-sm">{stream.name}</p>
                    <span className="text-xs text-neutral-400 font-mono">{stream.address}</span>
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
                  disabled={loadingId === stream.id}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    stream.status === "active"
                      ? "border-neutral-200 text-neutral-400 hover:border-primary hover:text-primary"
                      : "border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white"
                  }`}
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
            ))}
          </div>

          {/* Monad Stream Consensus */}
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

      {/* Disburse All */}
      <div className="flex justify-end">
        <Button size="lg" loading={disburseLoading} icon={<RefreshCw size={16} />} iconPosition="right" onClick={handleDisburseAll}>
          Disburse All Funds
        </Button>
      </div>
    </div>
  );
}
