import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MONTHLY_QUOTA } from "@/lib/models";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "sovereign-mint-session";

export interface Session {
  walletAddress: string;
  hasPaidAccess: boolean;
  monthlyQuota: number;
  usedThisMonth: number;
  boostCredits: number;
}

// In-memory nonce store (in production, use Redis or similar)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

export function generateNonce(): string {
  const nonce = nanoid(32);
  return nonce;
}

export function storeNonce(walletAddress: string, nonce: string): void {
  nonceStore.set(walletAddress.toLowerCase(), {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
}

export function verifyNonce(walletAddress: string, nonce: string): boolean {
  const stored = nonceStore.get(walletAddress.toLowerCase());
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    nonceStore.delete(walletAddress.toLowerCase());
    return false;
  }
  if (stored.nonce !== nonce) return false;
  nonceStore.delete(walletAddress.toLowerCase());
  return true;
}

export async function createSession(walletAddress: string): Promise<string> {
  const token = await new SignJWT({ walletAddress: walletAddress.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const walletAddress = payload.walletAddress as string;

    // Fetch user from database
    const user = await db.query.users.findFirst({
      where: eq(users.walletAddress, walletAddress),
    });

    if (!user) return null;

    return {
      walletAddress: user.walletAddress,
      hasPaidAccess: user.hasPaidAccess,
      monthlyQuota: user.monthlyQuota,
      usedThisMonth: user.usedThisMonth,
      boostCredits: user.boostCredits,
    };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getOrCreateUser(walletAddress: string) {
  const normalizedAddress = walletAddress.toLowerCase();
  
  let user = await db.query.users.findFirst({
    where: eq(users.walletAddress, normalizedAddress),
  });

  if (!user) {
    // Set quota reset date to next month's 1st
    const now = new Date();
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    await db.insert(users).values({
      walletAddress: normalizedAddress,
      hasPaidAccess: false,
      monthlyQuota: MONTHLY_QUOTA.FREE_GENERATIONS,
      usedThisMonth: 0,
      quotaResetDate: nextReset,
      boostCredits: 0,
    });
    
    user = await db.query.users.findFirst({
      where: eq(users.walletAddress, normalizedAddress),
    });
  }

  return user!;
}

export { getMessage } from "./auth-shared";
