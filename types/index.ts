export type IntervalType = 0 | 1 | 2; // None, Daily, and Monthly

export interface Stream {
  id: bigint;
  recipient: `0x${string}`;
  amount: bigint;
  lastPayment: bigint;
  startTime: bigint;
  intervalType: IntervalType;
  active: boolean;
  name: string;
  streamOwner: `0x${string}`;
}

export interface SubscriptionPlan {
  name: string;
  fee: bigint;
  active: boolean;
}

export interface Subscriber {
  active: boolean;
  name: string;
  fee: bigint;
  userAddress: `0x${string}`;
  subPlanId: bigint;
  email: string;
  password: string;
}

export interface RubbiUser {
  name: Uint8Array;
  address_: `0x${string}`;
}

export interface VirtualCard {
  cardHolder: string;
  lastFour: string;
  expiry: string;
  network: string;
  address: string;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type SwapToken = "ETH" | "ARB";

export const SWAP_TOKEN_ADDRESSES: Record<SwapToken, Record<number, `0x${string}`>> = {
  ETH: {
    // ETH uses WETH address for Uniswap pairs
    421614: "0x980B62Da83eFf3D4576C647993bE3e48d8889910", // WETH on Arbitrum Sepolia
  },
  ARB: {
    421614: "0xe5914C2E0A726242a0F72c2850E84a98D4D544c6", // ARB on Arbitrum Sepolia
  },
};

export const SWAP_TOKEN_DECIMALS: Record<SwapToken, number> = {
  ETH: 18,
  ARB: 18,
};
