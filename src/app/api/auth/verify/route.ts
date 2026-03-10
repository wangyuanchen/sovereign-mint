import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import {
  verifyNonce,
  getMessage,
  createSession,
  setSessionCookie,
  getOrCreateUser,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { walletAddress, signature, nonce } = await request.json();

    if (!walletAddress || !signature || !nonce) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify nonce
    if (!verifyNonce(walletAddress, nonce)) {
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 401 }
      );
    }

    // Verify signature
    const message = getMessage(nonce);
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Get or create user
    const user = await getOrCreateUser(walletAddress);

    // Create session
    const token = await createSession(walletAddress);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        hasPaidAccess: user.hasPaidAccess,
        monthlyQuota: user.monthlyQuota,
        usedThisMonth: user.usedThisMonth,
        boostCredits: user.boostCredits,
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
