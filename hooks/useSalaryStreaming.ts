import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from "wagmi";
import { useBlockchainStore } from "@/store/blockchainStore";
import SalaryStreamingABI from "@/Abis/SalaryStreaming.json";
import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";

const MONAD_TESTNET_CHAIN_ID = 10143;

const salaryStreamingAddress = process.env.NEXT_PUBLIC_SALARY_STREAMING_ADDRESS as `0x${string}`;

export interface StreamDetails {
  name: string;
  recipient: `0x${string}`;
  amount: bigint;
}

export function useSalaryStreaming() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { showToast } = useToast();
  const { 
    dailyStreams, 
    setDailyStreams, 
    monthlyStreams, 
    setMonthlyStreams,
    setIsCorrectNetwork,
    setIsLoading,
    setError 
  } = useBlockchainStore();

  useEffect(() => {
    setIsCorrectNetwork(chainId === MONAD_TESTNET_CHAIN_ID);
  }, [chainId, setIsCorrectNetwork]);

  const { data: dailyData, isLoading: isLoadingDaily, refetch: refetchDaily } = useReadContract({
    address: salaryStreamingAddress,
    abi: SalaryStreamingABI.abi,
    functionName: "getAllDailyStreams",
    query: {
      enabled: chainId === MONAD_TESTNET_CHAIN_ID,
    }
  });

  const { data: monthlyData, isLoading: isLoadingMonthly, refetch: refetchMonthly } = useReadContract({
    address: salaryStreamingAddress,
    abi: SalaryStreamingABI.abi,
    functionName: "getAllMonthlyStreams",
    query: {
      enabled: chainId === MONAD_TESTNET_CHAIN_ID,
    }
  });

  useEffect(() => {
    if (dailyData) {
      setDailyStreams(dailyData as any);
    }
  }, [dailyData, setDailyStreams]);

  useEffect(() => {
    if (monthlyData) {
      setMonthlyStreams(monthlyData as any);
    }
  }, [monthlyData, setMonthlyStreams]);

  const { writeContract: createStream, data: createHash } = useWriteContract();
  const { isLoading: isCreating, isSuccess: createSuccess } = 
    useWaitForTransactionReceipt({ hash: createHash });

  const createStreamFn = async (streams: StreamDetails[], intervalType: 1 | 2) => {
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
      createStream({
        address: salaryStreamingAddress,
        abi: SalaryStreamingABI.abi,
        functionName: "createStream",
        args: [streams, intervalType],
      });
    } catch (err: any) {
      setError(err.message);
      showToast("error", "Stream Creation Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const { writeContract: pauseDaily, data: pauseDailyHash } = useWriteContract();
  const { isLoading: isPausingDaily } = useWaitForTransactionReceipt({ hash: pauseDailyHash });

  const pauseDailyStream = async (streamId: number) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    try {
      pauseDaily({
        address: salaryStreamingAddress,
        abi: SalaryStreamingABI.abi,
        functionName: "pauseDailyStream",
        args: [BigInt(streamId)],
      });
      await refetchDaily();
    } catch (err: any) {
      showToast("error", "Pause Failed", err.message);
    }
  };

  const { writeContract: pauseMonthly, data: pauseMonthlyHash } = useWriteContract();
  const { isLoading: isPausingMonthly } = useWaitForTransactionReceipt({ hash: pauseMonthlyHash });

  const pauseMonthlyStream = async (streamId: number) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    try {
      pauseMonthly({
        address: salaryStreamingAddress,
        abi: SalaryStreamingABI.abi,
        functionName: "pauseMonthlyStream",
        args: [BigInt(streamId)],
      });
      await refetchMonthly();
    } catch (err: any) {
      showToast("error", "Pause Failed", err.message);
    }
  };

  const { writeContract: resumeDaily, data: resumeDailyHash } = useWriteContract();
  const { isLoading: isResumingDaily } = useWaitForTransactionReceipt({ hash: resumeDailyHash });

  const resumeDailyStream = async (streamId: number) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    try {
      resumeDaily({
        address: salaryStreamingAddress,
        abi: SalaryStreamingABI.abi,
        functionName: "resumeDailyStream",
        args: [BigInt(streamId)],
      });
      await refetchDaily();
    } catch (err: any) {
      showToast("error", "Resume Failed", err.message);
    }
  };

  const { writeContract: resumeMonthly, data: resumeMonthlyHash } = useWriteContract();
  const { isLoading: isResumingMonthly } = useWaitForTransactionReceipt({ hash: resumeMonthlyHash });

  const resumeMonthlyStream = async (streamId: number) => {
    if (chainId !== MONAD_TESTNET_CHAIN_ID) {
      showToast("error", "Wrong Network", "Please switch to Monad Testnet");
      return;
    }

    try {
      resumeMonthly({
        address: salaryStreamingAddress,
        abi: SalaryStreamingABI.abi,
        functionName: "resumeMonthlyStream",
        args: [BigInt(streamId)],
      });
      await refetchMonthly();
    } catch (err: any) {
      showToast("error", "Resume Failed", err.message);
    }
  };

  return {
    dailyStreams,
    monthlyStreams,
    isLoading: isLoadingDaily || isLoadingMonthly,
    createStream: createStreamFn,
    isCreating: isCreating || isPausingDaily || isPausingMonthly || isResumingDaily || isResumingMonthly,
    createSuccess,
    pauseDailyStream,
    pauseMonthlyStream,
    resumeDailyStream,
    resumeMonthlyStream,
    refetchDaily,
    refetchMonthly,
  };
}