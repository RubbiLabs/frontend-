import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useBalance,
} from "wagmi";
import { parseEther, parseUnits, maxUint256 } from "viem";
import RouterABI from "@/Abis/UniswapV2Router02.json";
import ERC20ABI from "@/Abis/ERC20.json";
import type { SwapToken } from "@/types";
import { useToast } from "@/context/ToastContext";
import { useZeroDev } from "@/context/ZeroDevContext";
import { useWallet } from "@/context/WalletContext";
import { useSocialAuth } from "@/context/SocialAuthContext";
import { useTransactionModal } from "@/context/TransactionModalContext";
import { trackSwapEvent, trackTransaction } from "@/components/dashboard/DuneAnalytics";

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
  const { address: wagmiAddress } = useAccount();
  const chainId = useChainId();
  const { showToast } = useToast();
  const { kernelClient, isReady: isZeroDevReady, isLoading: isZeroDevLoading, error: zeroDevError } = useZeroDev();
  const { address: walletAddress } = useWallet();
  const { isSocialLogin, socialAddress } = useSocialAuth();
  const { showTxModal, setTxStatus, hideTxModal } = useTransactionModal();

  const address = isSocialLogin ? socialAddress : (wagmiAddress || walletAddress);
  const effectiveAddress = address || undefined;

  const [inputToken, setInputToken] = useState<SwapToken>("ETH");
  const [inputAmount, setInputAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapLoading, setSwapLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);

  const wethAddress = WETH_ADDRESS || undefined;
  const { data: ethBalance } = useBalance({ address: effectiveAddress });
  const arbAddress = ARB_TOKEN_ADDRESS || undefined;

  const { data: arbBalance } = useReadContract({
    address: arbAddress,
    abi: ERC20ABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!arbAddress },
  });

  const { data: arbAllowance, refetch: refetchAllowance } = useReadContract({
    address: arbAddress,
    abi: ERC20ABI.abi,
    functionName: "allowance",
    args: address && arbAddress ? [address, UNISWAP_V2_ROUTER] : undefined,
    query: { enabled: !!address && !!arbAddress && inputToken === "ARB" },
  });

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
      ? (quoteResult[1] as bigint)
      : 0n;

  const minOutput =
    estimatedOutput > 0n
      ? (estimatedOutput * BigInt(Math.floor((100 - slippage) * 10))) / 1000n
      : 0n;

  const needsApproval =
    inputToken === "ARB" &&
    arbAllowance !== undefined &&
    inputAmountBigInt > 0n &&
    (arbAllowance as bigint) < inputAmountBigInt;

  const approve = useCallback(async () => {
    if (!arbAddress || !UNISWAP_V2_ROUTER) return;

    if (!kernelClient || !isZeroDevReady) {
      const msg = zeroDevError
        ? `ZeroDev error: ${zeroDevError}`
        : isZeroDevLoading
          ? "Smart account is still initializing. Please wait a moment and try again."
          : "ZeroDev smart account not ready. Check console for initialization errors.";
      showToast("error", "Gasless Unavailable", msg);
      return;
    }

    setApproveLoading(true);
    showTxModal({ type: "approve", title: "Approving Token", description: "Submitting approval via gasless relay..." });
    try {
      const client = kernelClient as any;
      const hash = await client.writeContract({
        address: arbAddress,
        abi: ERC20ABI.abi,
        functionName: "approve",
        args: [UNISWAP_V2_ROUTER, maxUint256],
      });
      setTxStatus("confirming", "Waiting for approval confirmation...");
      await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });
      setTxStatus("success", `${inputToken} approved for swapping!`, hash);
      showToast("success", "Approval Confirmed", `${inputToken} approved for swapping.`);
      refetchAllowance();
    } catch (err: any) {
      console.error("[Swap] Approve failed:", err);
      const msg = err?.message || "Transaction was rejected or failed on-chain.";
      setTxStatus("error", msg, undefined, msg);
      showToast("error", "Approval Failed", msg);
    } finally {
      setApproveLoading(false);
    }
  }, [arbAddress, showToast, kernelClient, isZeroDevReady, isZeroDevLoading, zeroDevError, inputToken, refetchAllowance, showTxModal, setTxStatus]);

  const swap = useCallback(async () => {
    if (!address || !UNISWAP_V2_ROUTER || !RUB_TOKEN_ADDRESS) return;
    if (inputAmountBigInt <= 0n || estimatedOutput <= 0n) {
      showToast("error", "Invalid Amount", "Please enter a valid amount to swap.");
      return;
    }

    if (!kernelClient || !isZeroDevReady) {
      const msg = zeroDevError
        ? `ZeroDev error: ${zeroDevError}`
        : isZeroDevLoading
          ? "Smart account is still initializing. Please wait a moment and try again."
          : "ZeroDev smart account not ready. Check console for initialization errors.";
      showToast("error", "Gasless Unavailable", msg);
      return;
    }

    const deadline = toDeadline(600);
    setSwapLoading(true);
    const swapLabel = inputToken === "ETH" ? "ETH→RUB" : "ARB→RUB";
    showTxModal({ type: "swap", title: `Swapping ${swapLabel}`, description: `Submitting ${swapLabel} swap via gasless relay...` });

    try {
      const client = kernelClient as any;
      let hash;

      if (inputToken === "ETH") {
        hash = await client.writeContract({
          address: UNISWAP_V2_ROUTER,
          abi: RouterABI.abi,
          functionName: "swapExactETHForTokens",
          args: [minOutput, swapPath, address, deadline],
          value: inputAmountBigInt,
        });
      } else {
        hash = await client.writeContract({
          address: UNISWAP_V2_ROUTER,
          abi: RouterABI.abi,
          functionName: "swapExactTokensForTokens",
          args: [inputAmountBigInt, minOutput, swapPath, address, deadline],
        });
      }

      setTxStatus("confirming", "Waiting for on-chain confirmation...");
      await client.waitForUserOperationReceipt({ hash, timeout: 120_000 });

      const outputAmount = Number(estimatedOutput) / 1e18;
      if (outputAmount > 0) trackSwapEvent(outputAmount * 50);
      trackTransaction();

      setSwapTxHash(hash);
      setInputAmount("");
      setTxStatus("success", `Swapped ${inputToken} for ${outputAmount.toFixed(2)} RUB!`, hash);
      showToast("success", "Swap Complete!", `Successfully swapped ${inputToken} for ${outputAmount.toFixed(2)} RUB.`);
      refetchAllowance();
    } catch (err: any) {
      console.error("[Swap] Swap failed:", err);
      const msg = err?.message || "Transaction was rejected or failed on-chain.";
      setTxStatus("error", msg, undefined, msg);
      showToast("error", "Swap Failed", msg);
    } finally {
      setSwapLoading(false);
    }
  }, [
    address,
    inputToken,
    inputAmountBigInt,
    estimatedOutput,
    minOutput,
    swapPath,
    showToast,
    kernelClient,
    isZeroDevReady,
    isZeroDevLoading,
    zeroDevError,
    refetchAllowance,
    showTxModal,
    setTxStatus,
  ]);

  const inputBalance =
    inputToken === "ETH"
      ? ethBalance?.value ?? 0n
      : (arbBalance as bigint) ?? 0n;

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
    isApproving: approveLoading,
    swap,
    isSwapping: swapLoading,
    isLoading: swapLoading || approveLoading,
    isSwapSuccess: false,
    swapTxHash,
  };
}
