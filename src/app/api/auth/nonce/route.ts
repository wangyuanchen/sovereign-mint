import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { generateNonce } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("address");

  if (!walletAddress || !isAddress(walletAddress)) {
    return NextResponse.json(
      { error: "Valid wallet address is required" },
      { status: 400 }
    );
  }

  const nonce = generateNonce(walletAddress);

  return NextResponse.json({ nonce });
}
