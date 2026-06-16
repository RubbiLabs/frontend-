"use client";
import { useReadContract } from "wagmi";
import { useCallback } from "react";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useToast } from "@/context/ToastContext";
import { useEffectiveAddress } from "@/hooks/useEffectiveAddress";
import { CONTRACTS } from "@/lib/contracts/config";
import RubbiTokenABI from "@/Abis/RubbiToken.json";
import ERC20ABI from "@/Abis/ERC20.json";

export function useRubbiToken() {
  const address = useEffectiveAddress();
  const { kernelClient, isReady: isZeroDevReady } = useZeroDev();
  const { showToast } = useToast();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.rubbiToken,
    abi: ERC20ABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: faucetClaimCount, refetch: refetchFaucetCount } = useReadContract({
    address: CONTRACTS.rubbiToken,
    abi: RubbiTokenABI.abi,
    functionName: "faucetClaimCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: timeUntilNextClaim } = useReadContract({
    address: CONTRACTS.rubbiToken,
    abi: RubbiTokenABI.abi,
    functionName: "timeUntilNextClaim",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const claimFaucet = useCallback(async () => {
    if (!kernelClient || !isZeroDevReady) {
      throw new Error("ZeroDev smart account not ready");
    }
    try {
      const client = kernelClient as any;
      const hash = await client.writeContract({
        address: CONTRACTS.rubbiToken,
        abi: RubbiTokenABI.abi,
        functionName: "claimFaucet",
      });
      await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
    } catch (err: any) {
      showToast("error", "Claim Failed", err.message);
      throw err;
    }
  }, [kernelClient, isZeroDevReady, showToast]);

  const approve = useCallback(
    async (spender: `0x${string}`, amount: bigint) => {
      if (!kernelClient || !isZeroDevReady) {
        throw new Error("ZeroDev smart account not ready");
      }
      try {
        const client = kernelClient as any;
        const hash = await client.writeContract({
          address: CONTRACTS.rubbiToken,
          abi: ERC20ABI.abi,
          functionName: "approve",
          args: [spender, amount],
        });
        await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
      } catch (err: any) {
        showToast("error", "Approve Failed", err.message);
        throw err;
      }
    },
    [kernelClient, isZeroDevReady, showToast]
  );

  const transfer = useCallback(
    async (to: `0x${string}`, amount: bigint) => {
      if (!kernelClient || !isZeroDevReady) {
        throw new Error("ZeroDev smart account not ready");
      }
      try {
        const client = kernelClient as any;
        const hash = await client.writeContract({
          address: CONTRACTS.rubbiToken,
          abi: ERC20ABI.abi,
          functionName: "transfer",
          args: [to, amount],
        });
        await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
      } catch (err: any) {
        showToast("error", "Transfer Failed", err.message);
        throw err;
      }
    },
    [kernelClient, isZeroDevReady, showToast]
  );

  return {
    balance,
    refetchBalance,
    faucetClaimCount: faucetClaimCount ? Number(faucetClaimCount) : 0,
    refetchFaucetCount,
    timeUntilNextClaim,
    claimFaucet,
    approve,
    transfer,
  };
}
