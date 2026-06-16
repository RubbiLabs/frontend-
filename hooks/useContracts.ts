import { useReadContract, useChainId } from "wagmi";
import { useBlockchainStore } from "@/store/blockchainStore";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useEffectiveAddress } from "@/hooks/useEffectiveAddress";
import SubscriptionServiceABI from "@/Abis/SubscriptionService.json";
import ModalABI from "@/Abis/Modal.json";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

const subscriptionServiceAddress = process.env.NEXT_PUBLIC_SUBSCRIPTION_SERVICE_ADDRESS as `0x${string}`;
const modalContractAddress = process.env.NEXT_PUBLIC_MODAL_CONTRACT_ADDRESS as `0x${string}`;

export function useSubscription() {
  const address = useEffectiveAddress();
  const chainId = useChainId();
  const { showToast } = useToast();
  const { execute, isWriting } = useContractWrite();
  const {
    subscriptionPlans,
    setSubscriptionPlans,
    userSubscriptions,
    setUserSubscriptions,
    setIsCorrectNetwork,
    setIsLoading,
    setError,
  } = useBlockchainStore();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsCorrectNetwork(chainId === ARBITRUM_SEPOLIA_CHAIN_ID);
  }, [chainId, setIsCorrectNetwork]);

  const { data: plansData, isLoading: isLoadingPlans, refetch: refetchPlans } = useReadContract({
    address: subscriptionServiceAddress,
    abi: SubscriptionServiceABI.abi,
    functionName: "getAllSubscriptionPlans",
    query: {
      enabled: !!address && chainId === ARBITRUM_SEPOLIA_CHAIN_ID,
    },
  });

  const { data: subsData, refetch: refetchSubs } = useReadContract({
    address: subscriptionServiceAddress,
    abi: SubscriptionServiceABI.abi,
    functionName: "getSubscriptionsOfAddress",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === ARBITRUM_SEPOLIA_CHAIN_ID,
    },
  });

  useEffect(() => {
    if (plansData) setSubscriptionPlans(plansData as any);
  }, [plansData, setSubscriptionPlans]);

  useEffect(() => {
    if (subsData) setUserSubscriptions(subsData as any);
  }, [subsData, setUserSubscriptions]);

  const startSubscription = async (planId: number, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    const txHash = await execute({
      abi: SubscriptionServiceABI.abi as any,
      address: subscriptionServiceAddress,
      functionName: "startSubscription",
      args: [BigInt(planId), email, password],
      backendSync: {
        endpoint: "subscriptions.start",
        params: { planId },
      },
      onSuccess: () => {
        refetchSubs();
        refetchPlans();
        setIsSuccess(true);
      },
    });

    setIsLoading(false);
    return txHash;
  };

  const pauseSubscription = async (planId: number) => {
    const txHash = await execute({
      abi: SubscriptionServiceABI.abi as any,
      address: subscriptionServiceAddress,
      functionName: "pauseSubscription",
      args: [BigInt(planId)],
      backendSync: {
        endpoint: "subscriptions.pause",
        params: { planId },
      },
      onSuccess: () => {
        refetchSubs();
      },
    });
    return txHash;
  };

  const resumeSubscription = async (planId: number) => {
    const txHash = await execute({
      abi: SubscriptionServiceABI.abi as any,
      address: subscriptionServiceAddress,
      functionName: "resumeSubscription",
      args: [BigInt(planId)],
      backendSync: {
        endpoint: "subscriptions.resume",
        params: { planId },
      },
      onSuccess: () => {
        refetchSubs();
      },
    });
    return txHash;
  };

  return {
    subscriptionPlans,
    userSubscriptions,
    isLoadingPlans,
    startSubscription,
    isSubscribing: isWriting,
    subscribeSuccess: isSuccess,
    pauseSubscription,
    resumeSubscription,
    refetchPlans,
    refetchSubs,
  };
}

export function useModalContract() {
  const address = useEffectiveAddress();
  const chainId = useChainId();
  const { setUserBalance, setIsCorrectNetwork } = useBlockchainStore();
  const { showToast } = useToast();
  const { execute, isWriting } = useContractWrite();

  useEffect(() => {
    setIsCorrectNetwork(chainId === ARBITRUM_SEPOLIA_CHAIN_ID);
  }, [chainId, setIsCorrectNetwork]);

  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: modalContractAddress,
    abi: ModalABI.abi,
    functionName: "getBalances",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === ARBITRUM_SEPOLIA_CHAIN_ID,
    },
  });

  useEffect(() => {
    if (balanceData) setUserBalance((balanceData as bigint).toString());
  }, [balanceData, setUserBalance]);

  const depositFunds = async (amount: bigint) => {
    await execute({
      abi: ModalABI.abi as any,
      address: modalContractAddress,
      functionName: "deposit",
      args: [amount],
      onSuccess: () => refetchBalance(),
    });
  };

  const withdrawFunds = async (amount: bigint) => {
    await execute({
      abi: ModalABI.abi as any,
      address: modalContractAddress,
      functionName: "withdraw",
      args: [amount],
      onSuccess: () => refetchBalance(),
    });
  };

  return {
    balance: balanceData ? (balanceData as bigint).toString() : "0",
    isDepositing: isWriting,
    depositFunds,
    isWithdrawing: isWriting,
    withdrawFunds,
    refetchBalance,
  };
}
