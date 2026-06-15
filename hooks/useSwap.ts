import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useBalance,
} from "wagmi";
import { parseEther, parseUnits, maxUint256 } from "viem";
import RouterABI from "@/Abis/UniswapV2Router02.json";
import ERC20ABI from "@/Abis/ERC20.json";
import type { SwapToken } from "@/types";
import { useToast } from "@/context/ToastContext";
import { useZeroDev } from "@/context/ZeroDevContext";
import { trackSwapEvent, trackTransaction } from "@/components/dashboard/DuneAnalytics";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
const UNISWAP_V2_ROUTER =
  process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER as `0x${string}`;
const RUB_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_RUBBI_TOKEN_ADDRESS as `0x${string}`;
const WETH_ADDRESS =
  process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
const ARB_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_ARB_TOKEN_ADDRESS as `0x${string}`;

function toDeadline(seconds: number): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + seconds);
}

export function useSwap() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { showToast } = useToast();
  const { kernelClient, isReady: isZeroDevReady } = useZeroDev();

  const [inputToken, setInputToken] = useState<SwapToken>("ETH");
  const [inputAmount, setInputAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5); // percent

  // Get WETH address from env
  const wethAddress = WETH_ADDRESS || undefined;

  // For ETH swaps, use native ETH balance
  const { data: ethBalance } = useBalance({ address });

  // For ARB swaps, read ERC20 balance
  const arbAddress = ARB_TOKEN_ADDRESS || undefined;

  const { data: arbBalance } = useReadContract({
    address: arbAddress,
    abi: ERC20ABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!arbAddress },
  });

  // Read ARB allowance for router
  const { data: arbAllowance, refetch: refetchAllowance } = useReadContract({
    address: arbAddress,
    abi: ERC20ABI.abi,
    functionName: "allowance",
    args: address && arbAddress ? [address, UNISWAP_V2_ROUTER] : undefined,
    query: { enabled: !!address && !!arbAddress && inputToken === "ARB" },
  });

  // Get quote from router
  const inputAmountBigInt =
    inputAmount && Number(inputAmount) > 0
      ? inputToken === "ETH"
        ? parseEther(inputAmount)
        : parseUnits(inputAmount, 18)
      : 0n;

  const swapPath: `0x${string}`[] =
    inputToken === "ETH" && wethAddress && RUB_TOKEN_ADDRESS
      ? [wethAddress, RUB_TOKEN_ADDRESS]
      : arbAddress && RUB_TOKEN_ADDRESS
        ? [arbAddress, RUB_TOKEN_ADDRESS]
        : [];

  const { data: quoteResult, isLoading: isQuoting } = useReadContract({
    address: UNISWAP_V2_ROUTER,
    abi: RouterABI.abi,
    functionName: "getAmountsOut",
    args:
      inputAmountBigInt > 0n && swapPath.length > 0
        ? [inputAmountBigInt, swapPath]
        : undefined,
    query: {
      enabled:
        inputAmountBigInt > 0n &&
        swapPath.length > 0 &&
        !!UNISWAP_V2_ROUTER,
    },
  });

  const estimatedOutput =
    quoteResult && Array.isArray(quoteResult) && quoteResult.length > 1
      ? quoteResult[1] as bigint
      : 0n;

  const minOutput =
    estimatedOutput > 0n
      ? (estimatedOutput * BigInt(Math.floor((100 - slippage) * 10))) / 1000n
      : 0n;

  // Write contract for swap
  const {
    writeContract: writeSwap,
    data: swapTxHash,
    isPending: isSwapPending,
    error: swapError,
  } = useWriteContract();

  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } =
    useWaitForTransactionReceipt({ hash: swapTxHash });

  // Write contract for approve
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Check if approval is needed for ARB swaps
  const needsApproval =
    inputToken === "ARB" &&
    arbAllowance !== undefined &&
    inputAmountBigInt > 0n &&
    (arbAllowance as bigint) < inputAmountBigInt;

  const approve = useCallback(async () => {
    if (!arbAddress || !UNISWAP_V2_ROUTER) return;
    try {
      if (kernelClient && isZeroDevReady) {
        const client = kernelClient as any;
        const hash = await client.writeContract({
          address: arbAddress,
          abi: ERC20ABI.abi,
          functionName: "approve",
          args: [UNISWAP_V2_ROUTER, maxUint256],
        });
        await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
      } else {
        writeApprove({
          address: arbAddress,
          abi: ERC20ABI.abi,
          functionName: "approve",
          args: [UNISWAP_V2_ROUTER, maxUint256],
        });
      }
    } catch (err: any) {
      showToast("error", "Approval Failed", err.message);
    }
  }, [arbAddress, writeApprove, showToast, kernelClient, isZeroDevReady]);

  const swap = useCallback(async () => {
    if (!address || !UNISWAP_V2_ROUTER || !RUB_TOKEN_ADDRESS) return;
    if (inputAmountBigInt <= 0n || estimatedOutput <= 0n) {
      showToast("error", "Invalid Amount", "Please enter a valid amount to swap.");
      return;
    }

    const deadline = toDeadline(600); // 10 minutes

    try {
      if (kernelClient && isZeroDevReady) {
        // ZeroDev gasless path
        const client = kernelClient as any;
        if (inputToken === "ETH") {
          const hash = await client.writeContract({
            address: UNISWAP_V2_ROUTER,
            abi: RouterABI.abi,
            functionName: "swapExactETHForTokens",
            args: [minOutput, swapPath, address, deadline],
            value: inputAmountBigInt,
          });
          await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
        } else {
          const hash = await client.writeContract({
            address: UNISWAP_V2_ROUTER,
            abi: RouterABI.abi,
            functionName: "swapExactTokensForTokens",
            args: [inputAmountBigInt, minOutput, swapPath, address, deadline],
          });
          await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
        }
      } else {
        // Fallback to wagmi (non-gasless)
        if (inputToken === "ETH") {
          writeSwap({
            address: UNISWAP_V2_ROUTER,
            abi: RouterABI.abi,
            functionName: "swapExactETHForTokens",
            args: [minOutput, swapPath, address, deadline],
            value: inputAmountBigInt,
          });
        } else {
          writeSwap({
            address: UNISWAP_V2_ROUTER,
            abi: RouterABI.abi,
            functionName: "swapExactTokensForTokens",
            args: [inputAmountBigInt, minOutput, swapPath, address, deadline],
          });
        }
      }
    } catch (err: any) {
      showToast("error", "Swap Failed", err.message);
    }
  }, [
    address,
    inputToken,
    inputAmountBigInt,
    estimatedOutput,
    minOutput,
    swapPath,
    writeSwap,
    showToast,
    kernelClient,
    isZeroDevReady,
  ]);

  // Auto-clear input on success
  useEffect(() => {
    if (isSwapSuccess) {
      setInputAmount("");
      const outputAmount = Number(estimatedOutput) / 1e18;
      if (outputAmount > 0) {
        trackSwapEvent(outputAmount * 50);
      }
      trackTransaction();
      showToast(
        "success",
        "Swap Complete!",
        `Tokens swapped successfully.`
      );
      refetchAllowance();
    }
  }, [isSwapSuccess]);

  // Show swap error
  useEffect(() => {
    if (swapError) {
      showToast("error", "Swap Transaction Failed", swapError.message);
    }
  }, [swapError]);

  const inputBalance =
    inputToken === "ETH"
      ? ethBalance?.value ?? 0n
      : (arbBalance as bigint) ?? 0n;

  const isSwapping = isSwapPending || isSwapConfirming;
  const isApproving = isApprovePending || isApproveConfirming;
  const isLoading = isSwapping || isApproving;

  return {
    inputToken,
    setInputToken,
    inputAmount,
    setInputAmount,
    slippage,
    setSlippage,
    estimatedOutput,
    minOutput,
    isQuoting,
    inputBalance,
    needsApproval,
    approve,
    isApproving,
    swap,
    isSwapping,
    isLoading,
    isSwapSuccess,
    swapTxHash,
  };
}
