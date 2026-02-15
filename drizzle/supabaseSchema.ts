import { pgTable, uuid, integer, varchar, text, timestamp, decimal, boolean, date, index, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Supabase PostgreSQL Schema
 * This schema defines all 96 tables stored in Supabase (PostgreSQL database)
 * Separate from schema.ts which defines Manus MySQL tables
 * 
 * Column naming: snake_case (PostgreSQL convention)
 * Variable naming: camelCase (TypeScript convention)
 */

// ==================== Core Tables ====================

/**
 * Users - User accounts (Supabase auth)
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  supabaseId: varchar("supabase_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default("USD"),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free").notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("inactive").notNull(),
  subscriptionPeriod: varchar("subscription_period", { length: 20 }).default("monthly"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  selectedSpecializedHubs: text("selected_specialized_hubs"),
  hubsSelectedAt: timestamp("hubs_selected_at"),
  subscriptionPrice: decimal("subscription_price", { precision: 10, scale: 2 }),
  subscriptionCurrency: varchar("subscription_currency", { length: 3 }).default("GBP"),
  staySignedIn: boolean("stay_signed_in").default(false).notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  backupCodes: text("backup_codes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
}, (table) => ({
  supabaseIdIdx: uniqueIndex("idx_users_supabase_id").on(table.supabaseId),
  emailIdx: index("idx_users_email").on(table.email),
  subscriptionTierIdx: index("idx_users_subscription_tier").on(table.subscriptionTier),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User Profiles - Extended user information
 */
export const userProfiles = pgTable("user_profiles", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sarcasmLevel: integer("sarcasm_level").default(3).notNull(),
  totalInteractions: integer("total_interactions").default(0).notNull(),
  positiveResponses: integer("positive_responses").default(0).notNull(),
  negativeResponses: integer("negative_responses").default(0).notNull(),
  lastInteraction: timestamp("last_interaction").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_profiles_user_id").on(table.userId),
}));

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Conversations - AI assistant conversation history
 */
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userMessage: text("user_message").notNull(),
  assistantResponse: text("assistant_response").notNull(),
  audioUrl: varchar("audio_url", { length: 512 }),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_conversations_user_id").on(table.userId),
  createdAtIdx: index("idx_conversations_created_at").on(table.createdAt),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Conversation Feedback - User feedback on AI responses
 */
export const conversationFeedback = pgTable("conversation_feedback", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  conversationId: integer("conversation_id").notNull(),
  feedbackType: varchar("feedback_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_conversation_feedback_user_id").on(table.userId),
  conversationIdIdx: index("idx_conversation_feedback_conversation_id").on(table.conversationId),
}));

export type ConversationFeedback = typeof conversationFeedback.$inferSelect;
export type InsertConversationFeedback = typeof conversationFeedback.$inferInsert;

/**
 * Notifications - User notifications
 */
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_notifications_user_id").on(table.userId),
  isReadIdx: index("idx_notifications_is_read").on(table.isRead),
  createdAtIdx: index("idx_notifications_created_at").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification Preferences - User notification settings
 */
export const notificationPreferences = pgTable("notification_preferences", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  budgetAlertsEnabled: integer("budget_alerts_enabled").default(1).notNull(),
  threshold80Enabled: integer("threshold_80_enabled").default(1).notNull(),
  threshold100Enabled: integer("threshold_100_enabled").default(1).notNull(),
  exceededEnabled: integer("exceeded_enabled").default(1).notNull(),
  weeklySummaryEnabled: integer("weekly_summary_enabled").default(1).notNull(),
  monthlySummaryEnabled: integer("monthly_summary_enabled").default(1).notNull(),
  insightsEnabled: integer("insights_enabled").default(1).notNull(),
  recurringAlertsEnabled: integer("recurring_alerts_enabled").default(1).notNull(),
  notificationMethod: varchar("notification_method", { length: 20 }).default("in_app").notNull(),
  quietHoursStart: integer("quiet_hours_start"),
  quietHoursEnd: integer("quiet_hours_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: uniqueIndex("idx_notification_preferences_user_id").on(table.userId),
}));

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Daily Usage - Track daily API usage
 */
export const dailyUsage = pgTable("daily_usage", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  conversationCount: integer("conversation_count").default(0).notNull(),
  translationCount: integer("translation_count").default(0).notNull(),
  voiceMinutes: integer("voice_minutes").default(0).notNull(),
  iotCommandCount: integer("iot_command_count").default(0).notNull(),
  learningSessionCount: integer("learning_session_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_daily_usage_user_id").on(table.userId),
  dateIdx: index("idx_daily_usage_date").on(table.date),
}));

export type DailyUsage = typeof dailyUsage.$inferSelect;
export type InsertDailyUsage = typeof dailyUsage.$inferInsert;

// ==================== IoT Tables ====================

/**
 * IoT Devices - Smart home device connections
 */
export const iotDevices = pgTable("iot_devices", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceName: varchar("device_name", { length: 255 }).notNull(),
  deviceType: varchar("device_type", { length: 100 }).notNull(),
  protocol: varchar("protocol", { length: 50 }).notNull(),
  endpoint: varchar("endpoint", { length: 512 }),
  apiKey: varchar("api_key", { length: 512 }),
  status: varchar("status", { length: 50 }).default("offline").notNull(),
  lastSeen: timestamp("last_seen"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_iot_devices_user_id").on(table.userId),
  deviceTypeIdx: index("idx_iot_devices_device_type").on(table.deviceType),
}));

export type IotDevice = typeof iotDevices.$inferSelect;
export type InsertIotDevice = typeof iotDevices.$inferInsert;

/**
 * IoT Command History - Device command logs
 */
export const iotCommandHistory = pgTable("iot_command_history", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceId: integer("device_id").notNull(),
  command: varchar("command", { length: 255 }).notNull(),
  parameters: text("parameters"),
  status: varchar("status", { length: 50 }).notNull(),
  response: text("response"),
  executedAt: timestamp("executed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_iot_command_history_user_id").on(table.userId),
  deviceIdIdx: index("idx_iot_command_history_device_id").on(table.deviceId),
  executedAtIdx: index("idx_iot_command_history_executed_at").on(table.executedAt),
}));

export type IotCommandHistory = typeof iotCommandHistory.$inferSelect;
export type InsertIotCommandHistory = typeof iotCommandHistory.$inferInsert;

// ==================== Learning Tables ====================

/**
 * Learning Sessions - Verified learning sessions
 */
export const learningSessions = pgTable("learning_sessions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  explanation: text("explanation").notNull(),
  factCheckResults: text("fact_check_results"),
  credibilityScore: decimal("credibility_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_learning_sessions_user_id").on(table.userId),
  topicIdx: index("idx_learning_sessions_topic").on(table.topic),
}));

export type LearningSession = typeof learningSessions.$inferSelect;
export type InsertLearningSession = typeof learningSessions.$inferInsert;

/**
 * Fact Check Results - Verification results for learning content
 */
export const factCheckResults = pgTable("fact_check_results", {
  id: integer("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  statement: text("statement").notNull(),
  isVerified: boolean("is_verified").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  sources: text("sources"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("idx_fact_check_results_session_id").on(table.sessionId),
}));

export type FactCheckResult = typeof factCheckResults.$inferSelect;
export type InsertFactCheckResult = typeof factCheckResults.$inferInsert;

/**
 * Learning Sources - Citation sources for verified facts
 */
export const learningSources = pgTable("learning_sources", {
  id: integer("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  title: varchar("title", { length: 512 }),
  credibilityRating: decimal("credibility_rating", { precision: 5, scale: 2 }),
  citedAt: timestamp("cited_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("idx_learning_sources_session_id").on(table.sessionId),
}));

export type LearningSource = typeof learningSources.$inferSelect;
export type InsertLearningSource = typeof learningSources.$inferInsert;

/**
 * Study Guides - Generated study materials
 */
export const studyGuides = pgTable("study_guides", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id"),
  topic: varchar("topic", { length: 255 }).notNull(),
  content: text("content").notNull(),
  keyPoints: text("key_points"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_study_guides_user_id").on(table.userId),
  sessionIdIdx: index("idx_study_guides_session_id").on(table.sessionId),
}));

export type StudyGuide = typeof studyGuides.$inferSelect;
export type InsertStudyGuide = typeof studyGuides.$inferInsert;

/**
 * Quizzes - Generated quiz questions
 */
export const quizzes = pgTable("quizzes", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id"),
  topic: varchar("topic", { length: 255 }).notNull(),
  questions: text("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_quizzes_user_id").on(table.userId),
  sessionIdIdx: index("idx_quizzes_session_id").on(table.sessionId),
}));

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Quiz Attempts - User quiz submissions
 */
export const quizAttempts = pgTable("quiz_attempts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  answers: text("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_quiz_attempts_user_id").on(table.userId),
  quizIdIdx: index("idx_quiz_attempts_quiz_id").on(table.quizId),
}));

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Verified Facts - Long-term fact storage
 */
export const verifiedFacts = pgTable("verified_facts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id"),
  topic: varchar("topic", { length: 255 }).notNull(),
  statement: text("statement").notNull(),
  explanation: text("explanation"),
  sources: text("sources"),
  credibilityScore: decimal("credibility_score", { precision: 5, scale: 2 }).notNull(),
  verifiedAt: timestamp("verified_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  updateCount: integer("update_count").default(0).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  category: varchar("category", { length: 100 }),
  tags: text("tags"),
  accessCount: integer("access_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_verified_facts_user_id").on(table.userId),
  topicIdx: index("idx_verified_facts_topic").on(table.topic),
  categoryIdx: index("idx_verified_facts_category").on(table.category),
  isPublicIdx: index("idx_verified_facts_is_public").on(table.isPublic),
}));

export type VerifiedFact = typeof verifiedFacts.$inferSelect;
export type InsertVerifiedFact = typeof verifiedFacts.$inferInsert;

/**
 * Fact Access Log - Track fact usage
 */
export const factAccessLog = pgTable("fact_access_log", {
  id: integer("id").primaryKey(),
  factId: integer("fact_id").notNull(),
  userId: integer("user_id"),
  accessedAt: timestamp("accessed_at").defaultNow(),
}, (table) => ({
  factIdIdx: index("idx_fact_access_log_fact_id").on(table.factId),
  userIdIdx: index("idx_fact_access_log_user_id").on(table.userId),
}));

export type FactAccessLog = typeof factAccessLog.$inferSelect;
export type InsertFactAccessLog = typeof factAccessLog.$inferInsert;

/**
 * Fact Update Notifications - Notify users of fact updates
 */
export const factUpdateNotifications = pgTable("fact_update_notifications", {
  id: integer("id").primaryKey(),
  factId: integer("fact_id").notNull(),
  userId: integer("user_id").notNull(),
  oldCredibilityScore: decimal("old_credibility_score", { precision: 5, scale: 2 }),
  newCredibilityScore: decimal("new_credibility_score", { precision: 5, scale: 2 }),
  changeDescription: text("change_description"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  factIdIdx: index("idx_fact_update_notifications_fact_id").on(table.factId),
  userIdIdx: index("idx_fact_update_notifications_user_id").on(table.userId),
  isReadIdx: index("idx_fact_update_notifications_is_read").on(table.isRead),
}));

export type FactUpdateNotification = typeof factUpdateNotifications.$inferSelect;
export type InsertFactUpdateNotification = typeof factUpdateNotifications.$inferInsert;

// ==================== Language Learning Tables ====================

/**
 * Vocabulary Items - Language learning vocabulary database
 */
export const vocabularyItems = pgTable("vocabulary_items", {
  id: integer("id").primaryKey(),
  word: varchar("word", { length: 255 }).notNull(),
  translation: varchar("translation", { length: 255 }).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  partOfSpeech: varchar("part_of_speech", { length: 50 }),
  context: text("context"),
  pronunciation: varchar("pronunciation", { length: 255 }),
  exampleSentence: text("example_sentence"),
  exampleTranslation: text("example_translation"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  languageIdx: index("idx_vocabulary_items_language").on(table.language),
  difficultyIdx: index("idx_vocabulary_items_difficulty").on(table.difficulty),
}));

export type VocabularyItem = typeof vocabularyItems.$inferSelect;
export type InsertVocabularyItem = typeof vocabularyItems.$inferInsert;

/**
 * User Vocabulary - User progress on vocabulary words
 */
export const userVocabulary = pgTable("user_vocabulary", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vocabularyId: integer("vocabulary_id").notNull(),
  timesReviewed: integer("times_reviewed").default(0).notNull(),
  timesCorrect: integer("times_correct").default(0).notNull(),
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review"),
  masteryLevel: integer("mastery_level").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_vocabulary_user_id").on(table.userId),
  vocabularyIdIdx: index("idx_user_vocabulary_vocabulary_id").on(table.vocabularyId),
  nextReviewIdx: index("idx_user_vocabulary_next_review").on(table.nextReview),
}));

export type UserVocabulary = typeof userVocabulary.$inferSelect;
export type InsertUserVocabulary = typeof userVocabulary.$inferInsert;

/**
 * Grammar Lessons - Grammar explanations and examples
 */
export const grammarLessons = pgTable("grammar_lessons", {
  id: integer("id").primaryKey(),
  language: varchar("language", { length: 50 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  explanation: text("explanation").notNull(),
  examples: text("examples").notNull(),
  culturalNotes: text("cultural_notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  languageIdx: index("idx_grammar_lessons_language").on(table.language),
  difficultyIdx: index("idx_grammar_lessons_difficulty").on(table.difficulty),
}));

export type GrammarLesson = typeof grammarLessons.$inferSelect;
export type InsertGrammarLesson = typeof grammarLessons.$inferInsert;

/**
 * User Grammar Progress - User progress on grammar topics
 */
export const userGrammarProgress = pgTable("user_grammar_progress", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_grammar_progress_user_id").on(table.userId),
  lessonIdIdx: index("idx_user_grammar_progress_lesson_id").on(table.lessonId),
}));

export type UserGrammarProgress = typeof userGrammarProgress.$inferSelect;
export type InsertUserGrammarProgress = typeof userGrammarProgress.$inferInsert;

/**
 * Language Exercises - Practice exercises
 */
export const languageExercises = pgTable("language_exercises", {
  id: integer("id").primaryKey(),
  language: varchar("language", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: text("options"),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  languageIdx: index("idx_language_exercises_language").on(table.language),
  typeIdx: index("idx_language_exercises_type").on(table.type),
  difficultyIdx: index("idx_language_exercises_difficulty").on(table.difficulty),
}));

export type LanguageExercise = typeof languageExercises.$inferSelect;
export type InsertLanguageExercise = typeof languageExercises.$inferInsert;

/**
 * Exercise Attempts - User exercise submissions
 */
export const exerciseAttempts = pgTable("exercise_attempts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  userAnswer: text("user_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_exercise_attempts_user_id").on(table.userId),
  exerciseIdIdx: index("idx_exercise_attempts_exercise_id").on(table.exerciseId),
}));

export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = typeof exerciseAttempts.$inferInsert;

/**
 * User Language Progress - Overall language fluency tracking
 */
export const userLanguageProgress = pgTable("user_language_progress", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  vocabularySize: integer("vocabulary_size").default(0).notNull(),
  grammarTopicsMastered: integer("grammar_topics_mastered").default(0).notNull(),
  exercisesCompleted: integer("exercises_completed").default(0).notNull(),
  fluencyScore: integer("fluency_score").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastPracticed: timestamp("last_practiced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_language_progress_user_id").on(table.userId),
  languageIdx: index("idx_user_language_progress_language").on(table.language),
}));

export type UserLanguageProgress = typeof userLanguageProgress.$inferSelect;
export type InsertUserLanguageProgress = typeof userLanguageProgress.$inferInsert;

/**
 * Daily Lessons - Personalized daily lesson plans
 */
export const dailyLessons = pgTable("daily_lessons", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  date: date("date").notNull(),
  content: text("content").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_daily_lessons_user_id").on(table.userId),
  dateIdx: index("idx_daily_lessons_date").on(table.date),
}));

export type DailyLesson = typeof dailyLessons.$inferSelect;
export type InsertDailyLesson = typeof dailyLessons.$inferInsert;

/**
 * Language Achievements - Badges and milestones
 */
export const languageAchievements = pgTable("language_achievements", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  achievementType: varchar("achievement_type", { length: 100 }).notNull(),
  achievementName: varchar("achievement_name", { length: 255 }).notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_language_achievements_user_id").on(table.userId),
  languageIdx: index("idx_language_achievements_language").on(table.language),
}));

export type LanguageAchievement = typeof languageAchievements.$inferSelect;
export type InsertLanguageAchievement = typeof languageAchievements.$inferInsert;

// ==================== Debt & Budget Tables ====================

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
  dueDate: integer("due_date").notNull(),
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
 * Debt Milestones - Debt payoff milestones
 */
export const debtMilestones = pgTable("debt_milestones", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  debtId: integer("debt_id").notNull(),
  milestoneType: varchar("milestone_type", { length: 50 }).notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  targetDate: timestamp("target_date"),
  isAchieved: boolean("is_achieved").default(false).notNull(),
  achievedAt: timestamp("achieved_at"),
  celebrationMessage: text("celebration_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_debt_milestones_user_id").on(table.userId),
  debtIdIdx: index("idx_debt_milestones_debt_id").on(table.debtId),
  isAchievedIdx: index("idx_debt_milestones_is_achieved").on(table.isAchieved),
}));

export type DebtMilestone = typeof debtMilestones.$inferSelect;
export type InsertDebtMilestone = typeof debtMilestones.$inferInsert;

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
  payoffOrder: text("payoff_order").notNull(),
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
 * Coaching Recommendations - AI-generated recommendations
 */
export const coachingRecommendations = pgTable("coaching_recommendations", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recommendationType: varchar("recommendation_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  estimatedImpact: varchar("estimated_impact", { length: 255 }),
  actionSteps: text("action_steps"),
  relatedDebtId: integer("related_debt_id"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  dismissedAt: timestamp("dismissed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_coaching_recommendations_user_id").on(table.userId),
  statusIdx: index("idx_coaching_recommendations_status").on(table.status),
}));

export type CoachingRecommendation = typeof coachingRecommendations.$inferSelect;
export type InsertCoachingRecommendation = typeof coachingRecommendations.$inferInsert;

/**
 * Coaching Feedback - User feedback on recommendations
 */
export const coachingFeedback = pgTable("coaching_feedback", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recommendationId: integer("recommendation_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  wasHelpful: boolean("was_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_coaching_feedback_user_id").on(table.userId),
  recommendationIdIdx: index("idx_coaching_feedback_recommendation_id").on(table.recommendationId),
}));

export type CoachingFeedback = typeof coachingFeedback.$inferSelect;
export type InsertCoachingFeedback = typeof coachingFeedback.$inferInsert;

/**
 * Debt Budget Snapshots - Monthly budget tracking
 */
export const debtBudgetSnapshots = pgTable("debt_budget_snapshots", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  monthYear: varchar("month_year", { length: 7 }).notNull(),
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
  type: varchar("type", { length: 50 }).notNull(),
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
 * Budget Transactions - Income and expense transactions
 */
export const budgetTransactions = pgTable("budget_transactions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 512 }),
  transactionDate: timestamp("transaction_date").notNull(),
  notes: text("notes"),
  receiptUrl: varchar("receipt_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_budget_transactions_user_id").on(table.userId),
  categoryIdIdx: index("idx_budget_transactions_category_id").on(table.categoryId),
  transactionDateIdx: index("idx_budget_transactions_transaction_date").on(table.transactionDate),
}));

export type BudgetTransaction = typeof budgetTransactions.$inferSelect;
export type InsertBudgetTransaction = typeof budgetTransactions.$inferInsert;

/**
 * Monthly Budget Summaries - Aggregated monthly data
 */
export const monthlyBudgetSummaries = pgTable("monthly_budget_summaries", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  monthYear: varchar("month_year", { length: 7 }).notNull(),
  totalIncome: decimal("total_income", { precision: 10, scale: 2 }).notNull(),
  totalExpenses: decimal("total_expenses", { precision: 10, scale: 2 }).notNull(),
  netSavings: decimal("net_savings", { precision: 10, scale: 2 }).notNull(),
  savingsRate: decimal("savings_rate", { precision: 5, scale: 2 }),
  categoryBreakdown: text("category_breakdown"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_monthly_budget_summaries_user_id").on(table.userId),
  monthYearIdx: index("idx_monthly_budget_summaries_month_year").on(table.monthYear),
}));

export type MonthlyBudgetSummary = typeof monthlyBudgetSummaries.$inferSelect;
export type InsertMonthlyBudgetSummary = typeof monthlyBudgetSummaries.$inferInsert;

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
 * Goal Milestones - Milestones for financial goals
 */
export const goalMilestones = pgTable("goal_milestones", {
  id: integer("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isAchieved: boolean("is_achieved").default(false).notNull(),
  achievedAt: timestamp("achieved_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  goalIdIdx: index("idx_goal_milestones_goal_id").on(table.goalId),
}));

export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type InsertGoalMilestone = typeof goalMilestones.$inferInsert;

/**
 * Goal Progress History - Track goal progress over time
 */
export const goalProgressHistory = pgTable("goal_progress_history", {
  id: integer("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  goalIdIdx: index("idx_goal_progress_history_goal_id").on(table.goalId),
  recordedAtIdx: index("idx_goal_progress_history_recorded_at").on(table.recordedAt),
}));

export type GoalProgressHistory = typeof goalProgressHistory.$inferSelect;
export type InsertGoalProgressHistory = typeof goalProgressHistory.$inferInsert;

/**
 * Budget Alerts - Budget threshold alerts
 */
export const budgetAlerts = pgTable("budget_alerts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_budget_alerts_user_id").on(table.userId),
  categoryIdIdx: index("idx_budget_alerts_category_id").on(table.categoryId),
  isReadIdx: index("idx_budget_alerts_is_read").on(table.isRead),
}));

export type BudgetAlert = typeof budgetAlerts.$inferSelect;
export type InsertBudgetAlert = typeof budgetAlerts.$inferInsert;

/**
 * Financial Insights - AI-generated financial insights
 */
export const financialInsights = pgTable("financial_insights", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  insightType: varchar("insight_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  relatedCategoryId: integer("related_category_id"),
  actionable: boolean("actionable").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  dismissedAt: timestamp("dismissed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_financial_insights_user_id").on(table.userId),
  isDismissedIdx: index("idx_financial_insights_is_dismissed").on(table.isDismissed),
}));

export type FinancialInsight = typeof financialInsights.$inferSelect;
export type InsertFinancialInsight = typeof financialInsights.$inferInsert;

/**
 * Budget Templates - Pre-built budget templates
 */
export const budgetTemplates = pgTable("budget_templates", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categories: text("categories").notNull(),
  isSystemTemplate: integer("is_system_template").default(0).notNull(),
  userId: integer("user_id"),
  usageCount: integer("usage_count").default(0).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  isSystemTemplateIdx: index("idx_budget_templates_is_system").on(table.isSystemTemplate),
  userIdIdx: index("idx_budget_templates_user_id").on(table.userId),
}));

export type BudgetTemplate = typeof budgetTemplates.$inferSelect;
export type InsertBudgetTemplate = typeof budgetTemplates.$inferInsert;

/**
 * User Budget Templates - Track template applications
 */
export const userBudgetTemplates = pgTable("user_budget_templates", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  templateId: integer("template_id").notNull(),
  monthlyIncome: integer("monthly_income").notNull(),
  isActive: integer("is_active").default(1).notNull(),
  appliedAt: timestamp("applied_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_budget_templates_user_id").on(table.userId),
  templateIdIdx: index("idx_user_budget_templates_template_id").on(table.templateId),
}));

export type UserBudgetTemplate = typeof userBudgetTemplates.$inferSelect;
export type InsertUserBudgetTemplate = typeof userBudgetTemplates.$inferInsert;

/**
 * Recurring Transactions - Detected recurring patterns
 */
export const recurringTransactions = pgTable("recurring_transactions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  description: varchar("description", { length: 512 }).notNull(),
  averageAmount: decimal("average_amount", { precision: 10, scale: 2 }).notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  nextExpectedDate: timestamp("next_expected_date"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_recurring_transactions_user_id").on(table.userId),
  categoryIdIdx: index("idx_recurring_transactions_category_id").on(table.categoryId),
  nextExpectedDateIdx: index("idx_recurring_transactions_next_expected_date").on(table.nextExpectedDate),
}));

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type InsertRecurringTransaction = typeof recurringTransactions.$inferInsert;

/**
 * Shared Budgets - Budget sharing between users
 */
export const sharedBudgets = pgTable("shared_budgets", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  ownerIdIdx: index("idx_shared_budgets_owner_id").on(table.ownerId),
}));

export type SharedBudget = typeof sharedBudgets.$inferSelect;
export type InsertSharedBudget = typeof sharedBudgets.$inferInsert;

/**
 * Shared Budget Members - Members of shared budgets
 */
export const sharedBudgetMembers = pgTable("shared_budget_members", {
  id: integer("id").primaryKey(),
  sharedBudgetId: integer("shared_budget_id").notNull(),
  userId: integer("user_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sharedBudgetIdIdx: index("idx_shared_budget_members_shared_budget_id").on(table.sharedBudgetId),
  userIdIdx: index("idx_shared_budget_members_user_id").on(table.userId),
}));

export type SharedBudgetMember = typeof sharedBudgetMembers.$inferSelect;
export type InsertSharedBudgetMember = typeof sharedBudgetMembers.$inferInsert;

/**
 * Shared Budget Categories - Categories in shared budgets
 */
export const sharedBudgetCategories = pgTable("shared_budget_categories", {
  id: integer("id").primaryKey(),
  sharedBudgetId: integer("shared_budget_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  monthlyLimit: decimal("monthly_limit", { precision: 10, scale: 2 }),
  color: varchar("color", { length: 7 }),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sharedBudgetIdIdx: index("idx_shared_budget_categories_shared_budget_id").on(table.sharedBudgetId),
}));

export type SharedBudgetCategory = typeof sharedBudgetCategories.$inferSelect;
export type InsertSharedBudgetCategory = typeof sharedBudgetCategories.$inferInsert;

/**
 * Shared Budget Transactions - Transactions in shared budgets
 */
export const sharedBudgetTransactions = pgTable("shared_budget_transactions", {
  id: integer("id").primaryKey(),
  sharedBudgetId: integer("shared_budget_id").notNull(),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 512 }),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sharedBudgetIdIdx: index("idx_shared_budget_transactions_shared_budget_id").on(table.sharedBudgetId),
  categoryIdIdx: index("idx_shared_budget_transactions_category_id").on(table.categoryId),
  userIdIdx: index("idx_shared_budget_transactions_user_id").on(table.userId),
}));

export type SharedBudgetTransaction = typeof sharedBudgetTransactions.$inferSelect;
export type InsertSharedBudgetTransaction = typeof sharedBudgetTransactions.$inferInsert;

/**
 * Split Expenses - Expense splitting between users
 */
export const splitExpenses = pgTable("split_expenses", {
  id: integer("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  transactionIdIdx: index("idx_split_expenses_transaction_id").on(table.transactionId),
  userIdIdx: index("idx_split_expenses_user_id").on(table.userId),
}));

export type SplitExpense = typeof splitExpenses.$inferSelect;
export type InsertSplitExpense = typeof splitExpenses.$inferInsert;

/**
 * Shared Budget Activity - Activity log for shared budgets
 */
export const sharedBudgetActivity = pgTable("shared_budget_activity", {
  id: integer("id").primaryKey(),
  sharedBudgetId: integer("shared_budget_id").notNull(),
  userId: integer("user_id").notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sharedBudgetIdIdx: index("idx_shared_budget_activity_shared_budget_id").on(table.sharedBudgetId),
  createdAtIdx: index("idx_shared_budget_activity_created_at").on(table.createdAt),
}));

export type SharedBudgetActivity = typeof sharedBudgetActivity.$inferSelect;
export type InsertSharedBudgetActivity = typeof sharedBudgetActivity.$inferInsert;

// ==================== Math & Science Tables ====================

/**
 * Math Problems - Math practice problems
 */
export const mathProblems = pgTable("math_problems", {
  id: integer("id").primaryKey(),
  topic: varchar("topic", { length: 255 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  problemText: text("problem_text").notNull(),
  solution: text("solution").notNull(),
  explanation: text("explanation"),
  hints: text("hints"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  topicIdx: index("idx_math_problems_topic").on(table.topic),
  difficultyIdx: index("idx_math_problems_difficulty").on(table.difficulty),
}));

export type MathProblem = typeof mathProblems.$inferSelect;
export type InsertMathProblem = typeof mathProblems.$inferInsert;

/**
 * Math Solutions - User solutions to math problems
 */
export const mathSolutions = pgTable("math_solutions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  userSolution: text("user_solution").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_math_solutions_user_id").on(table.userId),
  problemIdIdx: index("idx_math_solutions_problem_id").on(table.problemId),
}));

export type MathSolution = typeof mathSolutions.$inferSelect;
export type InsertMathSolution = typeof mathSolutions.$inferInsert;

/**
 * Math Progress - User progress in math topics
 */
export const mathProgress = pgTable("math_progress", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  problemsSolved: integer("problems_solved").default(0).notNull(),
  correctSolutions: integer("correct_solutions").default(0).notNull(),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }),
  lastPracticed: timestamp("last_practiced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_math_progress_user_id").on(table.userId),
  topicIdx: index("idx_math_progress_topic").on(table.topic),
}));

export type MathProgress = typeof mathProgress.$inferSelect;
export type InsertMathProgress = typeof mathProgress.$inferInsert;

/**
 * Experiments - Science experiment guides
 */
export const experiments = pgTable("experiments", {
  id: integer("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  objective: text("objective").notNull(),
  materials: text("materials").notNull(),
  safetyNotes: text("safety_notes"),
  estimatedTime: integer("estimated_time"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  subjectIdx: index("idx_experiments_subject").on(table.subject),
  difficultyIdx: index("idx_experiments_difficulty").on(table.difficulty),
}));

export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = typeof experiments.$inferInsert;

/**
 * Experiment Steps - Procedure steps for experiments
 */
export const experimentSteps = pgTable("experiment_steps", {
  id: integer("id").primaryKey(),
  experimentId: integer("experiment_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  instruction: text("instruction").notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  experimentIdIdx: index("idx_experiment_steps_experiment_id").on(table.experimentId),
}));

export type ExperimentStep = typeof experimentSteps.$inferSelect;
export type InsertExperimentStep = typeof experimentSteps.$inferInsert;

/**
 * User Lab Results - User experiment results
 */
export const userLabResults = pgTable("user_lab_results", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  experimentId: integer("experiment_id").notNull(),
  observations: text("observations").notNull(),
  conclusion: text("conclusion"),
  photos: text("photos"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_lab_results_user_id").on(table.userId),
  experimentIdIdx: index("idx_user_lab_results_experiment_id").on(table.experimentId),
}));

export type UserLabResult = typeof userLabResults.$inferSelect;
export type InsertUserLabResult = typeof userLabResults.$inferInsert;

/**
 * Science Progress - User progress in science topics
 */
export const scienceProgress = pgTable("science_progress", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  experimentsCompleted: integer("experiments_completed").default(0).notNull(),
  quizzesPassed: integer("quizzes_passed").default(0).notNull(),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_science_progress_user_id").on(table.userId),
  subjectIdx: index("idx_science_progress_subject").on(table.subject),
}));

export type ScienceProgress = typeof scienceProgress.$inferSelect;
export type InsertScienceProgress = typeof scienceProgress.$inferInsert;

/**
 * Lab Quiz Questions - Quiz questions for experiments
 */
export const labQuizQuestions = pgTable("lab_quiz_questions", {
  id: integer("id").primaryKey(),
  experimentId: integer("experiment_id").notNull(),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: text("options"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  experimentIdIdx: index("idx_lab_quiz_questions_experiment_id").on(table.experimentId),
}));

export type LabQuizQuestion = typeof labQuizQuestions.$inferSelect;
export type InsertLabQuizQuestion = typeof labQuizQuestions.$inferInsert;

/**
 * Lab Quiz Attempts - User quiz attempts for experiments
 */
export const labQuizAttempts = pgTable("lab_quiz_attempts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  experimentId: integer("experiment_id").notNull(),
  answers: text("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_lab_quiz_attempts_user_id").on(table.userId),
  experimentIdIdx: index("idx_lab_quiz_attempts_experiment_id").on(table.experimentId),
}));

export type LabQuizAttempt = typeof labQuizAttempts.$inferSelect;
export type InsertLabQuizAttempt = typeof labQuizAttempts.$inferInsert;

// ==================== Wellbeing & Health Tables ====================

/**
 * Workouts - Workout templates and guides
 */
export const workouts = pgTable("workouts", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  duration: integer("duration").notNull(),
  caloriesBurned: integer("calories_burned"),
  description: text("description"),
  instructions: text("instructions"),
  videoUrl: varchar("video_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_workouts_category").on(table.category),
  difficultyIdx: index("idx_workouts_difficulty").on(table.difficulty),
}));

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = typeof workouts.$inferInsert;

/**
 * User Workout History - User workout logs
 */
export const userWorkoutHistory = pgTable("user_workout_history", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  workoutId: integer("workout_id").notNull(),
  duration: integer("duration").notNull(),
  caloriesBurned: integer("calories_burned"),
  notes: text("notes"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_workout_history_user_id").on(table.userId),
  workoutIdIdx: index("idx_user_workout_history_workout_id").on(table.workoutId),
}));

export type UserWorkoutHistory = typeof userWorkoutHistory.$inferSelect;
export type InsertUserWorkoutHistory = typeof userWorkoutHistory.$inferInsert;

/**
 * Daily Activity Stats - Daily activity tracking
 */
export const dailyActivityStats = pgTable("daily_activity_stats", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  steps: integer("steps").default(0).notNull(),
  caloriesBurned: integer("calories_burned").default(0).notNull(),
  activeMinutes: integer("active_minutes").default(0).notNull(),
  distance: decimal("distance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_daily_activity_stats_user_id").on(table.userId),
  dateIdx: index("idx_daily_activity_stats_date").on(table.date),
}));

export type DailyActivityStat = typeof dailyActivityStats.$inferSelect;
export type InsertDailyActivityStat = typeof dailyActivityStats.$inferInsert;

/**
 * Food Log - Nutrition tracking
 */
export const foodLog = pgTable("food_log", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(),
  foodName: varchar("food_name", { length: 255 }).notNull(),
  calories: integer("calories"),
  protein: decimal("protein", { precision: 10, scale: 2 }),
  carbs: decimal("carbs", { precision: 10, scale: 2 }),
  fat: decimal("fat", { precision: 10, scale: 2 }),
  fiber: decimal("fiber", { precision: 10, scale: 2 }),
  servingSize: varchar("serving_size", { length: 100 }),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_food_log_user_id").on(table.userId),
  loggedAtIdx: index("idx_food_log_logged_at").on(table.loggedAt),
}));

export type FoodLog = typeof foodLog.$inferSelect;
export type InsertFoodLog = typeof foodLog.$inferInsert;

/**
 * Hydration Log - Water intake tracking
 */
export const hydrationLog = pgTable("hydration_log", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  unit: varchar("unit", { length: 20 }).default("ml").notNull(),
  loggedAt: timestamp("logged_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_hydration_log_user_id").on(table.userId),
  loggedAtIdx: index("idx_hydration_log_logged_at").on(table.loggedAt),
}));

export type HydrationLog = typeof hydrationLog.$inferSelect;
export type InsertHydrationLog = typeof hydrationLog.$inferInsert;

/**
 * Meditation Sessions - Meditation practice logs
 */
export const meditationSessions = pgTable("meditation_sessions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  duration: integer("duration").notNull(),
  type: varchar("type", { length: 100 }),
  notes: text("notes"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_meditation_sessions_user_id").on(table.userId),
  completedAtIdx: index("idx_meditation_sessions_completed_at").on(table.completedAt),
}));

export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = typeof meditationSessions.$inferInsert;

/**
 * Mood Log - Mood and emotion tracking
 */
export const moodLog = pgTable("mood_log", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mood: varchar("mood", { length: 50 }).notNull(),
  intensity: integer("intensity").notNull(),
  notes: text("notes"),
  triggers: text("triggers"),
  loggedAt: timestamp("logged_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_mood_log_user_id").on(table.userId),
  loggedAtIdx: index("idx_mood_log_logged_at").on(table.loggedAt),
}));

export type MoodLog = typeof moodLog.$inferSelect;
export type InsertMoodLog = typeof moodLog.$inferInsert;

/**
 * Journal Entries - Personal journal entries
 */
export const journalEntries = pgTable("journal_entries", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mood: varchar("mood", { length: 50 }),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_journal_entries_user_id").on(table.userId),
  createdAtIdx: index("idx_journal_entries_created_at").on(table.createdAt),
}));

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Sleep Tracking - Sleep quality and duration
 */
export const sleepTracking = pgTable("sleep_tracking", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sleepDate: date("sleep_date").notNull(),
  bedtime: timestamp("bedtime").notNull(),
  wakeTime: timestamp("wake_time").notNull(),
  duration: integer("duration").notNull(),
  quality: integer("quality"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_sleep_tracking_user_id").on(table.userId),
  sleepDateIdx: index("idx_sleep_tracking_sleep_date").on(table.sleepDate),
}));

export type SleepTracking = typeof sleepTracking.$inferSelect;
export type InsertSleepTracking = typeof sleepTracking.$inferInsert;

/**
 * Health Metrics - Vital signs and health measurements
 */
export const healthMetrics = pgTable("health_metrics", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_health_metrics_user_id").on(table.userId),
  metricTypeIdx: index("idx_health_metrics_metric_type").on(table.metricType),
  recordedAtIdx: index("idx_health_metrics_recorded_at").on(table.recordedAt),
}));

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = typeof healthMetrics.$inferInsert;

/**
 * Wellbeing Reminders - Custom health reminders
 */
export const wellbeingReminders = pgTable("wellbeing_reminders", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(),
  message: varchar("message", { length: 512 }).notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_wellbeing_reminders_user_id").on(table.userId),
  isActiveIdx: index("idx_wellbeing_reminders_is_active").on(table.isActive),
}));

export type WellbeingReminder = typeof wellbeingReminders.$inferSelect;
export type InsertWellbeingReminder = typeof wellbeingReminders.$inferInsert;

/**
 * Wellness Profiles - User wellness preferences and goals
 */
export const wellnessProfiles = pgTable("wellness_profiles", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  activityLevel: varchar("activity_level", { length: 50 }),
  fitnessGoals: text("fitness_goals"),
  dietaryPreferences: text("dietary_preferences"),
  healthConditions: text("health_conditions"),
  medications: text("medications"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: uniqueIndex("idx_wellness_profiles_user_id").on(table.userId),
}));

export type WellnessProfile = typeof wellnessProfiles.$inferSelect;
export type InsertWellnessProfile = typeof wellnessProfiles.$inferInsert;

/**
 * Wellness Goals - User wellness goals and targets
 */
export const wellnessGoals = pgTable("wellness_goals", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalType: varchar("goal_type", { length: 50 }).notNull(),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).default("0"),
  unit: varchar("unit", { length: 20 }).notNull(),
  targetDate: date("target_date"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_wellness_goals_user_id").on(table.userId),
  statusIdx: index("idx_wellness_goals_status").on(table.status),
}));

export type WellnessGoal = typeof wellnessGoals.$inferSelect;
export type InsertWellnessGoal = typeof wellnessGoals.$inferInsert;

// ==================== Wearable Integration Tables ====================

/**
 * Wearable Connections - Connected wearable devices
 */
export const wearableConnections = pgTable("wearable_connections", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_wearable_connections_user_id").on(table.userId),
  providerIdx: index("idx_wearable_connections_provider").on(table.provider),
}));

export type WearableConnection = typeof wearableConnections.$inferSelect;
export type InsertWearableConnection = typeof wearableConnections.$inferInsert;

/**
 * Wearable Sync Logs - Sync history for wearables
 */
export const wearableSyncLogs = pgTable("wearable_sync_logs", {
  id: integer("id").primaryKey(),
  connectionId: integer("connection_id").notNull(),
  syncType: varchar("sync_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  recordsSynced: integer("records_synced").default(0).notNull(),
  errorMessage: text("error_message"),
  syncedAt: timestamp("synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  connectionIdIdx: index("idx_wearable_sync_logs_connection_id").on(table.connectionId),
  syncedAtIdx: index("idx_wearable_sync_logs_synced_at").on(table.syncedAt),
}));

export type WearableSyncLog = typeof wearableSyncLogs.$inferSelect;
export type InsertWearableSyncLog = typeof wearableSyncLogs.$inferInsert;

/**
 * Wearable Data Cache - Cached wearable data
 */
export const wearableDataCache = pgTable("wearable_data_cache", {
  id: integer("id").primaryKey(),
  connectionId: integer("connection_id").notNull(),
  dataType: varchar("data_type", { length: 50 }).notNull(),
  dataDate: date("data_date").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  connectionIdIdx: index("idx_wearable_data_cache_connection_id").on(table.connectionId),
  dataDateIdx: index("idx_wearable_data_cache_data_date").on(table.dataDate),
}));

export type WearableDataCache = typeof wearableDataCache.$inferSelect;
export type InsertWearableDataCache = typeof wearableDataCache.$inferInsert;

// ==================== Translation Tables ====================

/**
 * Translation Categories - Categories for saved translations
 */
export const translationCategories = pgTable("translation_categories", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_translation_categories_user_id").on(table.userId),
}));

export type TranslationCategory = typeof translationCategories.$inferSelect;
export type InsertTranslationCategory = typeof translationCategories.$inferInsert;

/**
 * Saved Translations - User's saved translation pairs
 */
export const savedTranslations = pgTable("saved_translations", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id"),
  sourceText: text("source_text").notNull(),
  translatedText: text("translated_text").notNull(),
  sourceLanguage: varchar("source_language", { length: 10 }).notNull(),
  targetLanguage: varchar("target_language", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_saved_translations_user_id").on(table.userId),
  categoryIdIdx: index("idx_saved_translations_category_id").on(table.categoryId),
}));

export type SavedTranslation = typeof savedTranslations.$inferSelect;
export type InsertSavedTranslation = typeof savedTranslations.$inferInsert;

/**
 * Conversation Sessions - Language practice conversations
 */
export const conversationSessions = pgTable("conversation_sessions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  scenario: varchar("scenario", { length: 255 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_conversation_sessions_user_id").on(table.userId),
  languageIdx: index("idx_conversation_sessions_language").on(table.language),
}));

export type ConversationSession = typeof conversationSessions.$inferSelect;
export type InsertConversationSession = typeof conversationSessions.$inferInsert;

/**
 * Conversation Messages - Messages in practice conversations
 */
export const conversationMessages = pgTable("conversation_messages", {
  id: integer("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  sender: varchar("sender", { length: 20 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("idx_conversation_messages_session_id").on(table.sessionId),
}));

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = typeof conversationMessages.$inferInsert;

/**
 * Topic Progress - Learning hub topic progress
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
 * Topic Quiz Results - Quiz results for learning hub topics
 */
export const topicQuizResults = pgTable("topic_quiz_results", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: varchar("topic_id", { length: 255 }).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  answers: text("answers"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_topic_quiz_results_user_id").on(table.userId),
  topicIdIdx: index("idx_topic_quiz_results_topic_id").on(table.topicId),
}));

export type TopicQuizResult = typeof topicQuizResults.$inferSelect;
export type InsertTopicQuizResult = typeof topicQuizResults.$inferInsert;

/**
 * Practice Sessions - Practice session tracking
 */
export const practiceSessions = pgTable("practice_sessions", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: varchar("topic_id", { length: 255 }).notNull(),
  problemsSolved: integer("problems_solved").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_practice_sessions_user_id").on(table.userId),
  topicIdIdx: index("idx_practice_sessions_topic_id").on(table.topicId),
}));

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = typeof practiceSessions.$inferInsert;

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
  translations: text("translations"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdIdx: index("idx_translate_messages_conversation").on(table.conversationId),
  senderIdIdx: index("idx_translate_messages_sender").on(table.senderId),
}));

export type TranslateMessage = typeof translateMessages.$inferSelect;
export type InsertTranslateMessage = typeof translateMessages.$inferInsert;

/**
 * Translate Message Translations - Individual translations for messages
 */
export const translateMessageTranslations = pgTable("translate_message_translations", {
  id: integer("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  translatedText: text("translated_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageIdIdx: index("idx_translate_message_translations_message_id").on(table.messageId),
  languageIdx: index("idx_translate_message_translations_language").on(table.language),
}));

export type TranslateMessageTranslation = typeof translateMessageTranslations.$inferSelect;
export type InsertTranslateMessageTranslation = typeof translateMessageTranslations.$inferInsert;

// ==================== Learn Finance Tables ====================

/**
 * Finance Articles - Financial education articles
 */
export const financeArticles = pgTable("finance_articles", {
  id: integer("id").primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  readTime: integer("read_time").notNull(),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("idx_finance_articles_slug").on(table.slug),
  categoryIdx: index("idx_finance_articles_category").on(table.category),
  difficultyIdx: index("idx_finance_articles_difficulty").on(table.difficulty),
}));

export type FinanceArticle = typeof financeArticles.$inferSelect;
export type InsertFinanceArticle = typeof financeArticles.$inferInsert;

/**
 * User Learning Progress - User progress in finance articles
 */
export const userLearningProgress = pgTable("user_learning_progress", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  progress: integer("progress").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_learning_progress_user_id").on(table.userId),
  articleIdIdx: index("idx_user_learning_progress_article_id").on(table.articleId),
}));

export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = typeof userLearningProgress.$inferInsert;

/**
 * Financial Glossary - Financial terms and definitions
 */
export const financialGlossary = pgTable("financial_glossary", {
  id: integer("id").primaryKey(),
  term: varchar("term", { length: 255 }).notNull().unique(),
  definition: text("definition").notNull(),
  example: text("example"),
  relatedTerms: text("related_terms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  termIdx: uniqueIndex("idx_financial_glossary_term").on(table.term),
}));

export type FinancialGlossary = typeof financialGlossary.$inferSelect;
export type InsertFinancialGlossary = typeof financialGlossary.$inferInsert;

/**
 * Learning Badges - Achievement badges for learning
 */
export const learningBadges = pgTable("learning_badges", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }),
  requirement: text("requirement").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  nameIdx: index("idx_learning_badges_name").on(table.name),
}));

export type LearningBadge = typeof learningBadges.$inferSelect;
export type InsertLearningBadge = typeof learningBadges.$inferInsert;

/**
 * User Learning Badges - Badges earned by users
 */
export const userLearningBadges = pgTable("user_learning_badges", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_learning_badges_user_id").on(table.userId),
  badgeIdIdx: index("idx_user_learning_badges_badge_id").on(table.badgeId),
}));

export type UserLearningBadge = typeof userLearningBadges.$inferSelect;
export type InsertUserLearningBadge = typeof userLearningBadges.$inferInsert;

/**
 * Tier Assessments - Financial literacy assessments
 */
export const tierAssessments = pgTable("tier_assessments", {
  id: integer("id").primaryKey(),
  tier: varchar("tier", { length: 50 }).notNull(),
  questions: text("questions").notNull(),
  passingScore: integer("passing_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tierIdx: index("idx_tier_assessments_tier").on(table.tier),
}));

export type TierAssessment = typeof tierAssessments.$inferSelect;
export type InsertTierAssessment = typeof tierAssessments.$inferInsert;

/**
 * User Tier Assessment Attempts - User assessment attempts
 */
export const userTierAssessmentAttempts = pgTable("user_tier_assessment_attempts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assessmentId: integer("assessment_id").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  answers: text("answers"),
  attemptedAt: timestamp("attempted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_tier_assessment_attempts_user_id").on(table.userId),
  assessmentIdIdx: index("idx_user_tier_assessment_attempts_assessment_id").on(table.assessmentId),
}));

export type UserTierAssessmentAttempt = typeof userTierAssessmentAttempts.$inferSelect;
export type InsertUserTierAssessmentAttempt = typeof userTierAssessmentAttempts.$inferInsert;

/**
 * Article Quizzes - Quizzes for finance articles
 */
export const articleQuizzes = pgTable("article_quizzes", {
  id: integer("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: text("answers"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  articleIdIdx: index("idx_article_quizzes_article_id").on(table.articleId),
  userIdIdx: index("idx_article_quizzes_user_id").on(table.userId),
}));

export type ArticleQuiz = typeof articleQuizzes.$inferSelect;
export type InsertArticleQuiz = typeof articleQuizzes.$inferInsert;
