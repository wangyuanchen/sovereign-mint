import { NextResponse } from "next/server";
import { createPublicClient, decodeEventLog, formatUnits, http } from "viem";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  ERC20_ABI,
  getPaymentTokenConfig,
  PRICING,
  type PlanType,
  type SupportedChainId,
} from "@/lib/contracts";
import { MONTHLY_QUOTA } from "@/lib/models";

const CLIENTS = {
  1: createPublicClient({ chain: mainnet, transport: http() }),
  10: createPublicClient({ chain: optimism, transport: http() }),
  137: createPublicClient({ chain: polygon, transport: http() }),
  42161: createPublicClient({ chain: arbitrum, transport: http() }),
  8453: createPublicClient({ chain: base, transport: http() }),
} as const;

const MERCHANT_WALLET = process.env.NEXT_PUBLIC_MERCHANT_WALLET!.toLowerCase();

export async function POST(request: Request) {
  try {
    const { txHash, walletAddress, plan, chainId } = await request.json();

    if (!txHash || !walletAddress || !plan || !chainId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!["unlock", "boost"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    const tokenConfig = getPaymentTokenConfig(Number(chainId));
    if (!tokenConfig) {
      return NextResponse.json(
        { error: "Unsupported payment chain" },
        { status: 400 }
      );
    }

    const normalizedWallet = walletAddress.toLowerCase();

    // Check if tx already used
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.txHash, txHash),
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Transaction already processed" },
        { status: 400 }
      );
    }

    // Get transaction receipt
    const publicClient = CLIENTS[tokenConfig.chainId as SupportedChainId];
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt || receipt.status !== "success") {
      return NextResponse.json(
        { error: "Transaction not confirmed or failed" },
        { status: 400 }
      );
    }

    // Parse Transfer logs from chain-specific USDT token contract.
    const transferLog = receipt.logs.find(
      (log) => log.address.toLowerCase() === tokenConfig.address.toLowerCase()
    );

    if (!transferLog) {
      return NextResponse.json(
        { error: "No USDT transfer found in transaction" },
        { status: 400 }
      );
    }

    const decodedLog = decodeEventLog({
      abi: ERC20_ABI,
      data: transferLog.data,
      topics: transferLog.topics,
      eventName: "Transfer",
    });

    if (!decodedLog.args?.to || !decodedLog.args?.value) {
      return NextResponse.json(
        { error: "Failed to decode transfer event" },
        { status: 400 }
      );
    }

    const to = decodedLog.args.to.toLowerCase();
    const amount = decodedLog.args.value;

    // Verify recipient is merchant wallet
    if (to !== MERCHANT_WALLET) {
      return NextResponse.json(
        { error: "Invalid recipient" },
        { status: 400 }
      );
    }

    // Verify amount matches plan
    const expectedAmount =
      BigInt(PRICING[plan as PlanType]) * BigInt(10 ** tokenConfig.decimals);
    if (amount < expectedAmount) {
      return NextResponse.json(
        { error: "Insufficient payment amount" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalizedWallet),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Apply plan benefits
    if (plan === "unlock") {
      // Unlock paid models access + set monthly quota to paid tier
      await db
        .update(users)
        .set({
          hasPaidAccess: true,
          monthlyQuota: MONTHLY_QUOTA.PAID_GENERATIONS,
        })
        .where(eq(users.walletAddress, normalizedWallet));
    } else if (plan === "boost") {
      // Add boost credits
      await db
        .update(users)
        .set({
          boostCredits: user.boostCredits + MONTHLY_QUOTA.BOOST_PACK_SIZE,
        })
        .where(eq(users.walletAddress, normalizedWallet));
    }

    // Record payment
    await db.insert(payments).values({
      txHash,
      walletAddress: normalizedWallet,
      plan: plan as PlanType,
      amountUsdt: formatUnits(amount, tokenConfig.decimals),
      chainId: tokenConfig.chainId,
      tokenAddress: tokenConfig.address.toLowerCase(),
    });

    // Get updated user
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalizedWallet),
    });

    return NextResponse.json({
      success: true,
      user: {
        hasPaidAccess: updatedUser?.hasPaidAccess,
        monthlyQuota: updatedUser?.monthlyQuota,
        usedThisMonth: updatedUser?.usedThisMonth,
        boostCredits: updatedUser?.boostCredits,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
