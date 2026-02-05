import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, text, timestamp, varchar, pgEnum, integer, jsonb } from "drizzle-orm/pg-core";
import { eq, and } from "drizzle-orm";

/**
 * Supabase Database Connection
 * This database stores all regular user accounts and their data.
 * Admin/owner accounts are stored in the Manus database.
 */

// Define the role enum for Supabase users
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// Define the subscription tier enum
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "starter",
  "pro",
  "ultimate",
]);

// Define the billing period enum
export const billingPeriodEnum = pgEnum("billing_period", [
  "monthly",
  "six_month",
  "annual",
]);

// Define the subscription status enum
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "trialing",
]);

// Supabase users table schema
export const supabaseUsers = pgTable("users", {
  id: text("id").primaryKey(), // Supabase Auth user ID
  email: varchar("email", { length: 320 }),
  name: text("name"),
  role: userRoleEnum("role").default("user").notNull(),
  loginMethod: varchar("login_method", { length: 64 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default("USD"),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  selectedSpecializedHubs: text("selected_specialized_hubs")
    .array()
    .default([])
    .notNull(),
  hubsSelectedAt: timestamp("hubs_selected_at"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  subscriptionPrice: varchar("subscription_price", { length: 20 }), // Using varchar for decimal storage
  subscriptionCurrency: varchar("subscription_currency", { length: 3 }).default("GBP"),
  staySignedIn: text("stay_signed_in").default("false").notNull(), // Using text for boolean
  twoFactorEnabled: text("two_factor_enabled").default("false").notNull(), // Using text for boolean
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  backupCodes: text("backup_codes"),
  
  // Stripe subscription fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("trialing"),
  billingPeriod: billingPeriodEnum("billing_period").default("monthly"),
  
  // Trial tracking fields
  trialDays: integer("trial_days").default(5).notNull(), // 5 for monthly, 7 for 6-month/annual
  hubTrialStartDates: jsonb("hub_trial_start_dates").default({}).notNull(), // { "language": "2026-01-29T10:00:00Z", ... }
  
  // Billing cycle fields
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: text("cancel_at_period_end"), // null or lowercase tier name to downgrade to
  
  // User type tracking
  isNewUser: text("is_new_user").default("yes").notNull(), // "yes" or "no"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type SupabaseUser = typeof supabaseUsers.$inferSelect;
export type InsertSupabaseUser = typeof supabaseUsers.$inferInsert;

// Lazy connection to Supabase database
let _supabaseDb: ReturnType<typeof drizzle> | null = null;

export async function getSupabaseDb() {
  if (!_supabaseDb && process.env.SUPABASE_DB_URL) {
    try {
      const sql = postgres(process.env.SUPABASE_DB_URL);
      _supabaseDb = drizzle(sql);
    } catch (error) {
      console.warn("[Supabase Database] Failed to connect:", error);
      _supabaseDb = null;
    }
  }
  return _supabaseDb;
}

/**
 * Upsert a Supabase user
 */
export async function upsertSupabaseUser(
  user: InsertSupabaseUser
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot upsert user: database not available"
    );
    return;
  }

  try {
    await db
      .insert(supabaseUsers)
      .values(user)
      .onConflictDoUpdate({
        target: supabaseUsers.id,
        set: {
          email: user.email,
          name: user.name,
          lastSignedIn: user.lastSignedIn || new Date(),
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("[Supabase Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get a Supabase user by ID
 */
export async function getSupabaseUserById(
  id: string
): Promise<SupabaseUser | undefined> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot get user: database not available"
    );
    return undefined;
  }

  const result = await db
    .select()
    .from(supabaseUsers)
    .where(eq(supabaseUsers.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update Supabase user's subscription tier
 */
export async function updateSupabaseUserTier(
  userId: string,
  tier: "free" | "starter" | "pro" | "ultimate"
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot update tier: database not available"
    );
    return;
  }

  await db
    .update(supabaseUsers)
    .set({ subscriptionTier: tier, updatedAt: new Date() })
    .where(eq(supabaseUsers.id, userId));
}

/**
 * Update Supabase user's selected hubs
 */
export async function updateSupabaseUserHubs(
  userId: string,
  hubs: string[]
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot update hubs: database not available"
    );
    return;
  }

  await db
    .update(supabaseUsers)
    .set({
      selectedSpecializedHubs: hubs,
      hubsSelectedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(supabaseUsers.id, userId));
}

/**
 * Update a Supabase user with partial data
 */
export async function updateSupabaseUser(
  data: Partial<SupabaseUser> & { id: string }
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot update user: database not available"
    );
    return;
  }

  try {
    const { id, ...updateData } = data;
    await db
      .update(supabaseUsers)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(supabaseUsers.id, id));
  } catch (error) {
    console.error("[Supabase Database] Failed to update user:", error);
    throw error;
  }
}


// ============================================================================
// LEARN FINANCE SCHEMA (Supabase/PostgreSQL version)
// ============================================================================

/**
 * Finance Articles table - educational content
 */
export const financeArticles = pgTable("finance_articles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  summary: text("summary"),
  content: text("content").notNull(), // Markdown content
  readTime: integer("readTime").notNull(), // Minutes
  difficulty: varchar("difficulty", { length: 50 }).notNull(), // "beginner", "intermediate", "advanced"
  tags: text("tags"), // Comma-separated tags
  author: varchar("author", { length: 200 }),
  published: text("published").default("true").notNull(), // "true" or "false"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FinanceArticle = typeof financeArticles.$inferSelect;
export type InsertFinanceArticle = typeof financeArticles.$inferInsert;

/**
 * User Learning Progress table - tracks article completion
 */
export const userLearningProgress = pgTable("user_learning_progress", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("userId").notNull(), // Supabase user ID
  articleId: integer("articleId").notNull(),
  completed: text("completed").default("false").notNull(), // "true" or "false"
  progress: integer("progress").default(0).notNull(), // Percentage 0-100
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = typeof userLearningProgress.$inferInsert;

/**
 * Financial Glossary table - searchable finance terms
 */
export const financialGlossary = pgTable("financial_glossary", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  term: varchar("term", { length: 200 }).notNull().unique(),
  definition: text("definition").notNull(), // Simple explanation
  example: text("example"), // Real-world example
  relatedTerms: text("relatedTerms"), // JSON array of related term IDs
  category: varchar("category", { length: 100 }), // "Credit", "Investing", "Debt", etc.
  difficulty: varchar("difficulty", { length: 50 }).notNull(), // "beginner", "intermediate", "advanced"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FinancialGlossaryTerm = typeof financialGlossary.$inferSelect;
export type InsertFinancialGlossaryTerm = typeof financialGlossary.$inferInsert;

/**
 * Learning Badges table - achievement system
 */
export const learningBadges = pgTable("learning_badges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }), // Emoji or icon reference
  tier: varchar("tier", { length: 50 }).notNull(), // "bronze", "silver", "gold", "platinum"
  criteria: text("criteria").notNull(), // JSON object describing how to earn
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningBadge = typeof learningBadges.$inferSelect;
export type InsertLearningBadge = typeof learningBadges.$inferInsert;

/**
 * User Learning Badges table - tracks earned badges
 */
export const userLearningBadges = pgTable("user_learning_badges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("userId").notNull(), // Supabase user ID
  badgeId: integer("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserLearningBadge = typeof userLearningBadges.$inferSelect;
export type InsertUserLearningBadge = typeof userLearningBadges.$inferInsert;


// ============================================================================
// LEARN FINANCE DATABASE HELPERS
// ============================================================================

/**
 * Get all published finance articles
 */
export async function getFinanceArticles(): Promise<FinanceArticle[]> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get articles: database not available");
    return [];
  }

  try {
    const articles = await db
      .select()
      .from(financeArticles)
      .where(eq(financeArticles.published, "true"))
      .orderBy(financeArticles.createdAt);
    
    return articles;
  } catch (error) {
    console.error("[Supabase Database] Failed to get articles:", error);
    return [];
  }
}

/**
 * Get a single finance article by slug
 */
export async function getFinanceArticleBySlug(slug: string): Promise<FinanceArticle | undefined> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get article: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(financeArticles)
      .where(eq(financeArticles.slug, slug))
      .limit(1);
    
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Supabase Database] Failed to get article:", error);
    return undefined;
  }
}

/**
 * Get user's learning progress for all articles
 */
export async function getUserLearningProgress(userId: string): Promise<UserLearningProgress[]> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get progress: database not available");
    return [];
  }

  try {
    const progress = await db
      .select()
      .from(userLearningProgress)
      .where(eq(userLearningProgress.userId, userId));
    
    return progress;
  } catch (error) {
    console.error("[Supabase Database] Failed to get progress:", error);
    return [];
  }
}

/**
 * Update user's learning progress for an article
 */
export async function updateUserLearningProgress(
  userId: string,
  articleId: number,
  progress: number,
  completed: boolean
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot update progress: database not available");
    return;
  }

  try {
    const existing = await db
      .select()
      .from(userLearningProgress)
      .where(
        and(
          eq(userLearningProgress.userId, userId),
          eq(userLearningProgress.articleId, articleId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing progress
      await db
        .update(userLearningProgress)
        .set({
          progress,
          completed: completed ? "true" : "false",
          lastAccessedAt: new Date(),
          completedAt: completed ? new Date() : null,
        })
        .where(eq(userLearningProgress.id, existing[0].id));
    } else {
      // Insert new progress
      await db.insert(userLearningProgress).values({
        userId,
        articleId,
        progress,
        completed: completed ? "true" : "false",
        lastAccessedAt: new Date(),
        completedAt: completed ? new Date() : null,
      });
    }
  } catch (error) {
    console.error("[Supabase Database] Failed to update progress:", error);
    throw error;
  }
}

/**
 * Get financial glossary terms
 */
export async function getFinancialGlossaryTerms(
  category?: string
): Promise<FinancialGlossaryTerm[]> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get glossary: database not available");
    return [];
  }

  try {
    const terms = category
      ? await db
          .select()
          .from(financialGlossary)
          .where(eq(financialGlossary.category, category))
          .orderBy(financialGlossary.term)
      : await db
          .select()
          .from(financialGlossary)
          .orderBy(financialGlossary.term);
    return terms;
  } catch (error) {
    console.error("[Supabase Database] Failed to get glossary:", error);
    return [];
  }
}
