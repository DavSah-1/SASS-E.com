import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, text, timestamp, varchar, pgEnum, integer, jsonb } from "drizzle-orm/pg-core";
import { eq, and } from "drizzle-orm";
import { getUserLevel, type Level } from "../shared/levels";

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

// Define the subscription period enum (matches Manus DB naming)
export const subscriptionPeriodEnum = pgEnum("subscription_period", [
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

// Define the service enum for quota tracking
export const serviceEnum = pgEnum("service", ["tavily", "whisper", "llm"]);

// Define the tier enum for quota tracking (reusing subscription tiers)
export const quotaTierEnum = pgEnum("quota_tier", [
  "free",
  "starter",
  "pro",
  "ultimate",
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
  subscriptionPeriod: subscriptionPeriodEnum("subscription_period").default("monthly"),
  
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

// ==================== Learn Finance Quiz Functions ====================

/**
 * Article Quizzes table - quiz questions for each article
 */
export const articleQuizzes = pgTable("article_quizzes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  articleId: integer("article_id").notNull(),
  questions: jsonb("questions").notNull(), // Array of quiz questions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ArticleQuiz = typeof articleQuizzes.$inferSelect;
export type InsertArticleQuiz = typeof articleQuizzes.$inferInsert;

/**
 * User Quiz Attempts table - tracks quiz submissions
 */
export const userQuizAttempts = pgTable("user_quiz_attempts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  answers: jsonb("answers").notNull(), // Array of selected answer indices
  score: integer("score").notNull(), // Number correct
  passed: text("passed").notNull(), // "true" or "false"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type InsertUserQuizAttempt = typeof userQuizAttempts.$inferInsert;

/**
 * Tier Assessments table - comprehensive assessments for completing each tier
 */
export const tierAssessments = pgTable("tier_assessments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tierId: integer("tier_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  questions: jsonb("questions").notNull(), // Array of 10 assessment questions
  passRate: text("pass_rate").notNull(), // "0.80" for 80%
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TierAssessment = typeof tierAssessments.$inferSelect;
export type InsertTierAssessment = typeof tierAssessments.$inferInsert;

/**
 * User Tier Assessment Attempts table - tracks tier assessment submissions
 */
export const userTierAssessmentAttempts = pgTable("user_tier_assessment_attempts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  tierId: integer("tier_id").notNull(),
  answers: jsonb("answers").notNull(), // Array of selected answer indices
  score: integer("score").notNull(), // Number correct out of 10
  passed: text("passed").notNull(), // "true" or "false"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserTierAssessmentAttempt = typeof userTierAssessmentAttempts.$inferSelect;
export type InsertUserTierAssessmentAttempt = typeof userTierAssessmentAttempts.$inferInsert;

/**
 * Get quiz for an article
 */
export async function getArticleQuiz(articleId: number): Promise<ArticleQuiz | undefined> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get quiz: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(articleQuizzes)
      .where(eq(articleQuizzes.articleId, articleId))
      .limit(1);
    
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Supabase Database] Failed to get quiz:", error);
    return undefined;
  }
}

/**
 * Submit a quiz attempt
 */
export async function submitQuizAttempt(
  userId: string,
  articleId: number,
  answers: number[],
  score: number,
  passed: boolean
): Promise<{ attempt: UserQuizAttempt; newBadges: Array<{ id: number; name: string; icon: string }> }> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot submit quiz: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .insert(userQuizAttempts)
      .values({
        userId,
        articleId,
        answers,
        score,
        passed: passed ? "true" : "false",
      })
      .returning();
    
    // Check and award badges after quiz submission
    let newBadges: Array<{ id: number; name: string; icon: string }> = [];
    if (passed) {
      try {
        newBadges = await checkAndAwardBadges(userId);
      } catch (badgeError) {
        console.error("[Supabase Database] Failed to check badges after quiz:", badgeError);
        // Don't throw - badge checking failure shouldn't fail quiz submission
      }
    }
    
    return { attempt: result[0], newBadges };
  } catch (error) {
    console.error("[Supabase Database] Failed to submit quiz:", error);
    throw error;
  }
}

/**
 * Get user's quiz attempts for an article
 */
export async function getUserQuizAttempts(
  userId: string,
  articleId: number
): Promise<UserQuizAttempt[]> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get attempts: database not available");
    return [];
  }

  try {
    const attempts = await db
      .select()
      .from(userQuizAttempts)
      .where(
        and(
          eq(userQuizAttempts.userId, userId),
          eq(userQuizAttempts.articleId, articleId)
        )
      )
      .orderBy(userQuizAttempts.createdAt);
    
    return attempts;
  } catch (error) {
    console.error("[Supabase Database] Failed to get attempts:", error);
    return [];
  }
}

// ==================== Tier Assessment Functions ====================

/**
 * Get tier assessment by tier ID
 */
export async function getTierAssessment(tierId: number): Promise<TierAssessment | undefined> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get tier assessment: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(tierAssessments)
      .where(eq(tierAssessments.tierId, tierId))
      .limit(1);
    
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Supabase Database] Failed to get tier assessment:", error);
    return undefined;
  }
}

/**
 * Submit a tier assessment attempt
 */
export async function submitTierAssessmentAttempt(
  userId: string,
  tierId: number,
  answers: string[],
  score: number,
  passed: boolean
): Promise<{ attempt: UserTierAssessmentAttempt; newBadges: Array<{ id: number; name: string; icon: string }> }> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot submit tier assessment: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .insert(userTierAssessmentAttempts)
      .values({
        userId,
        tierId,
        answers,
        score,
        passed: passed ? "true" : "false",
      })
      .returning();
    
    // Check and award badges after tier assessment submission
    let newBadges: Array<{ id: number; name: string; icon: string }> = [];
    if (passed) {
      try {
        newBadges = await checkAndAwardBadges(userId);
      } catch (badgeError) {
        console.error("[Supabase Database] Failed to check badges after assessment:", badgeError);
        // Don't throw - badge checking failure shouldn't fail assessment submission
      }
    }
    
    return { attempt: result[0], newBadges };
  } catch (error) {
    console.error("[Supabase Database] Failed to submit tier assessment:", error);
    throw error;
  }
}

/**
 * Get user's tier assessment attempts
 */
export async function getUserTierAssessmentAttempts(
  userId: string,
  tierId: number
): Promise<UserTierAssessmentAttempt[]> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get tier assessment attempts: database not available");
    return [];
  }

  try {
    const attempts = await db
      .select()
      .from(userTierAssessmentAttempts)
      .where(
        and(
          eq(userTierAssessmentAttempts.userId, userId),
          eq(userTierAssessmentAttempts.tierId, tierId)
        )
      )
      .orderBy(userTierAssessmentAttempts.createdAt);
    
    return attempts;
  } catch (error) {
    console.error("[Supabase Database] Failed to get tier assessment attempts:", error);
    return [];
  }
}

/**
 * Check if user has passed a tier assessment
 */
export async function hasUserPassedTierAssessment(
  userId: string,
  tierId: number
): Promise<boolean> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot check tier assessment: database not available");
    return false;
  }

  try {
    const attempts = await db
      .select()
      .from(userTierAssessmentAttempts)
      .where(
        and(
          eq(userTierAssessmentAttempts.userId, userId),
          eq(userTierAssessmentAttempts.tierId, tierId),
          eq(userTierAssessmentAttempts.passed, "true")
        )
      )
      .limit(1);
    
    return attempts.length > 0;
  } catch (error) {
    console.error("[Supabase Database] Failed to check tier assessment:", error);
    return false;
  }
}

/**
 * Check if user has passed all article quizzes in a tier
 * For Tier 1: Check if user has passed all 10 article quizzes
 */
export async function hasUserPassedAllTierQuizzes(
  userId: string,
  tierId: number
): Promise<boolean> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot check tier quizzes: database not available");
    return false;
  }

  try {
    // Get articles for the specified tier
    // Tier 1: slugs start with budgeting, zero-based, envelope, banking, credit-score, credit-report, good-debt, avalanche, compound, emergency-fund-basics
    // Tier 2: slugs start with emergency-fund-fundamentals, types-of-insurance, retirement-account, employer-benefits, building-credit, debt-consolidation, savings-account, financial-goal
    
    let tierSlugs: string[] = [];
    if (tierId === 1) {
      tierSlugs = [
        'budgeting-101',
        'zero-based-budgeting',
        'envelope-system',
        'banking-basics',
        'credit-score-fundamentals',
        'reading-credit-report',
        'good-vs-bad-debt',
        'avalanche-vs-snowball',
        'compound-interest',
        'emergency-fund-basics'
      ];
    } else if (tierId === 2) {
      tierSlugs = [
        'emergency-fund-fundamentals',
        'types-of-insurance',
        'retirement-account-basics',
        'employer-benefits',
        'building-credit-history',
        'debt-consolidation',
        'savings-account-types',
        'financial-goal-setting'
      ];
    } else {
      // Unsupported tier
      return false;
    }

    // Get all articles for this tier
    const allArticles = await db
      .select()
      .from(financeArticles)
      .where(eq(financeArticles.published, "true"));
    
    const tierArticles = allArticles.filter(article => 
      tierSlugs.includes(article.slug)
    );
    
    if (tierArticles.length === 0) {
      return false;
    }

    // Check if user has passed quiz for each article in this tier
    for (const article of tierArticles) {
      const passedAttempts = await db
        .select()
        .from(userQuizAttempts)
        .where(
          and(
            eq(userQuizAttempts.userId, userId),
            eq(userQuizAttempts.articleId, article.id),
              eq(userQuizAttempts.passed, "true")
            )
          )
          .limit(1);
        
      // If user hasn't passed this article's quiz, return false
      if (passedAttempts.length === 0) {
        return false;
      }
    }

    // User has passed all quizzes in this tier
    return true;
  } catch (error) {
    console.error("[Supabase Database] Failed to check tier quizzes:", error);
    return false;
  }
}

/**
 * Get user's tier progression status
 */
export async function getUserTierProgressionStatus(
  userId: string
): Promise<{
  tier1QuizzesCompleted: boolean;
  tier1AssessmentPassed: boolean;
  tier2Unlocked: boolean;
  tier2QuizzesCompleted: boolean;
  tier2AssessmentPassed: boolean;
  tier3Unlocked: boolean;
  tier3QuizzesCompleted: boolean;
  tier3AssessmentPassed: boolean;
  tier4Unlocked: boolean;
  tier4QuizzesCompleted: boolean;
  tier4AssessmentPassed: boolean;
  tier5Unlocked: boolean;
  tier5QuizzesCompleted: boolean;
  tier5AssessmentPassed: boolean;
  tier6Unlocked: boolean;
  tier6QuizzesCompleted: boolean;
  tier6AssessmentPassed: boolean;
  tier7Unlocked: boolean;
  tier7QuizzesCompleted: boolean;
  tier7AssessmentPassed: boolean;
  tier8Unlocked: boolean;
}> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get tier progression: database not available");
    return {
      tier1QuizzesCompleted: false,
      tier1AssessmentPassed: false,
      tier2Unlocked: false,
      tier2QuizzesCompleted: false,
      tier2AssessmentPassed: false,
      tier3Unlocked: false,
      tier3QuizzesCompleted: false,
      tier3AssessmentPassed: false,
      tier4Unlocked: false,
      tier4QuizzesCompleted: false,
      tier4AssessmentPassed: false,
      tier5Unlocked: false,
      tier5QuizzesCompleted: false,
      tier5AssessmentPassed: false,
      tier6Unlocked: false,
      tier6QuizzesCompleted: false,
      tier6AssessmentPassed: false,
      tier7Unlocked: false,
      tier7QuizzesCompleted: false,
      tier7AssessmentPassed: false,
      tier8Unlocked: false,
    };
  }

  try {
    // Check if all Tier 1 quizzes are passed
    const tier1QuizzesCompleted = await hasUserPassedAllTierQuizzes(userId, 1);

    // Check if Tier 1 assessment is passed
    const tier1AssessmentPassed = await hasUserPassedTierAssessment(userId, 1);

    // Tier 2 is unlocked if Tier 1 assessment is passed
    const tier2Unlocked = tier1AssessmentPassed;

    // Check if all Tier 2 quizzes are passed
    const tier2QuizzesCompleted = await hasUserPassedAllTierQuizzes(userId, 2);

    // Check if Tier 2 assessment is passed
    const tier2AssessmentPassed = await hasUserPassedTierAssessment(userId, 2);

    // Tier 3 is unlocked if Tier 2 assessment is passed
    const tier3Unlocked = tier2AssessmentPassed;

    // Check if all Tier 3 quizzes are passed
    const tier3QuizzesCompleted = await hasUserPassedAllTierQuizzes(userId, 3);

    // Check if Tier 3 assessment is passed
    const tier3AssessmentPassed = await hasUserPassedTierAssessment(userId, 3);

    // Tier 4 is unlocked if Tier 3 assessment is passed
    const tier4Unlocked = tier3AssessmentPassed;

    // Check if all Tier 4 quizzes are passed
    const tier4QuizzesCompleted = await hasUserPassedAllTierQuizzes(userId, 4);

    // Check if Tier 4 assessment is passed
    const tier4AssessmentPassed = await hasUserPassedTierAssessment(userId, 4);

    // Tier 5 is unlocked if Tier 4 assessment is passed
    const tier5Unlocked = tier4AssessmentPassed;

    // Check if all Tier 5 quizzes are passed
    const tier5QuizzesCompleted = await hasUserPassedAllTierQuizzes(userId, 5);

    // Check if Tier 5 assessment is passed
    const tier5AssessmentPassed = await hasUserPassedTierAssessment(userId, 5);

    // Tier 6 is unlocked if Tier 5 assessment is passed
    const tier6Unlocked = tier5AssessmentPassed;

    // Check if all Tier 6 quizzes are passed
    const tier6QuizzesCompleted = await hasUserPassedAllTierQuizzes(userId, 6);

    // Check if Tier 6 assessment is passed
    const tier6AssessmentPassed = await hasUserPassedTierAssessment(userId, 6);

    // Tier 7 is unlocked if Tier 6 assessment is passed
    const tier7Unlocked = tier6AssessmentPassed;

    // Check if all Tier 7 quizzes are passed
    const tier7QuizzesCompleted = await hasUserPassedAllTierQuizzes(userId, 7);

    // Check if Tier 7 assessment is passed
    const tier7AssessmentPassed = await hasUserPassedTierAssessment(userId, 7);

    // Tier 8 is unlocked if Tier 7 assessment is passed
    const tier8Unlocked = tier7AssessmentPassed;

    return {
      tier1QuizzesCompleted,
      tier1AssessmentPassed,
      tier2Unlocked,
      tier2QuizzesCompleted,
      tier2AssessmentPassed,
      tier3Unlocked,
      tier3QuizzesCompleted,
      tier3AssessmentPassed,
      tier4Unlocked,
      tier4QuizzesCompleted,
      tier4AssessmentPassed,
      tier5Unlocked,
      tier5QuizzesCompleted,
      tier5AssessmentPassed,
      tier6Unlocked,
      tier6QuizzesCompleted,
      tier6AssessmentPassed,
      tier7Unlocked,
      tier7QuizzesCompleted,
      tier7AssessmentPassed,
      tier8Unlocked,
    };
  } catch (error) {
    console.error("[Supabase Database] Failed to get tier progression:", error);
    return {
      tier1QuizzesCompleted: false,
      tier1AssessmentPassed: false,
      tier2Unlocked: false,
      tier2QuizzesCompleted: false,
      tier2AssessmentPassed: false,
      tier3Unlocked: false,
      tier3QuizzesCompleted: false,
      tier3AssessmentPassed: false,
      tier4Unlocked: false,
      tier4QuizzesCompleted: false,
      tier4AssessmentPassed: false,
      tier5Unlocked: false,
      tier5QuizzesCompleted: false,
      tier5AssessmentPassed: false,
      tier6Unlocked: false,
      tier6QuizzesCompleted: false,
      tier6AssessmentPassed: false,
      tier7Unlocked: false,
      tier7QuizzesCompleted: false,
      tier7AssessmentPassed: false,
      tier8Unlocked: false,
    };
  }
}

/**
 * Get user's Learn Finance progress stats
 */
export async function getUserLearnFinanceStats(
  userId: string
): Promise<{
  completedArticles: number;
  totalArticles: number;
  passedQuizzes: number;
  passedAssessments: number;
  currentTier: number;
  currentTierName: string;
  studyStreak: number;
  overallProgress: number;
  level: Level;
}> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get user stats: database not available");
    const level = getUserLevel(0);
    return {
      completedArticles: 0,
      totalArticles: 10,
      passedQuizzes: 0,
      passedAssessments: 0,
      currentTier: 1,
      currentTierName: "Tier 1: Foundational",
      studyStreak: 0,
      overallProgress: 0,
      level,
    };
  }

  try {
    // Get total published articles
    const allArticles = await db
      .select()
      .from(financeArticles)
      .where(eq(financeArticles.published, "true"));
    
    const totalArticles = allArticles.length;

    // Get user's article progress (articles with completed = true)
    const completedArticlesData = await db
      .select()
      .from(userLearningProgress)
      .where(
        and(
          eq(userLearningProgress.userId, userId),
          eq(userLearningProgress.completed, "true")
        )
      );
    
    const completedArticles = completedArticlesData.length;

    // Get user's passed quizzes (distinct article IDs with passed = true)
    const passedQuizzesData = await db
      .selectDistinct({ articleId: userQuizAttempts.articleId })
      .from(userQuizAttempts)
      .where(
        and(
          eq(userQuizAttempts.userId, userId),
          eq(userQuizAttempts.passed, "true")
        )
      );
    
    const passedQuizzes = passedQuizzesData.length;

    // Get user's passed tier assessments (distinct tier IDs with passed = true)
    const passedAssessmentsData = await db
      .selectDistinct({ tierId: userTierAssessmentAttempts.tierId })
      .from(userTierAssessmentAttempts)
      .where(
        and(
          eq(userTierAssessmentAttempts.userId, userId),
          eq(userTierAssessmentAttempts.passed, "true")
        )
      );
    
    const passedAssessments = passedAssessmentsData.length;

    // Determine current tier based on progression
    let currentTier = 1;
    let currentTierName = "Tier 1: Foundational";
    
    const tier1AssessmentPassed = await hasUserPassedTierAssessment(userId, 1);
    if (tier1AssessmentPassed) {
      currentTier = 2;
      currentTierName = "Tier 2: Building Stability";
    }

    // Calculate study streak (simplified: days with quiz attempts)
    // For now, return 0 as placeholder - full implementation would track daily activity
    const studyStreak = 0;

    // Calculate overall progress (based on completed articles)
    const overallProgress = totalArticles > 0 
      ? Math.round((completedArticles / totalArticles) * 100)
      : 0;

    // Calculate user's level based on overall progress
    const level = getUserLevel(overallProgress);

    return {
      completedArticles,
      totalArticles,
      passedQuizzes,
      passedAssessments,
      currentTier,
      currentTierName,
      studyStreak,
      overallProgress,
      level,
    };
  } catch (error) {
    console.error("[Supabase Database] Failed to get user stats:", error);
    const level = getUserLevel(0);
    return {
      completedArticles: 0,
      totalArticles: 10,
      passedQuizzes: 0,
      passedAssessments: 0,
      currentTier: 1,
      currentTierName: "Tier 1: Foundational",
      studyStreak: 0,
      overallProgress: 0,
      level,
    };
  }
}

/**
 * Get all available badges
 */
export async function getAllBadges(): Promise<LearningBadge[]> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get badges: database not available");
    return [];
  }

  try {
    const badges = await db.select().from(learningBadges);
    return badges;
  } catch (error) {
    console.error("[Supabase Database] Failed to get badges:", error);
    return [];
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<(UserLearningBadge & { badge: LearningBadge })[]> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot get user badges: database not available");
    return [];
  }

  try {
    const userBadges = await db
      .select({
        id: userLearningBadges.id,
        userId: userLearningBadges.userId,
        badgeId: userLearningBadges.badgeId,
        earnedAt: userLearningBadges.earnedAt,
        badge: learningBadges,
      })
      .from(userLearningBadges)
      .innerJoin(learningBadges, eq(userLearningBadges.badgeId, learningBadges.id))
      .where(eq(userLearningBadges.userId, userId));

    return userBadges as any;
  } catch (error) {
    console.error("[Supabase Database] Failed to get user badges:", error);
    return [];
  }
}

/**
 * Award a badge to a user
 */
export async function awardBadge(userId: string, badgeId: number): Promise<boolean> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn("[Supabase Database] Cannot award badge: database not available");
    return false;
  }

  try {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userLearningBadges)
      .where(
        and(
          eq(userLearningBadges.userId, userId),
          eq(userLearningBadges.badgeId, badgeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return false; // Already earned
    }

    // Award the badge
    await db.insert(userLearningBadges).values({
      userId,
      badgeId,
    });

    return true;
  } catch (error) {
    console.error("[Supabase Database] Failed to award badge:", error);
    return false;
  }
}

/**
 * Check and award badges based on user progress
 */
export async function checkAndAwardBadges(userId: string): Promise<Array<{ id: number; name: string; icon: string }>> {
  const db = await getSupabaseDb();
  if (!db) {
    return [];
  }

  try {
    const allBadges = await getAllBadges();
    const earnedBadges = await getUserBadges(userId);
    const earnedBadgeIds = earnedBadges.map(eb => eb.badgeId);
    const newlyAwardedBadges: Array<{ id: number; name: string; icon: string }> = [];

    // Get user's progress data
    const completedArticles = await db.select().from(userLearningProgress)
      .where(and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.completed, 'true')
      ));
    
    const passedQuizzes = await db.select().from(userQuizAttempts)
      .where(and(
        eq(userQuizAttempts.userId, userId),
        eq(userQuizAttempts.passed, 'true')
      ));
    
    const passedAssessments = await db.select().from(userTierAssessmentAttempts)
      .where(and(
        eq(userTierAssessmentAttempts.userId, userId),
        eq(userTierAssessmentAttempts.passed, 'true')
      ));

    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.id)) {
        continue;
      }

      const criteria = JSON.parse(badge.criteria);
      let shouldAward = false;

      // Check different badge criteria types
      switch (criteria.type) {
        case 'article_completion':
          shouldAward = completedArticles.length >= criteria.count;
          break;

        case 'quiz_passed':
          shouldAward = passedQuizzes.length >= criteria.count;
          break;

        case 'perfect_quiz':
          // Check if user has any quiz with 100% score
          const perfectQuiz = passedQuizzes.find(q => {
            // Assuming quiz has 5 questions
            return q.score === 5;
          });
          shouldAward = !!perfectQuiz;
          break;

        case 'perfect_quiz_count':
          const perfectQuizzes = passedQuizzes.filter(q => q.score === 5);
          shouldAward = perfectQuizzes.length >= criteria.count;
          break;

        case 'tier_assessment_passed':
          const tierPassed = passedAssessments.find(a => a.tierId === criteria.tier_id);
          shouldAward = !!tierPassed;
          break;

        case 'assessments_passed':
          // Count unique tier assessments passed
          const uniqueTiers = new Set(passedAssessments.map(a => a.tierId));
          shouldAward = uniqueTiers.size >= criteria.count;
          break;

        case 'all_tiers_completed':
          // Check if user has passed all 7 tier assessments
          const uniquePassedTiers = new Set(passedAssessments.map(a => a.tierId));
          shouldAward = uniquePassedTiers.size >= 7;
          break;

        case 'quiz_retry_success':
          // Check if user failed then passed the same quiz
          const allQuizAttempts = await db.select().from(userQuizAttempts)
            .where(eq(userQuizAttempts.userId, userId))
            .orderBy(userQuizAttempts.createdAt);
          
          const articleAttempts = new Map<number, any[]>();
          allQuizAttempts.forEach(attempt => {
            if (!articleAttempts.has(attempt.articleId)) {
              articleAttempts.set(attempt.articleId, []);
            }
            articleAttempts.get(attempt.articleId)!.push(attempt);
          });
          
          for (const [articleId, attempts] of Array.from(articleAttempts.entries())) {
            if (attempts.length >= 2) {
              const hasFailed = attempts.some((a: any) => a.passed === 'false');
              const hasPassed = attempts.some((a: any) => a.passed === 'true');
              if (hasFailed && hasPassed) {
                shouldAward = true;
                break;
              }
            }
          }
          break;

        case 'tier_speed':
          // Check if user completed a tier in under specified days
          // This would require tracking tier start/completion dates
          // For now, skip this criteria
          break;
      }

      if (shouldAward) {
        const awarded = await awardBadge(userId, badge.id);
        if (awarded) {
          newlyAwardedBadges.push({
            id: badge.id,
            name: badge.name,
            icon: badge.icon || '🏆'
          });
        }
      }
    }

    return newlyAwardedBadges;
  } catch (error) {
    console.error("[Supabase Database] Failed to check and award badges:", error);
    return [];
  }
}


/**
 * Quota Usage table for tracking API usage limits (Supabase Database - Regular Users)
 * Tracks usage for Tavily searches, Whisper transcriptions, and LLM calls
 * Supports subscription-tier-based limits (Free: 150, Starter: 300, Pro: 600, Ultimate: 1200)
 * RLS Policy: Users can only read/write their own quota records
 */
export const supabaseQuotaUsage = pgTable("quota_usage", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull().references(() => supabaseUsers.id),
  service: serviceEnum("service").notNull(),
  count: integer("count").default(0).notNull(),
  period: varchar("period", { length: 7 }).notNull(), // Format: "YYYY-MM" for monthly tracking
  tier: quotaTierEnum("tier").notNull(),
  resetAt: timestamp("reset_at").notNull(), // When the quota resets (first day of next month)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SupabaseQuotaUsage = typeof supabaseQuotaUsage.$inferSelect;
export type InsertSupabaseQuotaUsage = typeof supabaseQuotaUsage.$inferInsert;
