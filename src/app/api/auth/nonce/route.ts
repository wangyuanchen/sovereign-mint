import { NextResponse } from "next/server";
import { generateNonce, storeNonce } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("address");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  const nonce = generateNonce();
  storeNonce(walletAddress, nonce);

  return NextResponse.json({ nonce });
}
