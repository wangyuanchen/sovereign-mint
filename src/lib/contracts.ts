import { parseUnits } from "viem";

// USDC on Base network
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const BASE_CHAIN_ID = 8453;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Pricing in USDC
export const PRICING = {
  unlock: 29, // Unlock paid models + 30 monthly generations
  boost: 19, // Boost pack: +20 extra generations
} as const;

export type PlanType = keyof typeof PRICING;

// Get price in USDC smallest units (6 decimals)
export function getPriceInUnits(plan: PlanType): bigint {
  return parseUnits(PRICING[plan].toString(), USDC_DECIMALS);
}

// ERC20 ABI for USDC transfer
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;
