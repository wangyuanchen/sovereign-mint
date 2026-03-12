import { parseUnits } from "viem";

export type SupportedChainId = 1 | 10 | 137 | 42161 | 8453;

export interface PaymentTokenConfig {
  chainId: SupportedChainId;
  chainName: string;
  symbol: "USDT";
  address: `0x${string}`;
  decimals: number;
}

// USDT (ERC20) contract addresses on popular EVM chains.
export const PAYMENT_TOKENS: Record<SupportedChainId, PaymentTokenConfig> = {
  1: {
    chainId: 1,
    chainName: "Ethereum",
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
  10: {
    chainId: 10,
    chainName: "Optimism",
    symbol: "USDT",
    address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    decimals: 6,
  },
  137: {
    chainId: 137,
    chainName: "Polygon",
    symbol: "USDT",
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    decimals: 6,
  },
  42161: {
    chainId: 42161,
    chainName: "Arbitrum",
    symbol: "USDT",
    address: "0xFd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9",
    decimals: 6,
  },
  8453: {
    chainId: 8453,
    chainName: "Base",
    symbol: "USDT",
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    decimals: 6,
  },
};

export const DEFAULT_PAYMENT_CHAIN_ID: SupportedChainId = 8453;

export function getPaymentTokenConfig(
  chainId: number
): PaymentTokenConfig | undefined {
  return PAYMENT_TOKENS[chainId as SupportedChainId];
}

// Pricing in USDT
export const PRICING = {
  unlock: 29, // Unlock paid models + 30 monthly generations
  boost: 19, // Boost pack: +20 extra generations
} as const;

export type PlanType = keyof typeof PRICING;

// Get price in smallest token units (USDT uses 6 decimals on supported chains).
export function getPriceInUnits(plan: PlanType, decimals: number): bigint {
  return parseUnits(PRICING[plan].toString(), decimals);
}

// Generic ERC20 ABI for token transfer verification.
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
