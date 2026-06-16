"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import { ZeroDevProvider } from "@/context/ZeroDevContext";
import { SocialAuthProvider } from "@/context/SocialAuthContext";
import { TransactionModalProvider } from "@/context/TransactionModalContext";

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
          <SocialAuthProvider>
            <WalletProvider>
              <ZeroDevProvider>
                <TransactionModalProvider>
                  {children}
                </TransactionModalProvider>
              </ZeroDevProvider>
            </WalletProvider>
          </SocialAuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
