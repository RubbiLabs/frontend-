"use client";
import { useCallback } from "react";
import { useZeroDev } from "@/context/ZeroDevContext";
import { encodeFunctionData, type Address, type Abi } from "viem";

interface SendUserOpParams {
  to: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
}

export function useZeroDevSend() {
  const { kernelClient, isReady } = useZeroDev();

  const sendUserOp = useCallback(
    async ({ to, abi, functionName, args = [], value = 0n }: SendUserOpParams) => {
      if (!kernelClient || !isReady) {
        throw new Error("ZeroDev smart account not ready");
      }

      const client = kernelClient as any;

      const hash = await client.writeContract({
        address: to,
        abi,
        functionName,
        args,
        value,
      });

      const receipt = await client.waitForUserOperationReceipt({
        hash,
        timeout: 60_000,
      });

      return {
        txHash: receipt.receipt.transactionHash as `0x${string}`,
        actualGasCost: receipt.actualGasCost,
      };
    },
    [kernelClient, isReady]
  );

  const sendBatchUserOps = useCallback(
    async (calls: Array<{ to: Address; data: `0x${string}`; value?: bigint }>) => {
      if (!kernelClient || !isReady) {
        throw new Error("ZeroDev smart account not ready");
      }

      const client = kernelClient as any;

      const callData = await client.account.encodeCalls(
        calls.map((c) => ({
          to: c.to,
          value: c.value || 0n,
          data: c.data,
        }))
      );

      const hash = await client.sendTransaction({ data: callData });

      const receipt = await client.waitForUserOperationReceipt({
        hash,
        timeout: 60_000,
      });

      return {
        txHash: receipt.receipt.transactionHash as `0x${string}`,
      };
    },
    [kernelClient, isReady]
  );

  return { sendUserOp, sendBatchUserOps, isReady };
}
