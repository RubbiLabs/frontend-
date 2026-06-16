"use client";
import { useReadContract } from "wagmi";
import { useCallback } from "react";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useToast } from "@/context/ToastContext";
import { CONTRACTS } from "@/lib/contracts/config";
import AuthABI from "@/Abis/Authentication.json";

export function useAuthentication() {
  const { kernelClient, isReady: isZeroDevReady } = useZeroDev();
  const { showToast } = useToast();

  const { data: allUsers, refetch: refetchUsers } = useReadContract({
    address: CONTRACTS.authentication,
    abi: AuthABI.abi,
    functionName: "getAllUsers",
  });

  const createAccount = useCallback(
    async (username: string) => {
      if (!kernelClient || !isZeroDevReady) {
        throw new Error("ZeroDev smart account not ready");
      }
      const nameBytes = hexEncodeString(username);
      const client = kernelClient as any;
      try {
        const hash = await client.writeContract({
          address: CONTRACTS.authentication,
          abi: AuthABI.abi,
          functionName: "createAccount",
          args: [nameBytes],
        });
        await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
      } catch (err: any) {
        showToast("error", "Account Creation Failed", err.message);
        throw err;
      }
    },
    [kernelClient, isZeroDevReady, showToast]
  );

  const checkUsername = useCallback(
    async (username: string): Promise<boolean> => {
      if (!CONTRACTS.authentication) return false;
      try {
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  return {
    createAccount,
    checkUsername,
    allUsers,
    refetchUsers,
  };
}

function hexEncodeString(str: string): `0x${string}` {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  ) as `0x${string}`;
}
