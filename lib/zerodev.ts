import { http } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const ZERODEV_RPC =
  process.env.NEXT_PUBLIC_ZERODEV_RPC || "";

export const ZERODEV_CHAIN = arbitrumSepolia;

export const ZERODEV_PROJECT_ID =
  process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || "";

export function getZeroDevRpc(): string {
  if (!ZERODEV_RPC) {
    throw new Error(
      "Missing NEXT_PUBLIC_ZERODEV_RPC env var. Create a project at https://dashboard.zerodev.app"
    );
  }
  return ZERODEV_RPC;
}
