"use client";

import { useNetworkSwitch } from "@/hooks/useNetworkSwitch";
import { useToast } from "@/context/ToastContext";

export function NetworkBanner() {
  const { isCorrectNetwork, isPending, switchToMonad, isConnected } = useNetworkSwitch();
  const { toast } = useToast();

  if (!isConnected || isCorrectNetwork) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-950 px-4 py-3 flex items-center justify-center gap-4">
      <span className="text-sm font-medium">
        Wrong network detected. Please switch to Monad Testnet.
      </span>
      <button
        onClick={() => {
          switchToMonad();
          toast("info", "Switching", "Please confirm in your wallet");
        }}
        disabled={isPending}
        className="px-4 py-1.5 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
      >
        {isPending ? "Switching..." : "Switch Network"}
      </button>
    </div>
  );
}