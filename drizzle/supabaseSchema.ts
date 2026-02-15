import { pgTable, uuid, integer, varchar, text, timestamp, decimal, boolean, date, index } from "drizzle-orm/pg-core";

/**
 * Supabase PostgreSQL Schema
 * This schema defines all tables stored in Supabase (PostgreSQL database)
 * Separate from schema.ts which defines Manus MySQL tables
 */

/**
 * Quiz Results - Store quiz attempts for learning hub
 */
export const quizResults = pgTable("quiz_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull(),
  topicId: varchar("topic_id", { length: 255 }).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }), // Generated column in DB
  answers: text("answers"), // JSON array of answers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_quiz_results_user_id").on(table.userId),
  topicIdIdx: index("idx_quiz_results_topic_id").on(table.topicId),
  createdAtIdx: index("idx_quiz_results_created_at").on(table.createdAt),
}));

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;

/**
 * Conversations - AI assistant conversation history
 */
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userMessage: text("user_message").notNull(),
  assistantResponse: text("assistant_response").notNull(),
  audioUrl: varchar("audio_url", { length: 512 }),
  timestamp: timestamp("timestamp").defaultNow(), // Note: using 'timestamp' not 'created_at'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_conversations_user_id").on(table.userId),
  createdAtIdx: index("idx_conversations_created_at").on(table.createdAt),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Topic Progress - Track learning hub progress
 */
export const topicProgress = pgTable("topic_progress", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicName: varchar("topic_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("not_started").notNull(),
  lessonCompleted: integer("lesson_completed").default(0).notNull(),
  practiceCount: integer("practice_count").default(0).notNull(),
  quizzesTaken: integer("quizzes_taken").default(0).notNull(),
  bestQuizScore: integer("best_quiz_score").default(0).notNull(),
  masteryLevel: integer("mastery_level").default(0).notNull(),
  lastStudied: timestamp("last_studied").defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_topic_progress_user_id").on(table.userId),
  topicNameIdx: index("idx_topic_progress_topic_name").on(table.topicName),
}));

export type TopicProgress = typeof topicProgress.$inferSelect;
export type InsertTopicProgress = typeof topicProgress.$inferInsert;

/**
 * Debts - User debt tracking
 */
export const debts = pgTable("debts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }).notNull(),
  dueDate: integer("due_date").notNull(), // Day of month
  debtType: varchar("debt_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  isPaidOff: boolean("is_paid_off").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_debts_user_id").on(table.userId),
  isPaidOffIdx: index("idx_debts_is_paid_off").on(table.isPaidOff),
}));

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

/**
 * Debt Payments - Payment history for debts
 */
export const debtPayments = pgTable("debt_payments", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  debtId: integer("debt_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_debt_payments_user_id").on(table.userId),
  debtIdIdx: index("idx_debt_payments_debt_id").on(table.debtId),
}));

export type DebtPayment = typeof debtPayments.$inferSelect;
export type InsertDebtPayment = typeof debtPayments.$inferInsert;

/**
 * Debt Strategies - Calculated payoff strategies
 */
export const debtStrategies = pgTable("debt_strategies", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategyType: varchar("strategy_type", { length: 50 }).notNull(),
  monthlyExtraPayment: decimal("monthly_extra_payment", { precision: 10, scale: 2 }).notNull(),
  projectedPayoffDate: timestamp("projected_payoff_date").notNull(),
  totalInterestPaid: decimal("total_interest_paid", { precision: 10, scale: 2 }).notNull(),
  totalInterestSaved: decimal("total_interest_saved", { precision: 10, scale: 2 }).notNull(),
  monthsToPayoff: integer("months_to_payoff").notNull(),
  payoffOrder: text("payoff_order").notNull(), // JSON array
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_debt_strategies_user_id").on(table.userId),
  createdAtIdx: index("idx_debt_strategies_created_at").on(table.createdAt),
}));

export type DebtStrategy = typeof debtStrategies.$inferSelect;
export type InsertDebtStrategy = typeof debtStrategies.$inferInsert;

/**
 * Coaching Sessions - AI coaching messages
 */
export const coachingSessions = pgTable("coaching_sessions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionType: varchar("session_type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  sentiment: varchar("sentiment", { length: 50 }).notNull(),
  relatedDebtId: integer("related_debt_id"),
  relatedMilestoneId: integer("related_milestone_id"),
  userResponse: varchar("user_response", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_coaching_sessions_user_id").on(table.userId),
}));

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = typeof coachingSessions.$inferInsert;

/**
 * Debt Budget Snapshots - Monthly budget tracking
 */
export const debtBudgetSnapshots = pgTable("debt_budget_snapshots", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  monthYear: varchar("month_year", { length: 7 }).notNull(), // Format: "2025-01"
  snapshotDate: date("snapshot_date").defaultNow(),
  totalIncome: decimal("total_income", { precision: 10, scale: 2 }).notNull(),
  totalExpenses: decimal("total_expenses", { precision: 10, scale: 2 }).notNull(),
  totalDebtPayments: decimal("total_debt_payments", { precision: 10, scale: 2 }).notNull(),
  extraPaymentBudget: decimal("extra_payment_budget", { precision: 10, scale: 2 }).notNull(),
  actualExtraPayments: decimal("actual_extra_payments", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_debt_budget_snapshots_user_id").on(table.userId),
  snapshotDateIdx: index("idx_debt_snapshots_date").on(table.snapshotDate),
}));

export type DebtBudgetSnapshot = typeof debtBudgetSnapshots.$inferSelect;
export type InsertDebtBudgetSnapshot = typeof debtBudgetSnapshots.$inferInsert;

/**
 * Budget Categories - Income and expense categories
 */
export const budgetCategories = pgTable("budget_categories", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'income' or 'expense'
  monthlyLimit: decimal("monthly_limit", { precision: 10, scale: 2 }),
  color: varchar("color", { length: 7 }),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_budget_categories_user_id").on(table.userId),
}));

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = typeof budgetCategories.$inferInsert;

/**
 * Financial Goals - User financial goals
 */
export const financialGoals = pgTable("financial_goals", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  targetDate: timestamp("target_date"),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_financial_goals_user_id").on(table.userId),
}));

export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = typeof financialGoals.$inferInsert;

/**
 * Translate Conversations - Multilingual chat rooms
 */
export const translateConversations = pgTable("translate_conversations", {
  id: integer("id").primaryKey(),
  shareableCode: varchar("shareable_code", { length: 64 }).notNull().unique(),
  creatorId: integer("creator_id").notNull(),
  title: varchar("title", { length: 255 }),
  isActive: integer("is_active").default(1).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  shareableCodeIdx: index("idx_translate_conversations_code").on(table.shareableCode),
  creatorIdIdx: index("idx_translate_conversations_creator").on(table.creatorId),
}));

export type TranslateConversation = typeof translateConversations.$inferSelect;
export type InsertTranslateConversation = typeof translateConversations.$inferInsert;

/**
 * Translate Conversation Participants - Users in conversations
 */
export const translateConversationParticipants = pgTable("translate_conversation_participants", {
  id: integer("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
  preferredLanguage: varchar("preferred_language", { length: 10 }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  conversationIdIdx: index("idx_translate_participants_conversation").on(table.conversationId),
  userIdIdx: index("idx_translate_participants_user").on(table.userId),
}));

export type TranslateConversationParticipant = typeof translateConversationParticipants.$inferSelect;
export type InsertTranslateConversationParticipant = typeof translateConversationParticipants.$inferInsert;

/**
 * Translate Messages - Messages in multilingual conversations
 */
export const translateMessages = pgTable("translate_messages", {
  id: integer("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  originalText: text("original_text").notNull(),
  originalLanguage: varchar("original_language", { length: 10 }).notNull(),
  translations: text("translations"), // JSON object of language -> translated text
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdIdx: index("idx_translate_messages_conversation").on(table.conversationId),
  senderIdIdx: index("idx_translate_messages_sender").on(table.senderId),
}));

export type TranslateMessage = typeof translateMessages.$inferSelect;
export type InsertTranslateMessage = typeof translateMessages.$inferInsert;

/**
 * Vocabulary - Language learning vocabulary
 */
export const vocabulary = pgTable("vocabulary", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  word: varchar("word", { length: 255 }).notNull(),
  translation: varchar("translation", { length: 255 }).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }),
  partOfSpeech: varchar("part_of_speech", { length: 50 }),
  context: text("context"),
  pronunciation: varchar("pronunciation", { length: 255 }),
  exampleSentence: text("example_sentence"),
  exampleTranslation: text("example_translation"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_vocabulary_user_id").on(table.userId),
  languageIdx: index("idx_vocabulary_language").on(table.language),
}));

export type Vocabulary = typeof vocabulary.$inferSelect;
export type InsertVocabulary = typeof vocabulary.$inferInsert;

/**
 * Receipts - comprehensive receipt storage with OCR data
 */
export const receipts = pgTable("receipts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  transactionId: integer("transaction_id"), // Optional link to budget_transactions
  sharedBudgetTransactionId: integer("shared_budget_transaction_id"), // Optional link to shared_budget_transactions
  
  // Receipt Metadata
  merchantName: varchar("merchant_name", { length: 255 }).notNull(),
  merchantAddress: text("merchant_address"),
  merchantPhone: varchar("merchant_phone", { length: 50 }),
  receiptDate: timestamp("receipt_date").notNull(),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  paymentMethod: varchar("payment_method", { length: 50 }), // 'cash', 'credit_card', 'debit_card', 'mobile_payment', 'other'
  
  // Financial Data (in cents)
  subtotal: integer("subtotal"),
  tax: integer("tax"),
  tip: integer("tip"),
  discount: integer("discount"),
  total: integer("total").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Receipt Image & Storage
  imageUrl: varchar("image_url", { length: 512 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 50 }),
  
  // OCR Processing
  ocrStatus: varchar("ocr_status", { length: 20 }).default("pending"), // 'pending', 'processing', 'completed', 'failed'
  ocrProvider: varchar("ocr_provider", { length: 50 }),
  ocrRawText: text("ocr_raw_text"),
  ocrConfidence: integer("ocr_confidence"), // 0-100
  ocrProcessedAt: timestamp("ocr_processed_at"),
  ocrErrorMessage: text("ocr_error_message"),
  
  // Categorization
  categoryId: integer("category_id"),
  suggestedCategory: varchar("suggested_category", { length: 100 }),
  categoryConfidence: integer("category_confidence"), // 0-100
  
  // Status & Metadata
  status: varchar("status", { length: 20 }).default("draft"), // 'draft', 'verified', 'disputed', 'archived'
  notes: text("notes"),
  tags: text("tags"), // JSON array
  isReimbursable: boolean("is_reimbursable").default(false),
  reimbursementStatus: varchar("reimbursement_status", { length: 20 }), // 'pending', 'approved', 'rejected', 'paid'
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
}, (table) => ({
  userIdIdx: index("idx_receipts_user_id").on(table.userId),
  transactionIdIdx: index("idx_receipts_transaction_id").on(table.transactionId),
  merchantNameIdx: index("idx_receipts_merchant_name").on(table.merchantName),
  receiptDateIdx: index("idx_receipts_receipt_date").on(table.receiptDate),
  ocrStatusIdx: index("idx_receipts_ocr_status").on(table.ocrStatus),
  statusIdx: index("idx_receipts_status").on(table.status),
  createdAtIdx: index("idx_receipts_created_at").on(table.createdAt),
}));

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;

/**
 * Receipt Line Items - individual items from receipts
 */
export const receiptLineItems = pgTable("receipt_line_items", {
  id: integer("id").primaryKey(),
  receiptId: integer("receipt_id").notNull(),
  
  // Item Details
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemDescription: text("item_description"),
  quantity: integer("quantity").default(1000).notNull(), // stored as quantity * 1000 (3 decimal places)
  unitPrice: integer("unit_price").notNull(), // in cents
  totalPrice: integer("total_price").notNull(), // in cents
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  
  // Categorization
  categoryId: integer("category_id"),
  subcategory: varchar("subcategory", { length: 100 }),
  
  // Metadata
  lineNumber: integer("line_number"), // order in receipt
  isRefunded: boolean("is_refunded").default(false),
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  receiptIdIdx: index("idx_receipt_line_items_receipt_id").on(table.receiptId),
  categoryIdIdx: index("idx_receipt_line_items_category_id").on(table.categoryId),
}));

export type ReceiptLineItem = typeof receiptLineItems.$inferSelect;
export type InsertReceiptLineItem = typeof receiptLineItems.$inferInsert;

/**
 * Financial Insights - AI-generated spending insights and recommendations
 */
export const financialInsights = pgTable("financial_insights", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  insightType: varchar("insight_type", { length: 50 }).notNull(), // 'spending_pattern', 'saving_opportunity', 'cash_flow_prediction', 'budget_recommendation', 'trend_analysis'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  actionable: boolean("actionable").default(true).notNull(), // true if user can act on this insight
  actionText: varchar("action_text", { length: 255 }), // CTA text if actionable
  priority: varchar("priority", { length: 20 }).default("medium").notNull(), // 'low', 'medium', 'high'
  relatedCategoryId: integer("related_category_id"), // Link to budget category if relevant
  dataPoints: text("data_points"), // JSON with supporting data
  isDismissed: boolean("is_dismissed").default(false).notNull(), // true if user dismissed this insight
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Insights can expire after a certain period
}, (table) => ({
  userIdIdx: index("idx_financial_insights_user_id").on(table.userId),
  insightTypeIdx: index("idx_financial_insights_insight_type").on(table.insightType),
  priorityIdx: index("idx_financial_insights_priority").on(table.priority),
  createdAtIdx: index("idx_financial_insights_created_at").on(table.createdAt),
  expiresAtIdx: index("idx_financial_insights_expires_at").on(table.expiresAt),
}));

export type FinancialInsight = typeof financialInsights.$inferSelect;
export type InsertFinancialInsight = typeof financialInsights.$inferInsert;
