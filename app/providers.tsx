"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import { ZeroDevProvider } from "@/context/ZeroDevContext";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <WalletProvider>
            <ZeroDevProvider>
              {children}
            </ZeroDevProvider>
          </WalletProvider>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}