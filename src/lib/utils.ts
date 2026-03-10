import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCredits(credits: number): string {
  if (credits === -1) return "Unlimited";
  return credits.toString();
}

export function formatQuota(used: number, quota: number, boost: number): string {
  const remaining = Math.max(0, quota - used) + boost;
  return remaining.toString();
}

export function getRemainingGenerations(used: number, quota: number, boost: number): number {
  return Math.max(0, quota - used) + boost;
}
