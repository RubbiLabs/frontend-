import { useReadContract, useAccount, useChainId } from "wagmi";
import { useBlockchainStore } from "@/store/blockchainStore";
import { useContractWrite } from "@/hooks/useContractWrite";
import SalaryStreamingABI from "@/Abis/SalaryStreaming.json";
import { useEffect } from "react";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

const salaryStreamingAddress = process.env.NEXT_PUBLIC_SALARY_STREAMING_ADDRESS as `0x${string}`;

export interface StreamDetails {
  name: string;
  recipient: `0x${string}`;
  amount: bigint;
}

export function useSalaryStreaming() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { execute, isWriting } = useContractWrite();
  const {
    dailyStreams,
    setDailyStreams,
    monthlyStreams,
    setMonthlyStreams,
    setIsCorrectNetwork,
    setIsLoading,
    setError,
  } = useBlockchainStore();

  useEffect(() => {
    setIsCorrectNetwork(chainId === ARBITRUM_SEPOLIA_CHAIN_ID);
  }, [chainId, setIsCorrectNetwork]);

  const { data: dailyData, isLoading: isLoadingDaily, refetch: refetchDaily } = useReadContract({
    address: salaryStreamingAddress,
    abi: SalaryStreamingABI.abi,
    functionName: "getAllDailyStreams",
    query: { enabled: chainId === ARBITRUM_SEPOLIA_CHAIN_ID },
  });

  const { data: monthlyData, isLoading: isLoadingMonthly, refetch: refetchMonthly } = useReadContract({
    address: salaryStreamingAddress,
    abi: SalaryStreamingABI.abi,
    functionName: "getAllMonthlyStreams",
    query: { enabled: chainId === ARBITRUM_SEPOLIA_CHAIN_ID },
  });

  useEffect(() => {
    if (dailyData) setDailyStreams(dailyData as any);
  }, [dailyData, setDailyStreams]);

  useEffect(() => {
    if (monthlyData) setMonthlyStreams(monthlyData as any);
  }, [monthlyData, setMonthlyStreams]);

  const createStreamFn = async (streams: StreamDetails[], intervalType: 1 | 2) => {
    setIsLoading(true);
    setError(null);

    const txHash = await execute({
      abi: SalaryStreamingABI.abi as any,
      address: salaryStreamingAddress,
      functionName: "createStream",
      args: [streams, intervalType],
      backendSync: {
        endpoint: "salaryStreaming.create",
        params: {},
      },
      onSuccess: () => {
        refetchDaily();
        refetchMonthly();
      },
    });

    setIsLoading(false);
    return txHash;
  };

  const pauseDailyStream = async (streamId: number) => {
    await execute({
      abi: SalaryStreamingABI.abi as any,
      address: salaryStreamingAddress,
      functionName: "pauseDailyStream",
      args: [BigInt(streamId)],
      backendSync: {
        endpoint: "salaryStreaming.pause",
        params: { streamId },
      },
      onSuccess: () => refetchDaily(),
    });
  };

  const pauseMonthlyStream = async (streamId: number) => {
    await execute({
      abi: SalaryStreamingABI.abi as any,
      address: salaryStreamingAddress,
      functionName: "pauseMonthlyStream",
      args: [BigInt(streamId)],
      backendSync: {
        endpoint: "salaryStreaming.pause",
        params: { streamId },
      },
      onSuccess: () => refetchMonthly(),
    });
  };

  const resumeDailyStream = async (streamId: number) => {
    await execute({
      abi: SalaryStreamingABI.abi as any,
      address: salaryStreamingAddress,
      functionName: "resumeDailyStream",
      args: [BigInt(streamId)],
      backendSync: {
        endpoint: "salaryStreaming.resume",
        params: { streamId },
      },
      onSuccess: () => refetchDaily(),
    });
  };

  const resumeMonthlyStream = async (streamId: number) => {
    await execute({
      abi: SalaryStreamingABI.abi as any,
      address: salaryStreamingAddress,
      functionName: "resumeMonthlyStream",
      args: [BigInt(streamId)],
      backendSync: {
        endpoint: "salaryStreaming.resume",
        params: { streamId },
      },
      onSuccess: () => refetchMonthly(),
    });
  };

  const disburseDaily = async () => {
    await execute({
      abi: SalaryStreamingABI.abi as any,
      address: salaryStreamingAddress,
      functionName: "disburseDaily",
      backendSync: {
        endpoint: "salaryStreaming.disburse",
        params: {},
      },
      onSuccess: () => refetchDaily(),
    });
  };

  const disburseMonthly = async () => {
    await execute({
      abi: SalaryStreamingABI.abi as any,
      address: salaryStreamingAddress,
      functionName: "disburseMonthly",
      backendSync: {
        endpoint: "salaryStreaming.disburse",
        params: {},
      },
      onSuccess: () => refetchMonthly(),
    });
  };

  return {
    dailyStreams,
    monthlyStreams,
    isLoading: isLoadingDaily || isLoadingMonthly,
    createStream: createStreamFn,
    isCreating: isWriting,
    pauseDailyStream,
    pauseMonthlyStream,
    resumeDailyStream,
    resumeMonthlyStream,
    disburseDaily,
    disburseMonthly,
    refetchDaily,
    refetchMonthly,
  };
}
