"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingNavbar from "../../components/layout/LandingNavbar";
// import LandingFooter from "../../components/layout/LandingFooter";
import { useWallet } from "../../context/WalletContext";
import { BookOpen, Zap, CreditCard, Wallet, ArrowRight, Repeat, Shield, HelpCircle } from "lucide-react";

export default function DocsPage() {
  const router = useRouter();
  const { isConnected, isHydrated } = useWallet();
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const sectionIds = [
      "introduction", "getting-started", "dashboard-overview", "subscriptions",
      "salary-streams", "virtual-card", "wallet-faucet", "token-swap",
      "gasless-transactions", "smart-contracts", "faq",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  if (!isHydrated) return null;

  const sections = [
    { id: "introduction", label: "Introduction to Rubbi", icon: <BookOpen size={16} /> },
    { id: "getting-started", label: "Getting Started", icon: <ArrowRight size={16} /> },
    { id: "dashboard-overview", label: "Dashboard Overview", icon: <Wallet size={16} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <CreditCard size={16} /> },
    { id: "salary-streams", label: "Salary Streams", icon: <Zap size={16} /> },
    { id: "virtual-card", label: "Virtual Card", icon: <CreditCard size={16} /> },
    { id: "wallet-faucet", label: "Wallet & Faucet", icon: <Wallet size={16} /> },
    { id: "token-swap", label: "Token Swap", icon: <Repeat size={16} /> },
    { id: "gasless-transactions", label: "Gasless Transactions", icon: <Zap size={16} /> },
    { id: "smart-contracts", label: "Smart Contracts", icon: <Shield size={16} /> },
    { id: "faq", label: "FAQ", icon: <HelpCircle size={16} /> },
  ];

  return (
    <div className="h-screen bg-neutral-50 font-manrope overflow-hidden flex flex-col">
      <LandingNavbar />

      <div className="flex-1 pt-24 pb-8 overflow-hidden">
        <div className="px-6 lg:px-36 h-full">
          <div className="flex gap-8 h-full">
            {/* Sidebar */}
            <div className="w-64 shrink-0">
              <div className="sticky top-0 h-full overflow-y-auto pr-2 pb-8 scrollbar-thin">
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 px-3">Documentation</h3>
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          const el = document.getElementById(section.id);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          activeSection === section.id
                            ? "bg-primary/8 text-primary"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        {section.icon}
                        {section.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 pb-8 scrollbar-thin">
              <div className="max-w-3xl">
                {/* Introduction */}
                <section id="introduction" className="mb-16">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-6">Introduction to Rubbi</h1>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Rubbi is a decentralized financial automation platform built on Arbitrum, an Ethereum Layer 2 scaling solution. 
                      We provide a comprehensive suite of tools for managing your financial life through smart contracts, 
                      enabling gasless transactions, streaming subscriptions, salary payments, and token swaps.
                    </p>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Unlike traditional financial platforms, Rubbi operates entirely on-chain, ensuring transparency, 
                      security, and composability with the broader DeFi ecosystem. Every transaction is recorded on the 
                      Arbitrum blockchain, providing an immutable audit trail.
                    </p>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-bold text-primary mb-3">Key Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Zap size={16} className="text-primary mt-1" />
                          <span className="text-neutral-600">Gasless transactions powered by ZeroDev account abstraction</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CreditCard size={16} className="text-primary mt-1" />
                          <span className="text-neutral-600">Virtual cards for subscription payments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Repeat size={16} className="text-primary mt-1" />
                          <span className="text-neutral-600">Token swaps via Uniswap V2 integration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield size={16} className="text-primary mt-1" />
                          <span className="text-neutral-600">Audited smart contracts on Arbitrum</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Getting Started */}
                <section id="getting-started" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Getting Started</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Rubbi offers multiple ways to get started. Choose the method that works best for you.
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Option 1: Connect Wallet</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Click the &quot;Begin Automation&quot; button on the landing page or navigate to the dashboard. 
                      You&apos;ll be prompted to connect your Web3 wallet (MetaMask, Coinbase Wallet, or WalletConnect compatible wallets).
                    </p>
                    <div className="bg-neutral-100 rounded-xl p-4 mb-6">
                      <p className="text-sm text-neutral-600">
                        <strong>Supported Networks:</strong> Arbitrum One (mainnet) and Arbitrum Sepolia (testnet)
                      </p>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Option 2: Continue with Google</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Sign in with your Google account — no Web3 wallet needed. Rubbi creates a secure smart contract 
                      wallet tied to your Google identity. This is the easiest way to get started.
                    </p>
                    <ol className="list-decimal list-inside text-neutral-600 mb-6 space-y-2">
                      <li>Click &quot;Continue with Google&quot; on the onboarding page</li>
                      <li>Sign in with your Google account in the popup</li>
                      <li>A smart contract wallet is automatically created for you</li>
                      <li>You&apos;re redirected to the dashboard — ready to use all features</li>
                    </ol>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                      <p className="text-sm text-neutral-600">
                        <strong>Note:</strong> Your Google-linked wallet is a smart contract account that supports 
                        gasless transactions. You can use all Rubbi features without holding ETH for gas.
                      </p>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Option 3: Continue with Email</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Use your email address to create a wallet automatically. An OTP will be sent to your email 
                      for verification. This method also creates a smart contract wallet with full gasless support.
                    </p>
                    <ol className="list-decimal list-inside text-neutral-600 mb-6 space-y-2">
                      <li>Click &quot;Continue with Email&quot; on the onboarding page</li>
                      <li>Enter your email address</li>
                      <li>Verify the OTP sent to your inbox</li>
                      <li>Your wallet is created and you&apos;re ready to go</li>
                    </ol>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Complete Onboarding</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      After connecting with any method, you&apos;ll go through a quick onboarding process where you can:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
                      <li>Set your username and profile</li>
                      <li>Generate a virtual card for subscription payments</li>
                      <li>Claim testnet tokens from the faucet (on testnet)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Navigate the Dashboard</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Once onboarded, you&apos;ll have access to the full dashboard with all features. 
                      The sidebar provides quick access to Subscriptions, Salary Streams, Virtual Card, Wallet, and Swap functionality.
                    </p>
                  </div>
                </section>

                {/* Dashboard Overview */}
                <section id="dashboard-overview" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Dashboard Overview</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      The Rubbi dashboard is your central hub for managing all financial operations. 
                      Here&apos;s what each section provides:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h4 className="font-bold text-neutral-900 mb-2">Subscriptions</h4>
                        <p className="text-sm text-neutral-600">Browse, subscribe to, and manage streaming services. Monitor active subscriptions and billing cycles.</p>
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h4 className="font-bold text-neutral-900 mb-2">Salary Streams</h4>
                        <p className="text-sm text-neutral-600">Create and manage salary streams for employees or contractors. Set up recurring payments with customizable intervals.</p>
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h4 className="font-bold text-neutral-900 mb-2">Virtual Card</h4>
                        <p className="text-sm text-neutral-600">Generate and manage virtual cards for subscription payments. Freeze/unfreeze cards as needed.</p>
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h4 className="font-bold text-neutral-900 mb-2">Wallet</h4>
                        <p className="text-sm text-neutral-600">View your RUB token balance, claim faucet tokens, and deposit funds to the contract.</p>
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h4 className="font-bold text-neutral-900 mb-2">Swap</h4>
                        <p className="text-sm text-neutral-600">Exchange ETH or ARB for RUB tokens using Uniswap V2 integration.</p>
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-xl p-5">
                        <h4 className="font-bold text-neutral-900 mb-2">Settings</h4>
                        <p className="text-sm text-neutral-600">Manage your profile, notification preferences, and security settings.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Subscriptions */}
                <section id="subscriptions" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Subscriptions</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Rubbi enables you to subscribe to various streaming services using RUB tokens. 
                      Subscriptions are managed through smart contracts, ensuring automatic payments and easy cancellation.
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">How to Subscribe</h3>
                    <ol className="list-decimal list-inside text-neutral-600 mb-6 space-y-2">
                      <li>Navigate to the Subscriptions section in your dashboard</li>
                      <li>Browse available channels (Netflix, Spotify, AWS, etc.)</li>
                      <li>Click &quot;Subscribe&quot; on your desired service</li>
                      <li>Confirm the subscription amount and interval</li>
                      <li>Approve the transaction (gasless via ZeroDev)</li>
                      <li>Your subscription is now active and payments will stream automatically</li>
                    </ol>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Managing Subscriptions</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      You can view all active subscriptions in your dashboard. Each subscription shows:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
                      <li>Service name and logo</li>
                      <li>Monthly cost in RUB</li>
                      <li>Status (active, paused, cancelled)</li>
                      <li>Next payment date</li>
                    </ul>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Creating a Virtual Card</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Before subscribing, you&apos;ll need to generate a virtual card. Go to the Virtual Card section 
                      and click &quot;Generate Card&quot;. This creates a unique card number linked to your account 
                      that can be used for subscription payments.
                    </p>
                  </div>
                </section>

                {/* Salary Streams */}
                <section id="salary-streams" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Salary Streams</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Salary Streams allow you to set up continuous payment flows to employees, contractors, 
                      or any Ethereum address. Payments are streamed per-second, providing real-time liquidity to recipients.
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Creating a Salary Stream</h3>
                    <ol className="list-decimal list-inside text-neutral-600 mb-6 space-y-2">
                      <li>Navigate to Salary Streams in your dashboard</li>
                      <li>Click &quot;Create Stream&quot;</li>
                      <li>Enter the recipient&apos;s Ethereum address</li>
                      <li>Set the monthly amount in RUB</li>
                      <li>Choose the payment interval (daily, weekly, monthly)</li>
                      <li>Set the stream duration (optional)</li>
                      <li>Review and confirm the stream creation</li>
                    </ol>

                    <div className="bg-neutral-900 rounded-xl p-6 mb-6">
                      <p className="text-green-400 font-mono text-sm">$ rubbi stream create</p>
                      <p className="text-neutral-400 font-mono text-sm">recipient: 0x4a...e89</p>
                      <p className="text-neutral-400 font-mono text-sm">amount: 4500 RUB/month</p>
                      <p className="text-neutral-400 font-mono text-sm">interval: monthly</p>
                      <p className="text-green-400 font-mono text-sm mt-3">✓ Stream initiated</p>
                      <p className="text-neutral-500 font-mono text-sm">Block #18,394,022</p>
                      <p className="text-primary font-mono text-sm">Flowing at 0.25 RUB/hr</p>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Managing Recipients</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      You can view all active salary streams in your dashboard. For each stream, you can:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
                      <li>Pause or resume the stream</li>
                      <li>Modify the payment amount</li>
                      <li>Cancel the stream and refund remaining balance</li>
                      <li>View transaction history and settlement records</li>
                    </ul>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Disbursing Funds</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Recipients can claim their streamed funds at any time. The smart contract calculates 
                      the accrued amount based on the stream parameters and allows instant withdrawal. 
                      No waiting for monthly paydays — funds are available as they accrue.
                    </p>
                  </div>
                </section>

                {/* Virtual Card */}
                <section id="virtual-card" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Virtual Card</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      The Rubbi Virtual Card is a unique payment credential linked to your account. 
                      It&apos;s used for subscription payments and can be managed directly from your dashboard.
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">How the Card Works</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Your virtual card is tied to your on-chain identity. When you subscribe to a service, 
                      the payment is authorized through your card and processed via the smart contract. 
                      This ensures secure, verifiable transactions without exposing sensitive information.
                    </p>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Generating a Card</h3>
                    <ol className="list-decimal list-inside text-neutral-600 mb-6 space-y-2">
                      <li>Navigate to the Virtual Card section</li>
                      <li>Click &quot;Generate New Card&quot;</li>
                      <li>Confirm the card generation (gasless transaction)</li>
                      <li>Your card details will be displayed (store them securely)</li>
                    </ol>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Freeze/Unfreeze</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      You can temporarily freeze your card to prevent any new subscriptions or payments. 
                      This is useful if you suspect unauthorized activity or want to pause all spending.
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
                      <li><strong>Freeze:</strong> Blocks all new transactions</li>
                      <li><strong>Unfreeze:</strong> Re-enables card for payments</li>
                      <li>Existing streams continue unaffected</li>
                    </ul>
                  </div>
                </section>

                {/* Wallet & Faucet */}
                <section id="wallet-faucet" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Wallet & Faucet</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Rubbi uses the RUB token as its native currency for all transactions. 
                      You can acquire RUB through the faucet (testnet) or by swapping ETH/ARB (mainnet).
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">RUB Token</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      RUB is an ERC-20 token on Arbitrum that powers all Rubbi operations. 
                      It&apos;s used for subscription payments, salary streams, and governance.
                    </p>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Claiming Faucet Tokens</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      On the testnet, you can claim free RUB tokens from the faucet to test the platform:
                    </p>
                    <ol className="list-decimal list-inside text-neutral-600 mb-6 space-y-2">
                      <li>Navigate to the Wallet section</li>
                      <li>Click &quot;Claim Faucet&quot;</li>
                      <li>Confirm the transaction</li>
                      <li>100 RUB will be credited to your account</li>
                      <li>Faucet can be claimed once every 24 hours</li>
                    </ol>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Depositing to Contract</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      To use Rubbi services, you need to deposit funds into the smart contract. 
                      This ensures your subscriptions and salary streams have sufficient balance.
                    </p>
                    <div className="bg-neutral-100 rounded-xl p-4 mb-6">
                      <p className="text-sm text-neutral-600">
                        <strong>Note:</strong> Deposits are held in the contract and can be withdrawn at any time. 
                        The contract is audited and non-custodial.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Token Swap */}
                <section id="token-swap" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Token Swap</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Rubbi integrates with Uniswap V2 to allow seamless token swaps. 
                      You can exchange ETH or ARB for RUB tokens directly from your dashboard.
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">How to Swap</h3>
                    <ol className="list-decimal list-inside text-neutral-600 mb-6 space-y-2">
                      <li>Navigate to the Swap section</li>
                      <li>Select the input token (ETH or ARB)</li>
                      <li>Enter the amount you want to swap</li>
                      <li>Review the exchange rate and slippage</li>
                      <li>Click &quot;Swap&quot; and confirm the transaction</li>
                      <li>RUB tokens will be credited to your balance</li>
                    </ol>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Swap Transaction Example</h3>
                    <div className="bg-neutral-900 rounded-xl p-6 mb-6">
                      <p className="text-green-400 font-mono text-sm">$ rubbi swap</p>
                      <p className="text-neutral-400 font-mono text-sm">input: 1.5 ETH</p>
                      <p className="text-neutral-400 font-mono text-sm">output: 2400 RUB</p>
                      <p className="text-neutral-400 font-mono text-sm">slippage: 0.5%</p>
                      <p className="text-green-400 font-mono text-sm mt-3">✓ Swap executed</p>
                      <p className="text-neutral-500 font-mono text-sm">Transaction: 0x7f...3a2</p>
                      <p className="text-primary font-mono text-sm">Gas used: 0 (gasless)</p>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Exchange Rates</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Exchange rates are sourced from Uniswap V2 liquidity pools. Rubbi charges no additional fees 
                      beyond the standard Uniswap swap fee (0.3%). Slippage protection is set to 0.5% by default.
                    </p>
                  </div>
                </section>

                {/* Gasless Transactions */}
                <section id="gasless-transactions" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Gasless Transactions</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Rubbi leverages ZeroDev account abstraction to enable gasless transactions. 
                      This means you don&apos;t need ETH for gas fees when using Rubbi services.
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">How It Works</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      ZeroDev creates a smart contract wallet for you that can execute transactions without 
                      requiring ETH for gas. Instead, gas fees are paid in RUB tokens or sponsored by the platform.
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 mb-6 space-y-2">
                      <li><strong>Account Abstraction:</strong> Your wallet is a smart contract, not an EOA</li>
                      <li><strong>Gas Sponsorship:</strong> Platform pays gas fees on your behalf</li>
                      <li><strong>Batch Transactions:</strong> Multiple operations in one transaction</li>
                      <li><strong>Session Keys:</strong> Temporary keys for specific operations</li>
                    </ul>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Benefits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <h4 className="font-bold text-primary mb-2">No Gas Fees</h4>
                        <p className="text-sm text-neutral-600">Use all Rubbi features without holding ETH for gas</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <h4 className="font-bold text-primary mb-2">Simplified UX</h4>
                        <p className="text-sm text-neutral-600">One-click transactions without gas estimation</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <h4 className="font-bold text-primary mb-2">Enhanced Security</h4>
                        <p className="text-sm text-neutral-600">Smart contract wallets with social recovery</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <h4 className="font-bold text-primary mb-2">Composability</h4>
                        <p className="text-sm text-neutral-600">Batch multiple operations into single transactions</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Smart Contracts */}
                <section id="smart-contracts" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">Smart Contracts</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      Rubbi&apos;s architecture is built on a suite of audited smart contracts deployed on Arbitrum. 
                      These contracts handle all financial operations, ensuring transparency and security.
                    </p>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Contract Architecture</h3>
                    <div className="bg-neutral-100 rounded-xl p-6 mb-6 font-mono text-sm">
                      <p className="text-neutral-800">RubbiProtocol.sol</p>
                      <p className="text-neutral-600">├── SubscriptionManager.sol</p>
                      <p className="text-neutral-600">├── SalaryStream.sol</p>
                      <p className="text-neutral-600">├── VirtualCard.sol</p>
                      <p className="text-neutral-600">├── TokenSwap.sol</p>
                      <p className="text-neutral-600">├── RUBToken.sol</p>
                      <p className="text-neutral-600">└── Governance.sol</p>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Key Contracts</h3>
                    <ul className="list-disc list-inside text-neutral-600 mb-6 space-y-2">
                      <li><strong>RubbiProtocol.sol:</strong> Main entry point and access control</li>
                      <li><strong>SubscriptionManager.sol:</strong> Handles subscription lifecycle</li>
                      <li><strong>SalaryStream.sol:</strong> Manages continuous payment streams</li>
                      <li><strong>VirtualCard.sol:</strong> Virtual card generation and management</li>
                      <li><strong>TokenSwap.sol:</strong> Uniswap V2 integration for token swaps</li>
                      <li><strong>RUBToken.sol:</strong> ERC-20 token contract</li>
                    </ul>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Security</h3>
                    <p className="text-neutral-600 leading-relaxed mb-4">
                      All contracts have been audited by leading security firms. The code is open-source 
                      and verifiable on Arbiscan. Key security features include:
                    </p>
                    <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
                      <li>Reentrancy protection</li>
                      <li>Integer overflow checks</li>
                      <li>Access control with role-based permissions</li>
                      <li>Emergency pause functionality</li>
                      <li>Upgradeable proxy pattern for future improvements</li>
                    </ul>
                  </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="mb-16">
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-6">FAQ</h2>
                  <div className="prose prose-neutral max-w-none">
                    <div className="space-y-6">
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">What is Rubbi?</h3>
                        <p className="text-neutral-600">Rubbi is a decentralized financial automation platform built on Arbitrum. It provides tools for streaming subscriptions, salary payments, virtual cards, and token swaps.</p>
                      </div>
                      
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">Do I need ETH for gas fees?</h3>
                        <p className="text-neutral-600">No! Rubbi uses ZeroDev account abstraction to enable gasless transactions. You only need RUB tokens to use the platform.</p>
                      </div>
                      
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">How do I get RUB tokens?</h3>
                        <p className="text-neutral-600">You can claim free RUB tokens from the faucet (testnet) or swap ETH/ARB for RUB via the integrated Uniswap V2 swap.</p>
                      </div>
                      
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">Is my money safe?</h3>
                        <p className="text-neutral-600">Yes. Rubbi uses audited smart contracts on Arbitrum. Your funds are held in non-custodial contracts, meaning you maintain full control at all times.</p>
                      </div>
                      
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">Can I cancel subscriptions anytime?</h3>
                        <p className="text-neutral-600">Yes. You can pause or cancel any subscription at any time. Cancelled subscriptions stop streaming payments immediately.</p>
                      </div>
                      
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">What networks are supported?</h3>
                        <p className="text-neutral-600">Rubbi currently supports Arbitrum One (mainnet) and Arbitrum Sepolia (testnet). We plan to expand to other L2 networks in the future.</p>
                      </div>
                      
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">How do salary streams work?</h3>
                        <p className="text-neutral-600">Salary streams create continuous payment flows. Funds accrue per-second and recipients can claim them anytime. It&apos;s like a faucet that never stops.</p>
                      </div>
                      
                      <div className="bg-white border border-neutral-200 rounded-xl p-6">
                        <h3 className="font-bold text-neutral-900 mb-2">Can I use Rubbi for business payroll?</h3>
                        <p className="text-neutral-600">Absolutely. Salary Streams are designed for business use cases. You can set up recurring payments to employees, contractors, or any Ethereum address.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <LandingFooter /> */}
    </div>
  );
}