const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-integration-e21v.onrender.com/api/v1";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("rubbi_token") : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.message || "API Error");
    }

    return { data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Network error" };
  }
}

// Auth Types
export interface RegisterRequest {
  walletAddress: string;
  signature: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    walletAddress: string;
    cardLastFour: string;
    cardExpiry: string;
  };
}

export interface LoginRequest {
  walletAddress: string;
  signature: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    walletAddress: string;
    cardLastFour: string;
    cardExpiry: string;
  };
}

// Subscription Types
export interface SubscriptionPlan {
  id: number;
  name: string;
  fee: string;
  active: boolean;
}

export interface UserSubscription {
  id: string;
  name: string;
  fee: string;
  active: boolean;
  subPlanId: number;
  userAddress: string;
}

// Card Types
export interface CardInfo {
  id: string;
  lastFour: string;
  expiry: string;
  status: "active" | "frozen" | "inactive";
  network: string;
}

// Transactions
export interface Transaction {
  id: string;
  type: "deposit" | "subscription" | "withdrawal" | "topup";
  amount: string;
  status: "pending" | "completed" | "failed";
  timestamp: string;
  txHash?: string;
}

// API Client
export const api = {
  // Auth
  auth: {
    register: (walletAddress: string, signature: string) =>
      fetchApi<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ walletAddress, signature }),
      }),

    login: (walletAddress: string, signature: string) =>
      fetchApi<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ walletAddress, signature }),
      }),
  },

  // Subscriptions
  subscriptions: {
    plans: () => fetchApi<SubscriptionPlan[]>("/subscriptions/plans"),
    me: () => fetchApi<UserSubscription[]>("/subscriptions/me"),
    start: (planId: number, signature: string) =>
      fetchApi<{ success: boolean }>("/subscriptions/start", {
        method: "POST",
        body: JSON.stringify({ planId, signature }),
      }),
    pause: (planId: number, signature: string) =>
      fetchApi<{ success: boolean }>(`/subscriptions/${planId}/pause`, {
        method: "POST",
        body: JSON.stringify({ signature }),
      }),
    resume: (planId: number, signature: string) =>
      fetchApi<{ success: boolean }>(`/subscriptions/${planId}/resume`, {
        method: "POST",
        body: JSON.stringify({ signature }),
      }),
  },

  // Cards
  cards: {
    me: () => fetchApi<CardInfo>("/cards/me"),
    freeze: () => fetchApi<{ success: boolean }>("/cards/freeze", { method: "POST" }),
    unfreeze: () => fetchApi<{ success: boolean }>("/cards/unfreeze", { method: "POST" }),
    reveal: () => fetchApi<{ pan: string }>("/cards/me/number"),
  },

  // Deposits
  deposits: {
    create: (amount: string) =>
      fetchApi<{ depositAddress: string; amount: string }>("/deposits", {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
    status: (depositId: string) =>
      fetchApi<{ status: string; confirmations: number }>(`/deposits/${depositId}`),
  },

  // Transactions
  transactions: {
    list: (page = 1, limit = 10) =>
      fetchApi<{ transactions: Transaction[]; total: number }>(
        `/transactions?page=${page}&limit=${limit}`
      ),
  },
};

// Helper to store token
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("rubbi_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("rubbi_token");
  }
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("rubbi_token");
  }
}