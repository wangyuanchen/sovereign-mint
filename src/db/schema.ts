import {
  mysqlTable,
  varchar,
  int,
  text,
  json,
  boolean,
  timestamp,
  decimal,
  mysqlEnum,
  date,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  walletAddress: varchar("wallet_address", { length: 42 }).primaryKey(),
  // Subscription status
  hasPaidAccess: boolean("has_paid_access").default(false).notNull(), // Unlocked paid models
  // Monthly quota tracking
  monthlyQuota: int("monthly_quota").default(3).notNull(), // Current month's allowed generations
  usedThisMonth: int("used_this_month").default(0).notNull(), // Used this month
  quotaResetDate: date("quota_reset_date"), // When quota resets (1st of each month)
  // Boost credits (never expire, used after monthly quota)
  boostCredits: int("boost_credits").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outputTypeEnum = mysqlEnum("output_type", [
  "whitepaper",
  "landing_page",
]);

export const generations = mysqlTable("generations", {
  id: varchar("id", { length: 25 }).primaryKey(), // cuid
  walletAddress: varchar("wallet_address", { length: 42 })
    .notNull()
    .references(() => users.walletAddress),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  inputData: json("input_data").notNull(),
  outputMarkdown: text("output_markdown"),
  outputType: outputTypeEnum.notNull(),
  modelUsed: varchar("model_used", { length: 100 }), // Track which model was used
  isUnlocked: boolean("is_unlocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const planEnum = mysqlEnum("plan", ["unlock", "boost"]);

export const payments = mysqlTable("payments", {
  txHash: varchar("tx_hash", { length: 66 }).primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 })
    .notNull()
    .references(() => users.walletAddress),
  plan: planEnum.notNull(),
  amountUsdc: decimal("amount_usdc", { precision: 10, scale: 2 }).notNull(),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
