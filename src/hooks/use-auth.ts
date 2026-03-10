"use client";

import { useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { getMessage } from "@/lib/auth-shared";

interface AuthUser {
  walletAddress: string;
  hasPaidAccess: boolean;
  monthlyQuota: number;
  usedThisMonth: number;
  boostCredits: number;
}

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = useCallback(async () => {
    if (!address) return null;

    setIsAuthenticating(true);
    try {
      // Get nonce
      const nonceResponse = await fetch(`/api/auth/nonce?address=${address}`);
      if (!nonceResponse.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceResponse.json();

      // Sign message
      const message = getMessage(nonce);
      const signature = await signMessageAsync({ message });

      // Verify signature
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          nonce,
        }),
      });

      if (!verifyResponse.ok) throw new Error("Authentication failed");

      const { user: authUser } = await verifyResponse.json();
      setUser(authUser);
      return authUser;
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return {
    user,
    setUser,
    isConnected,
    address,
    authenticate,
    logout,
    isAuthenticating,
  };
}
