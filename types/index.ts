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

export type BridgeToken = "USDC" | "USDT" | "DAI" | "MON" | "ETH";
export type BridgeNetwork = "BSC (BEP20)" | "ERC20" | "TRON20";

// Token prices in USD (approximate)
export const TOKEN_USD_PRICES: Record<BridgeToken, number> = {
  USDC: 1.0,
  USDT: 1.0,
  DAI: 1.0,
  MON: 0.5,
  ETH: 3200,
};

export const RUB_PER_USD = 50;
