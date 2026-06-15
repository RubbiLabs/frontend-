import type { Address } from "viem";

export const CONTRACTS = {
  authentication: process.env.NEXT_PUBLIC_AUTH_CONTRACT_ADDRESS as Address,
  rubbiToken: process.env.NEXT_PUBLIC_RUBBI_TOKEN_ADDRESS as Address,
  modalContract: process.env.NEXT_PUBLIC_MODAL_CONTRACT_ADDRESS as Address,
  subscriptionService: process.env.NEXT_PUBLIC_SUBSCRIPTION_SERVICE_ADDRESS as Address,
  salaryStreaming: process.env.NEXT_PUBLIC_SALARY_STREAMING_ADDRESS as Address,
  router: process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER as Address,
  weth: process.env.NEXT_PUBLIC_WETH_ADDRESS as Address,
  arbToken: process.env.NEXT_PUBLIC_ARB_TOKEN_ADDRESS as Address,
} as const;

export const CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc";
