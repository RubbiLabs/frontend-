"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, ChevronRight, CreditCard, Eye, EyeOff, Lock, Shield } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useWallet, type VirtualCardData } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { api, setToken } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

function randomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join("");
}

export default function VirtualCardModal({ open, onClose, onComplete }: Props) {
  const { username, setUsername, setVirtualCardData } = useWallet();
  const { success, error } = useToast();
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<VirtualCardData | null>(null);

  useEffect(() => {
    if (!open) return;
    setUsernameInput(username || "");
    setPin("");
    setConfirmPin("");
    setGeneratedCard(null);
    setLoading(false);
  }, [open, username]);

  const handleGenerate = async () => {
    const sanitizedUsername = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

    if (sanitizedUsername.length < 3) {
      error("Username Required", "Choose a username with at least 3 letters, numbers, or underscores.");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      error("PIN Required", "Enter a 6-digit PIN to secure your virtual card.");
      return;
    }

    if (pin !== confirmPin) {
      error("PIN Mismatch", "Your PIN confirmation does not match. Please try again.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const cardNumber = `5234 ${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)}`;
    const card: VirtualCardData = {
      cardHolder: sanitizedUsername.toUpperCase(),
      cardNumber,
      lastFour: cardNumber.slice(-4),
      expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 4).slice(-2)}`,
      cvv: randomDigits(3),
      network: "MONAD L1",
      isActive: true,
    };

    setUsername(sanitizedUsername);
    sessionStorage.setItem("rubbi_session_pin", btoa(pin));
    setVirtualCardData(card);
    setGeneratedCard(card);
    success("Virtual Card Generated!", "Your card is ready for subscription payments.");
    setLoading(false);
  };

  const handleContinue = () => {
    onComplete?.();
    onClose();
  };

  const previewName = (usernameInput || "username").toUpperCase();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Your Virtual Card"
      subtitle="Create your Rubbi payment card only when you're ready to subscribe"
      size="sm"
    >
      <div className="space-y-5">
        {!generatedCard ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <CreditCard size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Virtual Card Required</p>
                <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                  Choose your username, set your 6-digit PIN, and we'll issue the card used for all subscription payments.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Card Username</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">6-Digit PIN</label>
                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="******"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full py-3 px-4 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Confirm PIN</label>
                  <button
                    type="button"
                    onClick={() => setShowPin((value) => !value)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="******"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full py-3 px-4 border-2 border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="bg-primary rounded-2xl p-5 card-shine">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Rubbi Virtual Card</p>
              <div className="w-9 h-6 bg-yellow-400/80 rounded mb-4" />
              <p className="font-mono text-white tracking-widest mb-4">5234 •••• •••• ••••</p>
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs text-white/40">CARD HOLDER</p>
                  <p className="text-sm font-bold text-white">{previewName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">EXPIRES</p>
                  <p className="text-sm font-bold text-white">--/--</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Lock size={12} className="text-neutral-300 shrink-0" />
              <span>Your card is encrypted locally, tied to this wallet, and reused for future subscriptions.</span>
            </div>

            <Button size="lg" fullWidth loading={loading} icon={<CreditCard size={16} />} onClick={handleGenerate}>
              {loading ? "Creating Card..." : "Generate Virtual Card"}
            </Button>
          </>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mt-4">Card Ready!</h3>
              <p className="text-sm text-neutral-500 mt-1">
                Your Rubbi card has been generated and saved for this wallet.
              </p>
            </div>

            <div className="bg-primary rounded-2xl p-5 card-shine">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Rubbi Virtual Card</p>
              <div className="w-9 h-6 bg-yellow-400/80 rounded mb-4" />
              <p className="font-mono text-white tracking-widest text-base mb-4">{generatedCard.cardNumber}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-white/40">CARD HOLDER</p>
                  <p className="text-sm font-bold text-white">{generatedCard.cardHolder}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">EXPIRES</p>
                  <p className="text-sm font-bold text-white">{generatedCard.expiry}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">CVV</p>
                  <p className="text-sm font-bold text-white">{generatedCard.cvv}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-neutral-700">
                <Shield size={14} className="text-primary" />
                <p className="text-sm font-semibold">Ready for vendor payments</p>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Use these details for streaming platforms like Netflix and any other supported subscription service in Rubbi.
              </p>
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