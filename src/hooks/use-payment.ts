"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import {
  getPaymentTokenConfig,
  ERC20_ABI,
  getPriceInUnits,
  type PlanType,
  type SupportedChainId,
} from "@/lib/contracts";

const MERCHANT_WALLET = process.env.NEXT_PUBLIC_MERCHANT_WALLET as `0x${string}`;

export function usePayment() {
  const [isPaying, setIsPaying] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: pendingTxHash ?? undefined,
    });

  const pay = async (
    plan: PlanType,
    walletAddress: string,
    chainId: SupportedChainId
  ): Promise<boolean> => {
    setIsPaying(true);
    try {
      const tokenConfig = getPaymentTokenConfig(chainId);
      if (!tokenConfig) {
        throw new Error("Unsupported payment chain");
      }

      const amount = getPriceInUnits(plan, tokenConfig.decimals);

      // Send USDT transfer on selected chain.
      const txHash = await writeContractAsync({
        chainId: tokenConfig.chainId,
        address: tokenConfig.address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [MERCHANT_WALLET, amount],
      });

      setPendingTxHash(txHash);
      toast.info("Transaction submitted. Waiting for confirmation...");

      // Wait for confirmation
      // Note: The actual waiting is handled by the hook, we just verify
      const verifyResponse = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash,
          walletAddress,
          plan,
          chainId,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || "Payment verification failed");
      }

      toast.success("Payment successful! Credits added.");
      return true;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
      return false;
    } finally {
      setIsPaying(false);
      setPendingTxHash(null);
    }
  };

  return {
    pay,
    isPaying,
    isConfirming,
    isConfirmed,
  };
}
