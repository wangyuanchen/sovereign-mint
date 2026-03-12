import {
  pgTable,
  varchar,
  integer,
  text,
  jsonb,
  boolean,
  timestamp,
  decimal,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  walletAddress: varchar("wallet_address", { length: 42 }).primaryKey(),
  // Subscription status
  hasPaidAccess: boolean("has_paid_access").default(false).notNull(), // Unlocked paid models
  // Monthly quota tracking
  monthlyQuota: integer("monthly_quota").default(3).notNull(), // Current month's allowed generations
  usedThisMonth: integer("used_this_month").default(0).notNull(), // Used this month
  quotaResetDate: date("quota_reset_date"), // When quota resets (1st of each month)
  // Boost credits (never expire, used after monthly quota)
  boostCredits: integer("boost_credits").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outputTypeEnum = pgEnum("output_type", [
  "whitepaper",
  "landing_page",
]);

export const generations = pgTable("generations", {
  id: varchar("id", { length: 25 }).primaryKey(), // cuid
  walletAddress: varchar("wallet_address", { length: 42 })
    .notNull()
    .references(() => users.walletAddress),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  inputData: jsonb("input_data").notNull(),
  outputMarkdown: text("output_markdown"),
  outputType: outputTypeEnum.notNull(),
  modelUsed: varchar("model_used", { length: 100 }), // Track which model was used
  isUnlocked: boolean("is_unlocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const planEnum = pgEnum("plan", ["unlock", "boost"]);

export const payments = pgTable("payments", {
  txHash: varchar("tx_hash", { length: 66 }).primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 })
    .notNull()
    .references(() => users.walletAddress),
  plan: planEnum.notNull(),
  amountUsdt: decimal("amount_usdt", { precision: 18, scale: 6 }).notNull(),
  chainId: integer("chain_id").notNull(),
  tokenAddress: varchar("token_address", { length: 42 }).notNull(),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
