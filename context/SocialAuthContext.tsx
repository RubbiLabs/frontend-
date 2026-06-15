"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { Hex } from "viem";

interface SocialAuthContextValue {
  socialUser: SocialUser | null;
  isSocialLogin: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutSocial: () => void;
  socialAddress: Hex | null;
  isSocialLoading: boolean;
}

interface SocialUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  provider: "google";
}

const SocialAuthContext = createContext<SocialAuthContextValue>({
  socialUser: null,
  isSocialLogin: false,
  loginWithGoogle: async () => {},
  logoutSocial: () => {},
  socialAddress: null,
  isSocialLoading: false,
});

const SOCIAL_AUTH_KEY = "rubbi_social_auth";
const SOCIAL_WALLET_KEY = "rubbi_social_wallet";

function getSocialLoginAccount() {
  const pk = process.env.NEXT_PUBLIC_SOCIAL_LOGIN_PRIVATE_KEY;
  if (!pk) {
    console.warn("[SocialAuth] NEXT_PUBLIC_SOCIAL_LOGIN_PRIVATE_KEY not set. Social login unavailable.");
    return null;
  }
  const normalized = pk.startsWith("0x") ? pk : `0x${pk}`;
  return privateKeyToAccount(normalized as Hex);
}

export function SocialAuthProvider({ children }: { children: ReactNode }) {
  const [socialUser, setSocialUser] = useState<SocialUser | null>(null);
  const [socialAddress, setSocialAddress] = useState<Hex | null>(null);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(SOCIAL_AUTH_KEY);
      if (stored) {
        const user = JSON.parse(stored) as SocialUser;
        setSocialUser(user);
        const walletStored = localStorage.getItem(SOCIAL_WALLET_KEY);
        if (walletStored) {
          const wallet = JSON.parse(walletStored);
          setSocialAddress(wallet.address as Hex);
        }
      }
    } catch {}
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsSocialLoading(true);
    try {
      const account = getSocialLoginAccount();
      if (!account) {
        throw new Error("Social login not configured. Set NEXT_PUBLIC_SOCIAL_LOGIN_PRIVATE_KEY in your .env file.");
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

      if (!clientId) {
        const mockUser: SocialUser = {
          id: `google_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          email: `user${Math.floor(Math.random() * 9999)}@gmail.com`,
          name: "Rubbi User",
          picture: "",
          provider: "google",
        };

        setSocialUser(mockUser);
        setSocialAddress(account.address);
        localStorage.setItem(SOCIAL_AUTH_KEY, JSON.stringify(mockUser));
        localStorage.setItem(SOCIAL_WALLET_KEY, JSON.stringify({ address: account.address }));
        setIsSocialLoading(false);
        return;
      }

      const width = 500, height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.origin + "/auth/google")}&response_type=id_token&scope=openid email profile&nonce=${Math.random().toString(36).slice(2)}&prompt=select_account`;

      window.open(authUrl, "google-auth", `width=${width},height=${height},left=${left},top=${top}`);

      const result = await new Promise<{ idToken: string; user: SocialUser }>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Auth timeout")), 120000);
        const handler = (event: MessageEvent) => {
          if (event.data?.type === "google-auth-success") {
            clearTimeout(timeout);
            window.removeEventListener("message", handler);
            resolve(event.data);
          } else if (event.data?.type === "google-auth-error") {
            clearTimeout(timeout);
            window.removeEventListener("message", handler);
            reject(new Error(event.data.error));
          }
        };
        window.addEventListener("message", handler);
      });

      setSocialUser(result.user);
      setSocialAddress(account.address);
      localStorage.setItem(SOCIAL_AUTH_KEY, JSON.stringify(result.user));
      localStorage.setItem(SOCIAL_WALLET_KEY, JSON.stringify({ address: account.address }));
    } catch (err: any) {
      console.error("Social login error:", err);
      throw err;
    } finally {
      setIsSocialLoading(false);
    }
  }, []);

  const logoutSocial = useCallback(() => {
    setSocialUser(null);
    setSocialAddress(null);
    localStorage.removeItem(SOCIAL_AUTH_KEY);
    localStorage.removeItem(SOCIAL_WALLET_KEY);
  }, []);

  return (
    <SocialAuthContext.Provider
      value={{
        socialUser,
        isSocialLogin: !!socialUser,
        loginWithGoogle,
        logoutSocial,
        socialAddress,
        isSocialLoading,
      }}
    >
      {children}
    </SocialAuthContext.Provider>
  );
}

export function useSocialAuth() {
  return useContext(SocialAuthContext);
}
