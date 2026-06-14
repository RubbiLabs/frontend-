import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Rubbi — Decentralized Financial Automation on Arbitrum",
  description: "Automate subscriptions, stream salaries, and manage digital assets on Arbitrum from a single, secure ledger.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#22577A",
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