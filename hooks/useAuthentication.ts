"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useCallback } from "react";
import { CONTRACTS } from "@/lib/contracts/config";
import AuthABI from "@/Abis/Authentication.json";

export function useAuthentication() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: allUsers, refetch: refetchUsers } = useReadContract({
    address: CONTRACTS.authentication,
    abi: AuthABI.abi,
    functionName: "getAllUsers",
  });

  const createAccount = useCallback(
    (username: string) => {
      const nameBytes = hexEncodeString(username);
      writeContract({
        address: CONTRACTS.authentication,
        abi: AuthABI.abi,
        functionName: "createAccount",
        args: [nameBytes],
      });
    },
    [writeContract]
  );

  const checkUsername = useCallback(
    async (username: string): Promise<boolean> => {
      if (!CONTRACTS.authentication) return false;
      try {
        const nameBytes = hexEncodeString(username);
        const { readContract } = await import("viem/actions");
        // Use wagmi's readContract via a public client approach
        return false; // Fallback — actual check done via viem publicClient in the page
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
    isCreating: isPending || isConfirming,
    isSuccess,
    error,
    txHash,
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
