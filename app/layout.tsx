import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Rubbi — Decentralized Financial Automation",
  description: "A heavy-duty ledger protocol for the Monad Network.",
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