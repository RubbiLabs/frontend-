import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from "wagmi";
import { useBlockchainStore } from "@/store/blockchainStore";
import SubscriptionServiceABI from "@/Abis/SubscriptionService.json";
import ModalABI from "@/Abis/Modal.json";
import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";

const MONAD_TESTNET_CHAIN_ID = 10143;

const subscriptionServiceAddress = process.env.NEXT_PUBLIC_SUBSCRIPTION_SERVICE_ADDRESS as `0x${string}`;
const modalContractAddress = process.env.NEXT_PUBLIC_MODAL_CONTRACT_ADDRESS as `0x${string}`;

export function useSubscription() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { showToast } = useToast();
  const { 
    subscriptionPlans, 
    setSubscriptionPlans, 
    userSubscriptions, 
    setUserSubscriptions,
    setIsCorrectNetwork,
    setIsLoading,
    setError 
  } = useBlockchainStore();

  useEffect(() => {
    setIsCorrectNetwork(chainId === MONAD_TESTNET_CHAIN_ID);
  }, [chainId, setIsCorrectNetwork]);

  const { data: plansData, isLoading: isLoadingPlans, refetch: refetchPlans } = useReadContract({
    address: subscriptionServiceAddress,
    abi: SubscriptionServiceABI.abi,
    functionName: "getAllSubscriptionPlans",
    query: {
      enabled: !!address && chainId === MONAD_TESTNET_CHAIN_ID,
    }
  });

  const { data: subsData, refetch: refetchSubs } = useReadContract({
    address: subscriptionServiceAddress,
    abi: SubscriptionServiceABI.abi,
    functionName: "getSubscriptionsOfAddress",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === MONAD_TESTNET_CHAIN_ID,
    }
  });

  useEffect(() => {
    if (plansData) {
      setSubscriptionPlans(plansData as any);
    }
  }, [plansData, setSubscriptionPlans]);

  useEffect(() => {
    if (subsData) {
      setUserSubscriptions(subsData as any);
    }
  }, [subsData, setUserSubscriptions]);

  const { writeContract: subscribe, data: subscribeHash } = useWriteContract();
  
  const { isLoading: isSubscribing, isSuccess: subscribeSuccess } = 
    useWaitForTransactionReceipt({ hash: subscribeHash });

  const startSubscription = async (planId: number, email: string, password: string) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }
    
    if (!address) {
      showToast("error", "Not Connected", "Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      subscribe({
        address: subscriptionServiceAddress,
        abi: SubscriptionServiceABI.abi,
        functionName: "startSubscription",
        args: [BigInt(planId), email, password],
      });
    } catch (err: any) {
      setError(err.message);
      showToast("error", "Subscription Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const { writeContract: pause, data: pauseHash } = useWriteContract();
  const { isLoading: isPausing } = useWaitForTransactionReceipt({ hash: pauseHash });

  const pauseSubscription = async (planId: number) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    try {
      pause({
        address: subscriptionServiceAddress,
        abi: SubscriptionServiceABI.abi,
        functionName: "pauseSubscription",
        args: [BigInt(planId)],
      });
      await refetchSubs();
    } catch (err: any) {
      showToast("error", "Pause Failed", err.message);
    }
  };

  const { writeContract: resume, data: resumeHash } = useWriteContract();
  const { isLoading: isResuming } = useWaitForTransactionReceipt({ hash: resumeHash });

  const resumeSubscription = async (planId: number) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    try {
      resume({
        address: subscriptionServiceAddress,
        abi: SubscriptionServiceABI.abi,
        functionName: "resumeSubscription",
        args: [BigInt(planId)],
      });
      await refetchSubs();
    } catch (err: any) {
      showToast("error", "Resume Failed", err.message);
    }
  };

  return {
    subscriptionPlans,
    userSubscriptions,
    isLoadingPlans,
    startSubscription,
    isSubscribing: isSubscribing || isPausing || isResuming,
    subscribeSuccess,
    pauseSubscription,
    resumeSubscription,
    refetchPlans,
    refetchSubs,
  };
}

export function useModalContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { setUserBalance, setIsCorrectNetwork } = useBlockchainStore();
  const { showToast } = useToast();

  useEffect(() => {
    setIsCorrectNetwork(chainId === MONAD_TESTNET_CHAIN_ID);
  }, [chainId, setIsCorrectNetwork]);

  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: modalContractAddress,
    abi: ModalABI.abi,
    functionName: "getBalances",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === MONAD_TESTNET_CHAIN_ID,
    }
  });

  useEffect(() => {
    if (balanceData) {
      setUserBalance((balanceData as bigint).toString());
    }
  }, [balanceData, setUserBalance]);

  const { writeContract: deposit, data: depositHash } = useWriteContract();
  const { isLoading: isDepositing } = useWaitForTransactionReceipt({ hash: depositHash });

  const depositFunds = async (amount: bigint) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    try {
      deposit({
        address: modalContractAddress,
        abi: ModalABI.abi,
        functionName: "deposit",
        args: [amount],
      });
      await refetchBalance();
    } catch (err: any) {
      showToast("error", "Deposit Failed", err.message);
    }
  };

  return {
    balance: balanceData ? (balanceData as bigint).toString() : "0",
    isDepositing,
    depositFunds,
    refetchBalance,
  };
}