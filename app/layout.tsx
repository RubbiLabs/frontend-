import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "../context/WalletContext";
import { ToastProvider } from "../context/ToastContext";
import { Web3Provider } from "@/providers/Web3Provider";
import { NetworkBanner } from "@/components/ui/NetworkBanner";

export const metadata: Metadata = {
  title: "Rubbi — Decentralized Financial Automation",
  description: "A heavy-duty ledger protocol for the Monad Network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-manrope antialiased">
        <Web3Provider>
          <WalletProvider>
            <ToastProvider>
              <NetworkBanner />
              {children}
            </ToastProvider>
          </WalletProvider>
        </Web3Provider>
      </body>
    </html>
  );
}

// Just created a branch
