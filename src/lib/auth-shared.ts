// Shared auth utilities (can be used in both client and server)

export function getMessage(nonce: string): string {
  return `Sign in to Sovereign Mint: ${nonce}`;
}
