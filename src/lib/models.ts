// OpenRouter Model Configuration
// Models are grouped by tier: free and paid
// Free users can only use free models
// Paid users can use all models but have monthly quotas

export type ModelTier = "free" | "paid";

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: ModelTier;
  contextLength: number;
  description: string;
  costPer1kTokens?: number; // For reference, actual cost handled by OpenRouter
}

// Free models - available to all users
export const FREE_MODELS: ModelConfig[] = [
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B",
    provider: "Meta",
    tier: "free",
    contextLength: 131072,
    description: "Fast and capable free model",
  },
  {
    id: "google/gemma-2-9b-it:free",
    name: "Gemma 2 9B",
    provider: "Google",
    tier: "free",
    contextLength: 8192,
    description: "Google's efficient open model",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B",
    provider: "Mistral AI",
    tier: "free",
    contextLength: 32768,
    description: "Efficient instruction-following model",
  },
];

// Paid models - require subscription or credits
export const PAID_MODELS: ModelConfig[] = [
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    tier: "paid",
    contextLength: 200000,
    description: "Most intelligent Claude model",
    costPer1kTokens: 0.015,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    tier: "paid",
    contextLength: 200000,
    description: "Best balance of intelligence and speed",
    costPer1kTokens: 0.003,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    tier: "paid",
    contextLength: 128000,
    description: "OpenAI's flagship model",
    costPer1kTokens: 0.005,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    tier: "paid",
    contextLength: 128000,
    description: "Fast and affordable GPT-4",
    costPer1kTokens: 0.00015,
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    tier: "paid",
    contextLength: 1048576,
    description: "Google's fastest model",
    costPer1kTokens: 0.0001,
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    tier: "paid",
    contextLength: 65536,
    description: "Excellent value, strong reasoning",
    costPer1kTokens: 0.00014,
  },
];

export const ALL_MODELS = [...FREE_MODELS, ...PAID_MODELS];

export const DEFAULT_FREE_MODEL = FREE_MODELS[0].id;
export const DEFAULT_PAID_MODEL = PAID_MODELS[1].id; // Claude 3.5 Sonnet

export function getModelById(modelId: string): ModelConfig | undefined {
  return ALL_MODELS.find((m) => m.id === modelId);
}

export function isModelFree(modelId: string): boolean {
  const model = getModelById(modelId);
  return model?.tier === "free";
}

export function canUserAccessModel(modelId: string, hasPaidAccess: boolean): boolean {
  const model = getModelById(modelId);
  if (!model) return false;
  if (model.tier === "free") return true;
  return hasPaidAccess;
}

// Monthly quota configuration
export const MONTHLY_QUOTA = {
  FREE_GENERATIONS: 3, // Free users get 3 generations per month with free models
  PAID_GENERATIONS: 30, // Paid users get 30 generations per month
  BOOST_PACK_SIZE: 20, // Each boost pack adds 20 generations
};

// Pricing
export const PRICING = {
  // One-time purchase for paid model access (unlocks paid models + monthly quota)
  UNLOCK_PAID_MODELS: 29, // $29 USDC
  // Boost pack for additional generations
  BOOST_PACK: 19, // $19 USDC for 20 extra generations
} as const;

export type PlanType = "unlock" | "boost";
