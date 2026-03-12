import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      walletAddress: session.walletAddress,
      hasPaidAccess: session.hasPaidAccess,
      monthlyQuota: session.monthlyQuota,
      usedThisMonth: session.usedThisMonth,
      boostCredits: session.boostCredits,
    },
  });
}
