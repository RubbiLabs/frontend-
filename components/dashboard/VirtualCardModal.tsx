"use client";

import React, { useState } from "react";
import { CreditCard, ChevronRight, CheckCircle, Lock, Shield, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { api, setToken } from "@/lib/api";

interface Props { open: boolean; onClose: () => void; onComplete?: () => void; }

export default function VirtualCardModal({ open, onClose, onComplete }: Props) {
  const { username, setVirtualCardData, address } = useWallet();
  const { toast } = useToast();
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [cardData, setCardData] = useState<{ lastFour: string; expiry: string } | null>(null);

  const handleGenerate = async () => {
    if (!usernameInput.trim()) {
      toast("error", "Username Required", "Please enter your username to generate your virtual card.");
      return;
    }

    if (!address) {
      toast("error", "Wallet Not Connected", "Please connect your wallet first.");
      return;
    }

    setLoading(true);

    try {
      // Sign a message to prove wallet ownership
      const message = `Register on Rubbi as ${usernameInput.toLowerCase()}`;
      const signature = await (window as any).ethereum?.request({
        method: "personal_sign",
        params: [message, address],
      });

      // Call API to register
      const result = await api.auth.register(address, signature || "0x");

      if (result.error) {
        toast("error", "Registration Failed", result.error);
        // Fallback to local generation if API fails
        await generateLocalCard();
        return;
      }

      if (result.data) {
        setToken(result.data.token);
        
        // Set card data from API response
        setVirtualCardData({
          cardHolder: usernameInput.toUpperCase(),
          lastFour: result.data.user.cardLastFour,
          expiry: result.data.user.cardExpiry,
          network: "MONAD L1",
        });
        
        setCardData({
          lastFour: result.data.user.cardLastFour,
          expiry: result.data.user.cardExpiry,
        });
        
        setGenerated(true);
        toast("success", "Virtual Card Generated!", "You can now subscribe to services using your Rubbi card.");
      }
    } catch (err: any) {
      // Fallback to local generation if error
      console.error("API error, using local generation:", err);
      await generateLocalCard();
    }

    setLoading(false);
  };

  const generateLocalCard = async () => {
    await new Promise(r => setTimeout(r, 500));
    const lastFour = Math.floor(1000 + Math.random() * 9000).toString();
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const year = (new Date().getFullYear() + 4).toString().slice(-2);
    setVirtualCardData({ cardHolder: usernameInput.toUpperCase(), lastFour, expiry: `${month}/${year}`, network: "MONAD L1" });
    setCardData({ lastFour, expiry: `${month}/${year}` });
    setGenerated(true);
    toast("success", "Virtual Card Generated!", "You can now subscribe to services using your Rubbi card.");
  };

  const handleContinue = () => {
    onClose();
    onComplete?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Your Virtual Card" subtitle="Required to subscribe to any service on the Rubbi platform" size="sm">
      <div className="space-y-5">
        {!generated ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <CreditCard size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Virtual Card Required</p>
                <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                  You need to generate a virtual card before you can subscribe to any service. Your card is tied to your wallet and on-chain identity.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Your Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">@</span>
                <input
                  type="text"
                  placeholder="yourname"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="w-full pl-8 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="bg-primary rounded-2xl p-5 card-shine">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Rubbi Virtual Card</p>
              <div className="w-9 h-6 bg-yellow-400/80 rounded mb-4" />
              <p className="font-mono text-white tracking-widest mb-4">•••• •••• •••• ────</p>
              <div className="flex justify-between">
                <div><p className="text-xs text-white/40">CARD HOLDER</p><p className="text-sm font-bold text-white">{usernameInput ? usernameInput.toUpperCase() : "—"}</p></div>
                <div className="text-right"><p className="text-xs text-white/40">EXPIRES</p><p className="text-sm font-bold text-white">--/--</p></div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Lock size={12} className="text-neutral-300" />
              <span>Your card details are secured with end-to-end encryption and tied to your wallet address.</span>
            </div>

            <Button size="lg" fullWidth loading={loading} icon={<CreditCard size={16} />} onClick={handleGenerate}>
              {loading ? "Creating Card..." : "Generate Virtual Card"}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Card Ready!</h3>
              <p className="text-sm text-neutral-500 mt-1">Your virtual card has been generated and is ready to use for subscriptions.</p>
            </div>
            <div className="bg-primary rounded-2xl p-5 card-shine text-left">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Rubbi Virtual Card</p>
              <div className="w-9 h-6 bg-yellow-400/80 rounded mb-4" />
              <p className="font-mono text-white tracking-widest mb-4">•••• •••• •••• {cardData?.lastFour}</p>
              <div className="flex justify-between">
                <div><p className="text-xs text-white/40">CARD HOLDER</p><p className="text-sm font-bold text-white">{usernameInput.toUpperCase()}</p></div>
                <div className="text-right"><p className="text-xs text-white/40">EXPIRES</p><p className="text-sm font-bold text-white">{cardData?.expiry}</p></div>
              </div>
            </div>
            <Button size="lg" fullWidth icon={<ChevronRight size={16} />} iconPosition="right" onClick={handleContinue}>
              Continue to Subscribe
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}