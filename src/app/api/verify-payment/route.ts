import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { USDC_ADDRESS, PRICING, type PlanType } from "@/lib/contracts";
import { MONTHLY_QUOTA } from "@/lib/models";

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const MERCHANT_WALLET = process.env.NEXT_PUBLIC_MERCHANT_WALLET!.toLowerCase();

export async function POST(request: Request) {
  try {
    const { txHash, walletAddress, plan } = await request.json();

    if (!txHash || !walletAddress || !plan) {
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
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt || receipt.status !== "success") {
      return NextResponse.json(
        { error: "Transaction not confirmed or failed" },
        { status: 400 }
      );
    }

    // Parse transfer event logs
    const transferLog = receipt.logs.find((log) => {
      return (
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
        log.topics[0] ===
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" // Transfer event signature
      );
    });

    if (!transferLog) {
      return NextResponse.json(
        { error: "No USDC transfer found in transaction" },
        { status: 400 }
      );
    }

    // Decode transfer parameters
    const to = `0x${transferLog.topics[2]?.slice(26)}`.toLowerCase();
    const amount = BigInt(transferLog.data);

    // Verify recipient is merchant wallet
    if (to !== MERCHANT_WALLET) {
      return NextResponse.json(
        { error: "Invalid recipient" },
        { status: 400 }
      );
    }

    // Verify amount matches plan
    const expectedAmount = BigInt(PRICING[plan as PlanType]) * BigInt(10 ** 6); // USDC has 6 decimals
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
      amountUsdc: formatUnits(amount, 6),
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
