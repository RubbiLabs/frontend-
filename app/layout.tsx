import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Rubbi — Decentralized Financial Automation on Arbitrum",
  description: "Automate subscriptions, stream salaries, and manage digital assets on Arbitrum from a single, secure ledger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-manrope antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}