"use client";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useCallback } from "react";
import { CONTRACTS } from "@/lib/contracts/config";
import RubbiTokenABI from "@/Abis/RubbiToken.json";
import ERC20ABI from "@/Abis/ERC20.json";

export function useRubbiToken() {
  const { address } = useAccount();

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

  const {
    writeContract: writeClaim,
    data: claimTxHash,
    isPending: isClaiming,
  } = useWriteContract();

  const { isLoading: isClaimConfirming, isSuccess: claimSuccess } =
    useWaitForTransactionReceipt({ hash: claimTxHash });

  const claimFaucet = useCallback(() => {
    writeClaim({
      address: CONTRACTS.rubbiToken,
      abi: RubbiTokenABI.abi,
      functionName: "claimFaucet",
    });
  }, [writeClaim]);

  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApproving,
  } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const approve = useCallback(
    (spender: `0x${string}`, amount: bigint) => {
      writeApprove({
        address: CONTRACTS.rubbiToken,
        abi: ERC20ABI.abi,
        functionName: "approve",
        args: [spender, amount],
      });
    },
    [writeApprove]
  );

  const {
    writeContract: writeTransfer,
    data: transferTxHash,
    isPending: isTransferring,
  } = useWriteContract();

  const { isLoading: isTransferConfirming } = useWaitForTransactionReceipt({
    hash: transferTxHash,
  });

  const transfer = useCallback(
    (to: `0x${string}`, amount: bigint) => {
      writeTransfer({
        address: CONTRACTS.rubbiToken,
        abi: ERC20ABI.abi,
        functionName: "transfer",
        args: [to, amount],
      });
    },
    [writeTransfer]
  );

  return {
    balance,
    refetchBalance,
    faucetClaimCount: faucetClaimCount ? Number(faucetClaimCount) : 0,
    refetchFaucetCount,
    timeUntilNextClaim,
    claimFaucet,
    isClaiming: isClaiming || isClaimConfirming,
    claimSuccess,
    approve,
    isApproving: isApproving || isApproveConfirming,
    transfer,
    isTransferring: isTransferring || isTransferConfirming,
  };
}
