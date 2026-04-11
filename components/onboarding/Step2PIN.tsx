"use client";
import React, { useRef, useState } from "react";
import { Eye, EyeOff, ChevronRight, Shield, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

interface Props {
  onComplete: () => void;
}

const EMPTY = ["", "", "", "", "", ""];

export default function Step2PIN({ onComplete }: Props) {
  const { success, error } = useToast();
  const [pins, setPins] = useState<string[]>([...EMPTY]);
  const [confirms, setConfirms] = useState<string[]>([...EMPTY]);
  const [showPins, setShowPins] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (
    idx: number,
    val: string,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...arr];
    next[idx] = val;
    setArr(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    idx: number,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !arr[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const pin = pins.join("");
    const confirm = confirms.join("");
    if (pin.length !== 6) {
      error("Incomplete PIN", "Please fill all 6 digits.");
      return;
    }
    if (pin !== confirm) {
      error("PIN Mismatch", "Your PINs do not match. Please try again.");
      setPins([...EMPTY]);
      setConfirms([...EMPTY]);
      pinRefs.current[0]?.focus();
      return;
    }
    /* Store PIN off-chain only — never sent to blockchain */
    sessionStorage.setItem("rubbi_session_pin", btoa(pin));
    success("Vault Secured!", "Your 6-digit PIN has been set.");
    onComplete();
  };

  const PinRow = ({
    label,
    arr,
    setArr,
    refs,
    icon,
  }: {
    label: string;
    arr: string[];
    setArr: (v: string[]) => void;
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    icon: React.ReactNode;
  }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
        {icon}
      </div>
      <div className="flex gap-2">
        {arr.map((p, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type={showPins ? "text" : "password"}
            maxLength={1}
            value={p}
            onChange={(e) => handleInput(i, e.target.value, arr, setArr, refs)}
            onKeyDown={(e) => handleKeyDown(e, i, arr, setArr, refs)}
            className={`pin-input ${p ? "filled" : ""}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8 animate-scaleIn">
      {/* Brand row */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 48 48" fill="none">
            <path d="M12 8H26C31.523 8 36 12.477 36 18C36 22.072 33.572 25.572 30.08 27.2L36 40H28L22.8 28H20V40H12V8Z" fill="#F7F7F2" />
            <path d="M20 14V22H26C28.209 22 30 20.209 30 18C30 15.791 28.209 14 26 14H20Z" fill="#22577A" />
          </svg>
        </div>
        <span className="font-bold text-primary text-base">Rubbi</span>
      </div>

      <PinRow
        label="New Security PIN"
        arr={pins}
        setArr={setPins}
        refs={pinRefs}
        icon={<Lock size={14} className="text-neutral-300" />}
      />

      <PinRow
        label="Confirm PIN"
        arr={confirms}
        setArr={setConfirms}
        refs={confirmRefs}
        icon={
          <button
            type="button"
            onClick={() => setShowPins((p) => !p)}
            className="text-neutral-300 hover:text-neutral-500 transition-colors"
          >
            {showPins ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
      />

      <Button
        size="lg"
        fullWidth
        icon={<ChevronRight size={16} />}
        iconPosition="right"
        onClick={handleContinue}
      >
        Continue
      </Button>

      <p className="text-center text-[10px] text-neutral-400 mt-3 uppercase tracking-widest">
        Secure local encryption active
      </p>

      {/* Vault security note */}
      <div className="mt-6 p-4 bg-tertiary/5 border border-tertiary/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-tertiary" />
          <p className="text-[10px] font-bold text-tertiary uppercase tracking-wider">
            Vault Security
          </p>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          This PIN acts as an off-chain security layer. It never leaves your device
          and is required to authorise any automated financial flows or wallet access.
        </p>
      </div>
    </div>
  );
}
