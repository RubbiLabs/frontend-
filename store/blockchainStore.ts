import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubscriptionPlan, Subscriber, Stream } from "@/types";

interface BlockchainState {
  isCorrectNetwork: boolean;
  setIsCorrectNetwork: (val: boolean) => void;
  
  subscriptionPlans: SubscriptionPlan[];
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void;
  
  userSubscriptions: Subscriber[];
  setUserSubscriptions: (subs: Subscriber[]) => void;
  
  dailyStreams: Stream[];
  setDailyStreams: (streams: Stream[]) => void;
  
  monthlyStreams: Stream[];
  setMonthlyStreams: (streams: Stream[]) => void;
  
  userBalance: string;
  setUserBalance: (balance: string) => void;
  
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
}

export const useBlockchainStore = create<BlockchainState>()(
  persist(
    (set) => ({
      isCorrectNetwork: false,
      setIsCorrectNetwork: (val) => set({ isCorrectNetwork: val }),
      
      subscriptionPlans: [],
      setSubscriptionPlans: (plans) => set({ subscriptionPlans: plans }),
      
      userSubscriptions: [],
      setUserSubscriptions: (subs) => set({ userSubscriptions: subs }),
      
      dailyStreams: [],
      setDailyStreams: (streams) => set({ dailyStreams: streams }),
      
      monthlyStreams: [],
      setMonthlyStreams: (streams) => set({ monthlyStreams: streams }),
      
      userBalance: "0",
      setUserBalance: (balance) => set({ userBalance: balance }),
      
      isLoading: false,
      setIsLoading: (val) => set({ isLoading: val }),
      
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: "rubbi-blockchain-storage",
      partialize: (state) => ({
        subscriptionPlans: state.subscriptionPlans,
        userSubscriptions: state.userSubscriptions,
        dailyStreams: state.dailyStreams,
        monthlyStreams: state.monthlyStreams,
      }),
    }
  )
);