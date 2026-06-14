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
    421614: (process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000",
  },
  ARB: {
    421614: (process.env.NEXT_PUBLIC_ARB_TOKEN_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000",
  },
};

export const SWAP_TOKEN_DECIMALS: Record<SwapToken, number> = {
  ETH: 18,
  ARB: 18,
};
