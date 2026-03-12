import { NextResponse } from "next/server";
import {
  decodeAbiParameters,
  isAddress,
  verifyMessage,
  type Signature,
} from "viem";
import {
  verifyNonce,
  getMessage,
  createSession,
  setSessionCookie,
  getOrCreateUser,
} from "@/lib/auth";

const EIP6492_MAGIC_SUFFIX =
  "6492649264926492649264926492649264926492649264926492649264926492";

function normalize65ByteSignature(
  sig: `0x${string}`
): `0x${string}` | Signature | null {
  const hexBody = sig.slice(2);
  if (hexBody.length !== 130) return null;

  const r = `0x${hexBody.slice(0, 64)}` as `0x${string}`;
  const s = `0x${hexBody.slice(64, 128)}` as `0x${string}`;
  const vByte = parseInt(hexBody.slice(128, 130), 16);

  // Normal 27/28 and recovery 0/1 are both seen in the wild.
  if (vByte === 27 || vByte === 28) return sig;
  if (vByte === 0 || vByte === 1) {
    return {
      r,
      s,
      v: BigInt(27 + vByte),
      yParity: vByte,
    };
  }
  return null;
}

function parseWalletSignature(
  raw: unknown,
  depth = 0
): `0x${string}` | Signature | null {
  if (depth > 3) return null;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^0x[0-9a-fA-F]+$/.test(trimmed)) return null;

  const hexBody = trimmed.slice(2);

  if (hexBody.length === 130) {
    // Standard 65-byte signature: r (32) + s (32) + v (1)
    return normalize65ByteSignature(trimmed as `0x${string}`);
  }

  if (hexBody.length === 128) {
    // EIP-2098 compact 64-byte signature: r (32) + yParityAndS (32)
    // Bit 255 of yParityAndS encodes yParity (v = 27 + yParity).
    const r = `0x${hexBody.slice(0, 64)}` as `0x${string}`;
    const yParityAndS = BigInt(`0x${hexBody.slice(64, 128)}`);
    const yParity = Number((yParityAndS >> 255n) & 1n);
    const s = yParityAndS & ((1n << 255n) - 1n);
    return {
      r,
      s: `0x${s.toString(16).padStart(64, "0")}` as `0x${string}`,
      v: BigInt(27 + yParity),
      yParity,
    };
  }

  // EIP-6492 wrapped signature:
  // abi.encode(address factory, bytes calldata, bytes innerSig) + magicSuffix
  if (hexBody.endsWith(EIP6492_MAGIC_SUFFIX)) {
    const encoded = `0x${hexBody.slice(0, -EIP6492_MAGIC_SUFFIX.length)}` as const;
    try {
      const [, , innerSig] = decodeAbiParameters(
        [
          { type: "address" },
          { type: "bytes" },
          { type: "bytes" },
        ],
        encoded
      );
      return parseWalletSignature(innerSig, depth + 1);
    } catch {
      return null;
    }
  }

  // Unknown wrapped formats: try last 65 bytes as a defensive fallback.
  if (hexBody.length > 130) {
    const tail65 = `0x${hexBody.slice(-130)}` as `0x${string}`;
    return normalize65ByteSignature(tail65);
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const { walletAddress, signature, nonce } = await request.json();

    if (!walletAddress || !signature || !nonce) {
      console.error("[Auth] Missing fields", { walletAddress: !!walletAddress, signature: !!signature, nonce: !!nonce });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      console.error("[Auth] Invalid wallet address", { walletAddress });
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const parsedSignature = parseWalletSignature(signature);
    if (!parsedSignature) {
      console.error("[Auth] Unsupported signature format", {
        length: typeof signature === "string" ? signature.length : 0,
        prefix: typeof signature === "string" ? signature.slice(0, 6) : "",
      });
      return NextResponse.json(
        { error: "Unsupported signature format" },
        { status: 400 }
      );
    }

    // Verify nonce
    if (!verifyNonce(walletAddress, nonce)) {
      console.error("[Auth] Nonce verification failed", { walletAddress });
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 401 }
      );
    }

    // Verify signature — handles both 65-byte hex and EIP-2098 Signature objects.
    const message = getMessage(nonce);
    let isValid = false;
    try {
      isValid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: parsedSignature,
      });
    } catch (error) {
      console.error("[Auth] verifyMessage threw", {
        walletAddress,
        signatureType: typeof parsedSignature === "string" ? "hex" : "object",
        signatureLength:
          typeof parsedSignature === "string" ? parsedSignature.length : "N/A",
        error: error instanceof Error ? error.message : error,
      });
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }

    if (!isValid) {
      console.error("[Auth] Signature mismatch", { walletAddress });
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
    console.error("[Auth] Unexpected error", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
