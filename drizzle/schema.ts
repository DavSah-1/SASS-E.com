import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * User table (Manus Database)
 * In dual database mode: stores admin/owner accounts using Manus OAuth
 * In single database mode: stores all users
 * Regular users in dual mode are stored in Supabase database (see server/supabaseDb.ts).
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** User identifier - can be Supabase ID or Manus openId depending on auth mode */
  supabaseId: varchar("supabaseId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en"),
  preferredCurrency: varchar("preferredCurrency", { length: 3 }).default("USD"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "starter", "pro", "ultimate"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "inactive", "trial"]).default("inactive").notNull(),
  subscriptionPeriod: mysqlEnum("subscriptionPeriod", ["monthly", "six_month", "annual"]).default("monthly"),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  selectedSpecializedHubs: text("selectedSpecializedHubs"), // JSON array of selected hubs for Starter/Pro tiers
  hubsSelectedAt: timestamp("hubsSelectedAt"), // Timestamp when user selected their hubs (locks until subscription ends)
  subscriptionPrice: decimal("subscriptionPrice", { precision: 10, scale: 2 }),
  subscriptionCurrency: varchar("subscriptionCurrency", { length: 3 }).default("GBP"),
  staySignedIn: boolean("staySignedIn").default(false).notNull(),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  twoFactorSecret: varchar("twoFactorSecret", { length: 255 }),
  backupCodes: text("backupCodes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversation history table to store user interactions with the sarcastic AI
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userMessage: text("userMessage").notNull(),
  assistantResponse: text("assistantResponse").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * IoT Devices table for smart home integration
 */
export const iotDevices = mysqlTable("iot_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceId: varchar("deviceId", { length: 128 }).notNull().unique(),
  deviceName: varchar("deviceName", { length: 255 }).notNull(),
  deviceType: mysqlEnum("deviceType", ["light", "thermostat", "plug", "switch", "sensor", "lock", "camera", "speaker", "other"]).notNull(),
  room: varchar("room", { length: 128 }).default("Uncategorized"),
  manufacturer: varchar("manufacturer", { length: 128 }),
  model: varchar("model", { length: 128 }),
  status: mysqlEnum("status", ["online", "offline", "error"]).default("offline").notNull(),
  state: text("state"), // JSON string for device state (on/off, brightness, temperature, etc.)
  capabilities: text("capabilities"), // JSON string for device capabilities
  connectionType: mysqlEnum("connectionType", ["mqtt", "http", "websocket", "local"]).notNull(),
  connectionConfig: text("connectionConfig"), // JSON string for connection details
  lastSeen: timestamp("lastSeen"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IoTDevice = typeof iotDevices.$inferSelect;
export type InsertIoTDevice = typeof iotDevices.$inferInsert;

/**
 * IoT Command History table
 */
export const iotCommandHistory = mysqlTable("iot_command_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceId: varchar("deviceId", { length: 128 }).notNull(),
  command: varchar("command", { length: 255 }).notNull(),
  parameters: text("parameters"), // JSON string for command parameters
  status: mysqlEnum("status", ["success", "failed", "pending"]).notNull(),
  errorMessage: text("errorMessage"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type IoTCommandHistory = typeof iotCommandHistory.$inferSelect;
export type InsertIoTCommandHistory = typeof iotCommandHistory.$inferInsert;

/**
 * User Profile table for personalization and learning
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  sarcasmLevel: int("sarcasmLevel").default(5).notNull(), // 1-10 scale
  totalInteractions: int("totalInteractions").default(0).notNull(),
  positiveResponses: int("positiveResponses").default(0).notNull(), // User liked the response
  negativeResponses: int("negativeResponses").default(0).notNull(), // User disliked the response
  averageResponseLength: int("averageResponseLength").default(0).notNull(),
  preferredTopics: text("preferredTopics"), // JSON array of topics
  interactionPatterns: text("interactionPatterns"), // JSON object with patterns
  lastInteraction: timestamp("lastInteraction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Conversation Feedback table for learning
 */
export const conversationFeedback = mysqlTable("conversation_feedback", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  userId: int("userId").notNull(),
  feedbackType: mysqlEnum("feedbackType", ["like", "dislike", "too_sarcastic", "not_sarcastic_enough", "helpful", "unhelpful"]).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationFeedback = typeof conversationFeedback.$inferSelect;
export type InsertConversationFeedback = typeof conversationFeedback.$inferInsert;


/**
 * Learning Sessions table for Verified Learning Assistant
 */
export const learningSessions = mysqlTable("learning_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 512 }).notNull(),
  question: text("question").notNull(),
  explanation: text("explanation").notNull(),
  confidenceScore: int("confidenceScore").notNull(), // 0-100
  sourcesCount: int("sourcesCount").default(0).notNull(),
  sessionType: mysqlEnum("sessionType", ["explanation", "study_guide", "quiz"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningSession = typeof learningSessions.$inferSelect;
export type InsertLearningSession = typeof learningSessions.$inferInsert;

/**
 * Fact Check Results table
 */
export const factCheckResults = mysqlTable("fact_check_results", {
  id: int("id").autoincrement().primaryKey(),
  learningSessionId: int("learningSessionId").notNull(),
  claim: text("claim").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["verified", "disputed", "debunked", "unverified"]).notNull(),
  confidenceScore: int("confidenceScore").notNull(), // 0-100
  sources: text("sources").notNull(), // JSON array of source objects
  explanation: text("explanation"), // Why this status was assigned
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FactCheckResult = typeof factCheckResults.$inferSelect;
export type InsertFactCheckResult = typeof factCheckResults.$inferInsert;

/**
 * Learning Sources table for citation tracking
 */
export const learningSources = mysqlTable("learning_sources", {
  id: int("id").autoincrement().primaryKey(),
  factCheckResultId: int("factCheckResultId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["academic", "news", "government", "encyclopedia", "other"]).notNull(),
  credibilityScore: int("credibilityScore").notNull(), // 0-100
  publishDate: timestamp("publishDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningSource = typeof learningSources.$inferSelect;
export type InsertLearningSource = typeof learningSources.$inferInsert;

/**
 * Study Guides table
 */
export const studyGuides = mysqlTable("study_guides", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  learningSessionId: int("learningSessionId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(), // Markdown formatted study guide
  topicsCount: int("topicsCount").default(0).notNull(),
  questionsCount: int("questionsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyGuide = typeof studyGuides.$inferSelect;
export type InsertStudyGuide = typeof studyGuides.$inferInsert;

/**
 * Quizzes table
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  learningSessionId: int("learningSessionId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  questions: text("questions").notNull(), // JSON array of question objects
  totalQuestions: int("totalQuestions").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Quiz Attempts table
 */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  userId: int("userId").notNull(),
  score: int("score").notNull(), // Percentage 0-100
  correctAnswers: int("correctAnswers").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  timeSpent: int("timeSpent"), // Seconds
  answers: text("answers").notNull(), // JSON array of user answers
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Language Learning - Vocabulary Items table
 */
export const vocabularyItems = mysqlTable("vocabulary_items", {
  id: int("id").autoincrement().primaryKey(),
  language: varchar("language", { length: 50 }).notNull(), // Target language code (e.g., 'es', 'fr', 'de')
  word: varchar("word", { length: 255 }).notNull(),
  translation: varchar("translation", { length: 255 }).notNull(), // English translation
  pronunciation: varchar("pronunciation", { length: 255 }), // IPA or phonetic spelling
  partOfSpeech: varchar("partOfSpeech", { length: 100 }).notNull(), // Flexible to allow "noun (m.)", "phrase", etc.
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  category: varchar("category", { length: 128 }), // e.g., 'food', 'travel', 'business'
  exampleSentence: text("exampleSentence"),
  exampleTranslation: text("exampleTranslation"),
  audioUrl: varchar("audioUrl", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  notes: text("notes"), // Cultural notes, usage tips, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VocabularyItem = typeof vocabularyItems.$inferSelect;
export type InsertVocabularyItem = typeof vocabularyItems.$inferInsert;

/**
 * Language Learning - User Vocabulary Progress table
 */
export const userVocabulary = mysqlTable("user_vocabulary", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  vocabularyItemId: int("vocabularyItemId").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  masteryLevel: int("masteryLevel").default(0).notNull(), // 0-100
  timesReviewed: int("timesReviewed").default(0).notNull(),
  timesCorrect: int("timesCorrect").default(0).notNull(),
  timesIncorrect: int("timesIncorrect").default(0).notNull(),
  lastReviewed: timestamp("lastReviewed"),
  nextReview: timestamp("nextReview"), // For spaced repetition
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserVocabulary = typeof userVocabulary.$inferSelect;
export type InsertUserVocabulary = typeof userVocabulary.$inferInsert;

/**
 * Language Learning - Grammar Lessons table
 */
export const grammarLessons = mysqlTable("grammar_lessons", {
  id: int("id").autoincrement().primaryKey(),
  language: varchar("language", { length: 50 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(), // e.g., 'Present Tense', 'Subjunctive Mood'
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  explanation: text("explanation").notNull(),
  examples: text("examples").notNull(), // JSON array of example objects
  commonMistakes: text("commonMistakes"), // JSON array of common mistakes
  relatedTopics: text("relatedTopics"), // JSON array of related topic IDs
  exercises: text("exercises"), // JSON array of practice exercises
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrammarLesson = typeof grammarLessons.$inferSelect;
export type InsertGrammarLesson = typeof grammarLessons.$inferInsert;

/**
 * Language Learning - User Grammar Progress table
 */
export const userGrammarProgress = mysqlTable("user_grammar_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  grammarLessonId: int("grammarLessonId").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  completed: int("completed").default(0).notNull(), // Boolean: 0 or 1
  masteryLevel: int("masteryLevel").default(0).notNull(), // 0-100
  exercisesCompleted: int("exercisesCompleted").default(0).notNull(),
  lastStudied: timestamp("lastStudied"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserGrammarProgress = typeof userGrammarProgress.$inferSelect;
export type InsertUserGrammarProgress = typeof userGrammarProgress.$inferInsert;

/**
 * Language Learning - Exercises table
 */
export const languageExercises = mysqlTable("language_exercises", {
  id: int("id").autoincrement().primaryKey(),
  language: varchar("language", { length: 50 }).notNull(),
  exerciseType: mysqlEnum("exerciseType", ["translation", "fill_blank", "multiple_choice", "matching", "listening", "speaking"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  category: varchar("category", { length: 128 }),
  prompt: text("prompt").notNull(),
  options: text("options"), // JSON array for multiple choice/matching
  correctAnswer: text("correctAnswer").notNull(),
  explanation: text("explanation"),
  audioUrl: varchar("audioUrl", { length: 512 }),
  relatedVocabulary: text("relatedVocabulary"), // JSON array of vocabulary IDs
  relatedGrammar: text("relatedGrammar"), // JSON array of grammar lesson IDs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LanguageExercise = typeof languageExercises.$inferSelect;
export type InsertLanguageExercise = typeof languageExercises.$inferInsert;

/**
 * Language Learning - Exercise Attempts table
 */
export const exerciseAttempts = mysqlTable("exercise_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  userAnswer: text("userAnswer").notNull(),
  isCorrect: int("isCorrect").notNull(), // Boolean: 0 or 1
  timeSpent: int("timeSpent"), // Seconds
  hintsUsed: int("hintsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = typeof exerciseAttempts.$inferInsert;

/**
 * Language Learning - User Language Progress table
 */
export const userLanguageProgress = mysqlTable("user_language_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  fluencyScore: int("fluencyScore").default(0).notNull(), // 0-100
  vocabularySize: int("vocabularySize").default(0).notNull(),
  grammarTopicsMastered: int("grammarTopicsMastered").default(0).notNull(),
  exercisesCompleted: int("exercisesCompleted").default(0).notNull(),
  totalStudyTime: int("totalStudyTime").default(0).notNull(), // Minutes
  currentStreak: int("currentStreak").default(0).notNull(), // Days
  longestStreak: int("longestStreak").default(0).notNull(), // Days
  lastStudied: timestamp("lastStudied"),
  dailyGoal: int("dailyGoal").default(15).notNull(), // Minutes per day
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserLanguageProgress = typeof userLanguageProgress.$inferSelect;
export type InsertUserLanguageProgress = typeof userLanguageProgress.$inferInsert;

/**
 * Language Learning - Daily Lessons table
 */
export const dailyLessons = mysqlTable("daily_lessons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  lessonDate: timestamp("lessonDate").notNull(),
  vocabularyItems: text("vocabularyItems").notNull(), // JSON array of vocabulary IDs
  grammarTopics: text("grammarTopics"), // JSON array of grammar lesson IDs
  exercises: text("exercises").notNull(), // JSON array of exercise IDs
  completed: int("completed").default(0).notNull(), // Boolean: 0 or 1
  completionTime: int("completionTime"), // Minutes
  score: int("score"), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type DailyLesson = typeof dailyLessons.$inferSelect;
export type InsertDailyLesson = typeof dailyLessons.$inferInsert;

/**
 * Language Learning - Achievements table
 */
export const languageAchievements = mysqlTable("language_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  achievementType: varchar("achievementType", { length: 128 }).notNull(), // e.g., 'first_lesson', 'vocab_master_100', 'streak_7'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("iconUrl", { length: 512 }),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type LanguageAchievement = typeof languageAchievements.$inferSelect;
export type InsertLanguageAchievement = typeof languageAchievements.$inferInsert;

/**
 * Debt Elimination Financial Coach - Debts table
 */
export const debts = mysqlTable("debts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  debtName: varchar("debtName", { length: 255 }).notNull(), // e.g., "Chase Credit Card", "Student Loan"
  debtType: mysqlEnum("debtType", ["credit_card", "student_loan", "personal_loan", "auto_loan", "mortgage", "medical", "other"]).notNull(),
  originalBalance: int("originalBalance").notNull(), // In cents to avoid floating point issues
  currentBalance: int("currentBalance").notNull(), // In cents
  interestRate: int("interestRate").notNull(), // Stored as basis points (e.g., 1550 = 15.50%)
  minimumPayment: int("minimumPayment").notNull(), // In cents
  dueDay: int("dueDay").notNull(), // Day of month (1-31)
  creditor: varchar("creditor", { length: 255 }), // Bank or lender name
  accountNumber: varchar("accountNumber", { length: 100 }), // Last 4 digits or masked
  status: mysqlEnum("status", ["active", "paid_off", "closed"]).default("active").notNull(),
  notes: text("notes"), // User notes about this debt
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidOffAt: timestamp("paidOffAt"), // When debt was fully paid
});

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

/**
 * Debt Payments table - tracks all payments made toward debts
 */
export const debtPayments = mysqlTable("debt_payments", {
  id: int("id").autoincrement().primaryKey(),
  debtId: int("debtId").notNull(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // In cents
  paymentDate: timestamp("paymentDate").notNull(),
  paymentType: mysqlEnum("paymentType", ["minimum", "extra", "lump_sum", "automatic"]).notNull(),
  balanceAfter: int("balanceAfter").notNull(), // Balance remaining after this payment (in cents)
  principalPaid: int("principalPaid").notNull(), // Amount toward principal (in cents)
  interestPaid: int("interestPaid").notNull(), // Amount toward interest (in cents)
  notes: text("notes"), // User notes about this payment
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DebtPayment = typeof debtPayments.$inferSelect;
export type InsertDebtPayment = typeof debtPayments.$inferInsert;

/**
 * Debt Milestones table - tracks achievements in debt elimination journey
 */
export const debtMilestones = mysqlTable("debt_milestones", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  debtId: int("debtId"), // Null for overall milestones
  milestoneType: mysqlEnum("milestoneType", [
    "first_payment",
    "first_extra_payment", 
    "25_percent_paid",
    "50_percent_paid",
    "75_percent_paid",
    "debt_paid_off",
    "all_debts_paid",
    "payment_streak_7",
    "payment_streak_30",
    "saved_1000_interest"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amountSaved: int("amountSaved"), // Interest saved (in cents)
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
});

export type DebtMilestone = typeof debtMilestones.$inferSelect;
export type InsertDebtMilestone = typeof debtMilestones.$inferInsert;

/**
 * Debt Strategies table - stores calculated payoff strategies
 */
export const debtStrategies = mysqlTable("debt_strategies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  strategyType: mysqlEnum("strategyType", ["snowball", "avalanche", "custom"]).notNull(),
  monthlyExtraPayment: int("monthlyExtraPayment").notNull(), // In cents
  projectedPayoffDate: timestamp("projectedPayoffDate").notNull(),
  totalInterestPaid: int("totalInterestPaid").notNull(), // In cents
  totalInterestSaved: int("totalInterestSaved").notNull(), // Compared to minimum payments (in cents)
  monthsToPayoff: int("monthsToPayoff").notNull(),
  payoffOrder: text("payoffOrder").notNull(), // JSON array of debt IDs in order
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export type DebtStrategy = typeof debtStrategies.$inferSelect;
export type InsertDebtStrategy = typeof debtStrategies.$inferInsert;

/**
 * Coaching Sessions table - AI-powered motivational messages
 */
export const coachingSessions = mysqlTable("coaching_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: mysqlEnum("sessionType", [
    "welcome",
    "milestone_celebration",
    "payment_logged",
    "missed_payment",
    "strategy_suggestion",
    "progress_update",
    "motivation",
    "setback_recovery"
  ]).notNull(),
  message: text("message").notNull(), // The coaching message from SASS-E
  sentiment: mysqlEnum("sentiment", ["encouraging", "celebratory", "supportive", "motivational"]).notNull(),
  relatedDebtId: int("relatedDebtId"), // Optional: specific debt this relates to
  relatedMilestoneId: int("relatedMilestoneId"), // Optional: milestone this celebrates
  userResponse: mysqlEnum("userResponse", ["helpful", "not_helpful", "inspiring"]), // User feedback
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = typeof coachingSessions.$inferInsert;

/**
 * Debt Budget Snapshots table - tracks monthly budget allocations
 */
export const debtBudgetSnapshots = mysqlTable("debt_budget_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  monthYear: varchar("monthYear", { length: 7 }).notNull(), // Format: "2025-01"
  totalIncome: int("totalIncome").notNull(), // In cents
  totalExpenses: int("totalExpenses").notNull(), // In cents
  totalDebtPayments: int("totalDebtPayments").notNull(), // In cents
  extraPaymentBudget: int("extraPaymentBudget").notNull(), // In cents
  actualExtraPayments: int("actualExtraPayments").notNull(), // In cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DebtBudgetSnapshot = typeof debtBudgetSnapshots.$inferSelect;
export type InsertDebtBudgetSnapshot = typeof debtBudgetSnapshots.$inferInsert;

/**
 * Budget Categories table - user-defined income and expense categories
 */
export const budgetCategories = mysqlTable("budget_categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  monthlyLimit: int("monthlyLimit"), // In cents, null for income categories
  color: varchar("color", { length: 7 }).notNull(), // Hex color for charts
  icon: varchar("icon", { length: 50 }), // Icon name for UI
  isDefault: int("isDefault").default(0).notNull(), // 1 for system defaults, 0 for user-created
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = typeof budgetCategories.$inferInsert;

/**
 * Budget Transactions table - individual income and expense entries
 */
export const budgetTransactions = mysqlTable("budget_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  amount: int("amount").notNull(), // In cents, positive for income, positive for expenses
  transactionDate: timestamp("transactionDate").notNull(),
  description: varchar("description", { length: 255 }),
  notes: text("notes"),
  isRecurring: int("isRecurring").default(0).notNull(), // 1 for recurring transactions
  recurringFrequency: mysqlEnum("recurringFrequency", ["weekly", "biweekly", "monthly", "yearly"]),
  tags: varchar("tags", { length: 255 }), // Comma-separated tags for filtering
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetTransaction = typeof budgetTransactions.$inferSelect;
export type InsertBudgetTransaction = typeof budgetTransactions.$inferInsert;

/**
 * Monthly Budget Summary table - aggregated monthly statistics
 */
export const monthlyBudgetSummaries = mysqlTable("monthly_budget_summaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  monthYear: varchar("monthYear", { length: 7 }).notNull(), // Format: "2025-01"
  totalIncome: int("totalIncome").notNull(), // In cents
  totalExpenses: int("totalExpenses").notNull(), // In cents
  totalDebtPayments: int("totalDebtPayments").notNull(), // In cents (from debt_payments table)
  netCashFlow: int("netCashFlow").notNull(), // Income - Expenses - Debt Payments
  savingsRate: int("savingsRate").notNull(), // Percentage in basis points (e.g., 2000 = 20%)
  debtPaymentRate: int("debtPaymentRate").notNull(), // Percentage of income going to debt
  availableForExtraPayments: int("availableForExtraPayments").notNull(), // Leftover for extra debt payments
  budgetHealth: mysqlEnum("budgetHealth", ["excellent", "good", "warning", "critical"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlyBudgetSummary = typeof monthlyBudgetSummaries.$inferSelect;
export type InsertMonthlyBudgetSummary = typeof monthlyBudgetSummaries.$inferInsert;

/**
 * Financial Goals table - user-defined financial targets
 */
export const financialGoals = mysqlTable("financial_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["savings", "debt_free", "emergency_fund", "investment", "purchase", "custom"]).notNull(),
  targetAmount: int("targetAmount").notNull(), // In cents
  currentAmount: int("currentAmount").default(0).notNull(), // In cents
  targetDate: timestamp("targetDate"),
  status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"]).default("active").notNull(),
  priority: int("priority").default(0).notNull(), // Higher number = higher priority
  icon: varchar("icon", { length: 10 }).default("🎯"),
  color: varchar("color", { length: 20 }).default("#10b981"), // Hex color for visual distinction
  isAutoTracked: int("isAutoTracked").default(0).notNull(), // 1 if automatically updated from budget
  linkedCategoryId: int("linkedCategoryId"), // Link to budget category for auto-tracking
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = typeof financialGoals.$inferInsert;

/**
 * Goal Milestones table - track achievement of percentage milestones
 */
export const goalMilestones = mysqlTable("goal_milestones", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull(),
  milestonePercentage: int("milestonePercentage").notNull(), // 25, 50, 75, 100
  achievedDate: timestamp("achievedDate"),
  celebrationShown: int("celebrationShown").default(0).notNull(), // 1 if user has seen celebration
  message: text("message"), // Custom celebration message
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type InsertGoalMilestone = typeof goalMilestones.$inferInsert;

/**
 * Goal Progress History table - track progress updates over time
 */
export const goalProgressHistory = mysqlTable("goal_progress_history", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull(),
  amount: int("amount").notNull(), // Amount added/removed in cents
  newTotal: int("newTotal").notNull(), // New current_amount after update
  progressDate: timestamp("progressDate").defaultNow().notNull(),
  note: varchar("note", { length: 255 }),
  source: mysqlEnum("source", ["manual", "auto_budget", "auto_debt"]).default("manual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GoalProgressHistory = typeof goalProgressHistory.$inferSelect;
export type InsertGoalProgressHistory = typeof goalProgressHistory.$inferInsert;

/**
 * Math Tutor - Problem Library table
 */
export const mathProblems = mysqlTable("math_problems", {
  id: int("id").autoincrement().primaryKey(),
  topic: varchar("topic", { length: 100 }).notNull(), // algebra, calculus, geometry, etc.
  subtopic: varchar("subtopic", { length: 100 }), // linear_equations, derivatives, triangles, etc.
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  problemText: text("problemText").notNull(),
  solution: text("solution").notNull(), // JSON array of solution steps
  answer: varchar("answer", { length: 255 }).notNull(),
  hints: text("hints"), // JSON array of progressive hints
  explanation: text("explanation"), // Conceptual explanation
  relatedConcepts: text("relatedConcepts"), // JSON array of related topics
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MathProblem = typeof mathProblems.$inferSelect;
export type InsertMathProblem = typeof mathProblems.$inferInsert;

/**
 * Math Tutor - User Solutions table (track user attempts)
 */
export const mathSolutions = mysqlTable("math_solutions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  problemId: int("problemId"), // null if custom problem
  problemText: text("problemText").notNull(),
  userAnswer: varchar("userAnswer", { length: 255 }),
  isCorrect: int("isCorrect"), // 1 if correct, 0 if incorrect, null if not checked
  steps: text("steps").notNull(), // JSON array of solution steps with explanations
  hintsUsed: int("hintsUsed").default(0).notNull(),
  timeSpent: int("timeSpent"), // Seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MathSolution = typeof mathSolutions.$inferSelect;
export type InsertMathSolution = typeof mathSolutions.$inferInsert;

/**
 * Math Tutor - User Progress table
 */
export const mathProgress = mysqlTable("math_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalProblemsAttempted: int("totalProblemsAttempted").default(0).notNull(),
  totalProblemsSolved: int("totalProblemsSolved").default(0).notNull(),
  topicsExplored: text("topicsExplored"), // JSON array of topics
  currentStreak: int("currentStreak").default(0).notNull(), // Days
  longestStreak: int("longestStreak").default(0).notNull(),
  lastPracticeDate: timestamp("lastPracticeDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MathProgress = typeof mathProgress.$inferSelect;
export type InsertMathProgress = typeof mathProgress.$inferInsert;

/**
 * Science Lab - Experiments table
 */
export const experiments = mysqlTable("experiments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  category: mysqlEnum("category", ["physics", "chemistry", "biology"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  description: text("description").notNull(),
  equipment: text("equipment").notNull(), // JSON array of equipment items
  safetyWarnings: text("safetyWarnings"), // JSON array of safety warnings
  duration: int("duration").notNull(), // Minutes
  learningObjectives: text("learningObjectives"), // JSON array of objectives
  backgroundInfo: text("backgroundInfo"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = typeof experiments.$inferInsert;

/**
 * Science Lab - Experiment Steps table
 */
export const experimentSteps = mysqlTable("experiment_steps", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: int("experimentId").notNull(),
  stepNumber: int("stepNumber").notNull(),
  instruction: text("instruction").notNull(),
  expectedResult: text("expectedResult"),
  safetyNote: text("safetyNote"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  videoUrl: varchar("videoUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExperimentStep = typeof experimentSteps.$inferSelect;
export type InsertExperimentStep = typeof experimentSteps.$inferInsert;

/**
 * Science Lab - User Lab Results table
 */
export const userLabResults = mysqlTable("user_lab_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  experimentId: int("experimentId").notNull(),
  observations: text("observations").notNull(),
  measurements: text("measurements"), // JSON object with measurement data
  analysis: text("analysis"),
  conclusions: text("conclusions"),
  questionsAnswered: text("questionsAnswered"), // JSON array of Q&A
  completedSteps: text("completedSteps"), // JSON array of completed step numbers
  timeSpent: int("timeSpent"), // Minutes
  grade: int("grade"), // 0-100 score if graded
  feedback: text("feedback"), // AI-generated feedback
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type UserLabResult = typeof userLabResults.$inferSelect;
export type InsertUserLabResult = typeof userLabResults.$inferInsert;

/**
 * Science Lab - User Science Progress table
 */
export const scienceProgress = mysqlTable("science_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalExperimentsCompleted: int("totalExperimentsCompleted").default(0).notNull(),
  physicsExperiments: int("physicsExperiments").default(0).notNull(),
  chemistryExperiments: int("chemistryExperiments").default(0).notNull(),
  biologyExperiments: int("biologyExperiments").default(0).notNull(),
  averageGrade: int("averageGrade").default(0).notNull(), // 0-100
  totalLabTime: int("totalLabTime").default(0).notNull(), // Minutes
  safetyScore: int("safetyScore").default(100).notNull(), // 0-100
  lastExperimentDate: timestamp("lastExperimentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScienceProgress = typeof scienceProgress.$inferSelect;
export type InsertScienceProgress = typeof scienceProgress.$inferInsert;

/**
 * Science Lab - Pre-Lab Quiz Questions table
 */
export const labQuizQuestions = mysqlTable("lab_quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: int("experimentId").notNull(),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON array of 4 options
  correctAnswer: int("correctAnswer").notNull(), // Index of correct option (0-3)
  explanation: text("explanation"), // Why this answer is correct
  category: varchar("category", { length: 50 }), // "safety", "equipment", "theory", "procedure"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LabQuizQuestion = typeof labQuizQuestions.$inferSelect;
export type InsertLabQuizQuestion = typeof labQuizQuestions.$inferInsert;

/**
 * Science Lab - Quiz Attempts table
 */
export const labQuizAttempts = mysqlTable("lab_quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  experimentId: int("experimentId").notNull(),
  score: int("score").notNull(), // Percentage (0-100)
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  passed: int("passed").notNull(), // 1 if passed (score >= 70%), 0 otherwise
  answers: text("answers"), // JSON array of user answers
  timeSpent: int("timeSpent"), // Seconds
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});

export type LabQuizAttempt = typeof labQuizAttempts.$inferSelect;
export type InsertLabQuizAttempt = typeof labQuizAttempts.$inferInsert;

/**
 * Budget Alerts table - notifications for budget thresholds
 */
export const budgetAlerts = mysqlTable("budget_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"), // null for overall budget alerts
  alertType: mysqlEnum("alertType", ["threshold_80", "threshold_100", "exceeded", "weekly_summary", "monthly_report"]).notNull(),
  threshold: int("threshold"), // Percentage (80 or 100) for threshold alerts
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(), // 1 if user has seen the alert
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BudgetAlert = typeof budgetAlerts.$inferSelect;
export type InsertBudgetAlert = typeof budgetAlerts.$inferInsert;

/**
 * Financial Insights table - AI-generated insights and recommendations
 */
export const financialInsights = mysqlTable("financial_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  insightType: mysqlEnum("insightType", ["spending_pattern", "saving_opportunity", "cash_flow_prediction", "budget_recommendation", "trend_analysis"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  actionable: int("actionable").default(1).notNull(), // 1 if user can act on this insight
  actionText: varchar("actionText", { length: 255 }), // CTA text if actionable
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  relatedCategoryId: int("relatedCategoryId"), // Link to budget category if relevant
  dataPoints: text("dataPoints"), // JSON with supporting data
  isDismissed: int("isDismissed").default(0).notNull(), // 1 if user dismissed this insight
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Insights can expire after a certain period
});

export type FinancialInsight = typeof financialInsights.$inferSelect;
export type InsertFinancialInsight = typeof financialInsights.$inferInsert;

/**
 * Budget Templates table - pre-configured budget strategies
 */
export const budgetTemplates = mysqlTable("budget_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  strategy: mysqlEnum("strategy", ["50_30_20", "zero_based", "envelope", "custom"]).notNull(),
  isSystemTemplate: int("isSystemTemplate").default(1).notNull(), // 1 for built-in, 0 for user-created
  userId: int("userId"), // null for system templates, user ID for custom templates
  allocations: text("allocations").notNull(), // JSON: { "needs": 50, "wants": 30, "savings": 20 } or category-specific
  categoryMappings: text("categoryMappings"), // JSON: maps allocation types to category IDs
  icon: varchar("icon", { length: 10 }).default("📊"),
  sortOrder: int("sortOrder").default(0).notNull(),
  usageCount: int("usageCount").default(0).notNull(), // Track popularity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetTemplate = typeof budgetTemplates.$inferSelect;
export type InsertBudgetTemplate = typeof budgetTemplates.$inferInsert;

/**
 * User Budget Template Applications table - track when users apply templates
 */
export const userBudgetTemplates = mysqlTable("user_budget_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId").notNull(),
  monthlyIncome: int("monthlyIncome").notNull(), // In cents, income at time of application
  appliedAllocations: text("appliedAllocations").notNull(), // JSON: actual dollar amounts calculated
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 if currently using this template
});

export type UserBudgetTemplate = typeof userBudgetTemplates.$inferSelect;
export type InsertUserBudgetTemplate = typeof userBudgetTemplates.$inferInsert;

/**
 * Notification Preferences table - user settings for alerts and notifications
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  budgetAlertsEnabled: int("budgetAlertsEnabled").default(1).notNull(), // 1 to receive budget alerts
  threshold80Enabled: int("threshold80Enabled").default(1).notNull(), // Alert at 80% of limit
  threshold100Enabled: int("threshold100Enabled").default(1).notNull(), // Alert at 100% of limit
  exceededEnabled: int("exceededEnabled").default(1).notNull(), // Alert when over budget
  weeklySummaryEnabled: int("weeklySummaryEnabled").default(1).notNull(), // Weekly spending summary
  monthlySummaryEnabled: int("monthlySummaryEnabled").default(1).notNull(), // Monthly budget report
  insightsEnabled: int("insightsEnabled").default(1).notNull(), // AI-generated insights
  recurringAlertsEnabled: int("recurringAlertsEnabled").default(1).notNull(), // Recurring transaction reminders
  notificationMethod: mysqlEnum("notificationMethod", ["in_app", "push", "both"]).default("both").notNull(),
  quietHoursStart: int("quietHoursStart"), // Hour (0-23) to start quiet period
  quietHoursEnd: int("quietHoursEnd"), // Hour (0-23) to end quiet period
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Recurring Transactions table - detected patterns and subscriptions
 */
export const recurringTransactions = mysqlTable("recurring_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  averageAmount: int("averageAmount").notNull(), // Average amount in cents
  frequency: mysqlEnum("frequency", ["weekly", "biweekly", "monthly", "quarterly", "yearly"]).notNull(),
  nextExpectedDate: timestamp("nextExpectedDate"), // When we expect the next occurrence
  lastOccurrence: timestamp("lastOccurrence"), // Last detected transaction date
  confidence: int("confidence").notNull(), // Confidence score 0-100
  isActive: int("isActive").default(1).notNull(), // 1 if still recurring, 0 if stopped
  isSubscription: int("isSubscription").default(0).notNull(), // 1 if identified as subscription
  reminderEnabled: int("reminderEnabled").default(1).notNull(), // 1 to send reminders
  autoAdd: int("autoAdd").default(0).notNull(), // 1 to automatically add predicted transactions
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type InsertRecurringTransaction = typeof recurringTransactions.$inferInsert;

/**
 * Shared Budgets table - for collaborative budget management
 */
export const sharedBudgets = mysqlTable("shared_budgets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: int("ownerId").notNull(), // User who created the shared budget
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SharedBudget = typeof sharedBudgets.$inferSelect;
export type InsertSharedBudget = typeof sharedBudgets.$inferInsert;

/**
 * Shared Budget Members table - users who have access to a shared budget
 */
export const sharedBudgetMembers = mysqlTable("shared_budget_members", {
  id: int("id").autoincrement().primaryKey(),
  sharedBudgetId: int("sharedBudgetId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).notNull(),
  invitedBy: int("invitedBy").notNull(),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt"),
  status: mysqlEnum("status", ["pending", "active", "declined", "removed"]).default("pending").notNull(),
});

export type SharedBudgetMember = typeof sharedBudgetMembers.$inferSelect;
export type InsertSharedBudgetMember = typeof sharedBudgetMembers.$inferInsert;

/**
 * Shared Budget Categories table - categories within a shared budget
 */
export const sharedBudgetCategories = mysqlTable("shared_budget_categories", {
  id: int("id").autoincrement().primaryKey(),
  sharedBudgetId: int("sharedBudgetId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).default("💰"),
  color: varchar("color", { length: 20 }).default("#10b981"),
  monthlyLimit: int("monthlyLimit").default(0).notNull(), // In cents
  description: text("description"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SharedBudgetCategory = typeof sharedBudgetCategories.$inferSelect;
export type InsertSharedBudgetCategory = typeof sharedBudgetCategories.$inferInsert;

/**
 * Shared Budget Transactions table - transactions in shared budgets
 */
export const sharedBudgetTransactions = mysqlTable("shared_budget_transactions", {
  id: int("id").autoincrement().primaryKey(),
  sharedBudgetId: int("sharedBudgetId").notNull(),
  categoryId: int("categoryId").notNull(),
  userId: int("userId").notNull(), // Who added the transaction
  amount: int("amount").notNull(), // In cents
  description: varchar("description", { length: 255 }).notNull(),
  transactionDate: timestamp("transactionDate").notNull(),
  receiptUrl: varchar("receiptUrl", { length: 512 }),
  notes: text("notes"),
  isSplit: int("isSplit").default(0).notNull(), // 1 if this is a split expense
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SharedBudgetTransaction = typeof sharedBudgetTransactions.$inferSelect;
export type InsertSharedBudgetTransaction = typeof sharedBudgetTransactions.$inferInsert;

/**
 * Split Expenses table - track who owes what for split transactions
 */
export const splitExpenses = mysqlTable("split_expenses", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(), // References shared_budget_transactions
  userId: int("userId").notNull(), // Who owes money
  amount: int("amount").notNull(), // Amount this user owes in cents
  isPaid: int("isPaid").default(0).notNull(), // 1 if settled
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SplitExpense = typeof splitExpenses.$inferSelect;
export type InsertSplitExpense = typeof splitExpenses.$inferInsert;

/**
 * Shared Budget Activity Log - track all changes for transparency
 */
export const sharedBudgetActivity = mysqlTable("shared_budget_activity", {
  id: int("id").autoincrement().primaryKey(),
  sharedBudgetId: int("sharedBudgetId").notNull(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "added_transaction", "updated_category"
  details: text("details"), // JSON string with action details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SharedBudgetActivity = typeof sharedBudgetActivity.$inferSelect;
export type InsertSharedBudgetActivity = typeof sharedBudgetActivity.$inferInsert;


/**
 * =============================================================================
 * WELLBEING FEATURE - Fitness, Nutrition, Mental Wellness, Health Metrics
 * =============================================================================
 */

/**
 * Workouts table - library of available workouts
 */
export const workouts = mysqlTable("workouts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["yoga", "hiit", "strength", "pilates", "cardio", "stretching", "other"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  duration: int("duration").notNull(), // in minutes
  equipment: text("equipment"), // JSON array of required equipment
  focusArea: varchar("focusArea", { length: 100 }), // e.g., "core", "legs", "full body"
  caloriesBurned: int("caloriesBurned"), // estimated calories burned
  instructions: text("instructions"), // JSON array of workout steps
  videoUrl: varchar("videoUrl", { length: 512 }),
  audioUrl: varchar("audioUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = typeof workouts.$inferInsert;

/**
 * User Workout History - tracks completed workouts
 */
export const userWorkoutHistory = mysqlTable("user_workout_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workoutId: int("workoutId"), // null if custom workout
  workoutTitle: varchar("workoutTitle", { length: 255 }).notNull(),
  duration: int("duration").notNull(), // actual duration in minutes
  caloriesBurned: int("caloriesBurned"), // estimated calories
  notes: text("notes"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type UserWorkoutHistory = typeof userWorkoutHistory.$inferSelect;
export type InsertUserWorkoutHistory = typeof userWorkoutHistory.$inferInsert;

/**
 * Daily Activity Stats - aggregated daily activity data
 */
export const dailyActivityStats = mysqlTable("daily_activity_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  steps: int("steps").default(0),
  distance: int("distance").default(0), // in meters
  calories: int("calories").default(0),
  activeMinutes: int("activeMinutes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyActivityStats = typeof dailyActivityStats.$inferSelect;
export type InsertDailyActivityStats = typeof dailyActivityStats.$inferInsert;

/**
 * Food Log - user's daily food intake
 */
export const foodLog = mysqlTable("food_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  foodName: varchar("foodName", { length: 255 }).notNull(),
  barcode: varchar("barcode", { length: 50 }), // Product barcode if scanned
  servingSize: varchar("servingSize", { length: 100 }),
  servingQuantity: decimal("servingQuantity", { precision: 10, scale: 2 }).default("1"),
  // Macronutrients (per serving)
  calories: decimal("calories", { precision: 10, scale: 2 }).default("0"),
  protein: decimal("protein", { precision: 10, scale: 2 }).default("0"), // grams
  carbs: decimal("carbs", { precision: 10, scale: 2 }).default("0"), // grams
  fat: decimal("fat", { precision: 10, scale: 2 }).default("0"), // grams
  fiber: decimal("fiber", { precision: 10, scale: 2 }).default("0"), // grams
  sugars: decimal("sugars", { precision: 10, scale: 2 }).default("0"), // grams
  saturatedFat: decimal("saturatedFat", { precision: 10, scale: 2 }).default("0"), // grams
  // Micronutrients (per serving)
  sodium: decimal("sodium", { precision: 10, scale: 2 }).default("0"), // mg
  cholesterol: decimal("cholesterol", { precision: 10, scale: 2 }).default("0"), // mg
  vitaminA: decimal("vitaminA", { precision: 10, scale: 2 }), // mcg
  vitaminC: decimal("vitaminC", { precision: 10, scale: 2 }), // mg
  calcium: decimal("calcium", { precision: 10, scale: 2 }), // mg
  iron: decimal("iron", { precision: 10, scale: 2 }), // mg
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FoodLog = typeof foodLog.$inferSelect;
export type InsertFoodLog = typeof foodLog.$inferInsert;

/**
 * Hydration Log - water intake tracking
 */
export const hydrationLog = mysqlTable("hydration_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  amount: int("amount").notNull(), // in ml
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
});

export type HydrationLog = typeof hydrationLog.$inferSelect;
export type InsertHydrationLog = typeof hydrationLog.$inferInsert;

/**
 * Meditation Sessions - tracks meditation and mindfulness practice
 */
export const meditationSessions = mysqlTable("meditation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["meditation", "breathing", "sleep", "focus", "stress"]).notNull(),
  duration: int("duration").notNull(), // in minutes
  title: varchar("title", { length: 255 }),
  notes: text("notes"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = typeof meditationSessions.$inferInsert;

/**
 * Mood Log - daily mood tracking
 */
export const moodLog = mysqlTable("mood_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  mood: mysqlEnum("mood", ["great", "good", "okay", "bad", "terrible"]).notNull(),
  energy: int("energy").default(5), // 1-10 scale
  stress: int("stress").default(5), // 1-10 scale
  notes: text("notes"),
  factors: text("factors"), // JSON array of contributing factors
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoodLog = typeof moodLog.$inferSelect;
export type InsertMoodLog = typeof moodLog.$inferInsert;

/**
 * Journal Entries - reflective journaling
 */
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  prompt: varchar("prompt", { length: 255 }), // Optional guided prompt
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Sleep Tracking - sleep quality and duration
 */
export const sleepTracking = mysqlTable("sleep_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD (sleep start date)
  bedtime: varchar("bedtime", { length: 5 }), // HH:MM
  wakeTime: varchar("wakeTime", { length: 5 }), // HH:MM
  duration: int("duration").notNull(), // in minutes
  quality: mysqlEnum("quality", ["excellent", "good", "fair", "poor"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SleepTracking = typeof sleepTracking.$inferSelect;
export type InsertSleepTracking = typeof sleepTracking.$inferInsert;

/**
 * Health Metrics - centralized biometric data
 */
export const healthMetrics = mysqlTable("health_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  weight: int("weight"), // in grams (e.g., 70000 = 70kg)
  bodyFatPercentage: int("bodyFatPercentage"), // stored as integer (e.g., 185 = 18.5%)
  muscleMass: int("muscleMass"), // in grams
  restingHeartRate: int("restingHeartRate"), // bpm
  bloodPressureSystolic: int("bloodPressureSystolic"),
  bloodPressureDiastolic: int("bloodPressureDiastolic"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = typeof healthMetrics.$inferInsert;

/**
 * Reminders - medication, habits, and health reminders
 */
export const wellbeingReminders = mysqlTable("wellbeing_reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["medication", "hydration", "exercise", "meditation", "custom"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  time: varchar("time", { length: 5 }), // HH:MM
  frequency: mysqlEnum("frequency", ["daily", "weekly", "custom"]).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WellbeingReminder = typeof wellbeingReminders.$inferSelect;
export type InsertWellbeingReminder = typeof wellbeingReminders.$inferInsert;

/**
 * Wearable Connections - tracks connected devices and authorization
 */
export const wearableConnections = mysqlTable("wearable_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["apple_health", "google_fit", "fitbit", "garmin", "samsung_health", "other"]).notNull(),
  deviceName: varchar("deviceName", { length: 255 }),
  accessToken: text("accessToken"), // encrypted OAuth token
  refreshToken: text("refreshToken"), // encrypted refresh token
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scope: text("scope"), // permissions granted
  isActive: int("isActive").default(1).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WearableConnection = typeof wearableConnections.$inferSelect;
export type InsertWearableConnection = typeof wearableConnections.$inferInsert;

/**
 * Wearable Sync Logs - tracks sync history and errors
 */
export const wearableSyncLogs = mysqlTable("wearable_sync_logs", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull(),
  userId: int("userId").notNull(),
  dataType: mysqlEnum("dataType", ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes", "blood_pressure", "blood_glucose", "oxygen_saturation"]).notNull(),
  recordsProcessed: int("recordsProcessed").default(0).notNull(),
  status: mysqlEnum("status", ["success", "failed", "partial"]).notNull(),
  errorMessage: text("errorMessage"),
  syncStartedAt: timestamp("syncStartedAt").notNull(),
  syncCompletedAt: timestamp("syncCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WearableSyncLog = typeof wearableSyncLogs.$inferSelect;
export type InsertWearableSyncLog = typeof wearableSyncLogs.$inferInsert;

/**
 * Wearable Data Cache - temporary storage for synced data before processing
 */
export const wearableDataCache = mysqlTable("wearable_data_cache", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull(),
  userId: int("userId").notNull(),
  dataType: mysqlEnum("dataType", ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes", "blood_pressure", "blood_glucose", "oxygen_saturation"]).notNull(),
  rawData: text("rawData").notNull(), // JSON string of raw API response
  timestamp: timestamp("timestamp").notNull(), // when the data was recorded by the device
  processed: int("processed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WearableDataCache = typeof wearableDataCache.$inferSelect;
export type InsertWearableDataCache = typeof wearableDataCache.$inferInsert;

/**
 * Wellness Profile - stores user's onboarding assessment and preferences
 */
export const wellnessProfiles = mysqlTable("wellness_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Fitness level
  fitnessLevel: mysqlEnum("fitnessLevel", ["beginner", "intermediate", "advanced"]).notNull(),
  // Primary goals (can be multiple, stored as JSON array)
  primaryGoals: text("primaryGoals").notNull(), // JSON: ["weight_loss", "muscle_gain", "stress_reduction", "better_sleep", "increase_energy", "improve_flexibility"]
  // Lifestyle factors
  activityLevel: mysqlEnum("activityLevel", ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]).notNull(),
  sleepHoursPerNight: int("sleepHoursPerNight"), // Average hours
  dietPreference: varchar("dietPreference", { length: 100 }), // vegetarian, vegan, keto, paleo, none, etc.
  // Challenges and barriers
  challenges: text("challenges"), // JSON array of challenges
  availableEquipment: text("availableEquipment"), // JSON array of equipment
  workoutDaysPerWeek: int("workoutDaysPerWeek"), // Target workout frequency
  workoutDurationPreference: int("workoutDurationPreference"), // Preferred duration in minutes
  // Medical considerations
  medicalConditions: text("medicalConditions"), // JSON array or text
  injuries: text("injuries"), // JSON array or text
  // Preferences
  preferredWorkoutTypes: text("preferredWorkoutTypes"), // JSON: ["yoga", "hiit", "strength", "cardio", "pilates"]
  preferredWorkoutTime: varchar("preferredWorkoutTime", { length: 50 }), // morning, afternoon, evening
  // Tracking
  completedOnboarding: int("completedOnboarding").default(1).notNull(),
  onboardingCompletedAt: timestamp("onboardingCompletedAt").defaultNow().notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type WellnessProfile = typeof wellnessProfiles.$inferSelect;
export type InsertWellnessProfile = typeof wellnessProfiles.$inferInsert;

/**
 * Wellness Goals - specific, measurable goals set by users
 */
export const wellnessGoals = mysqlTable("wellness_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  goalType: mysqlEnum("goalType", ["weight", "workout_frequency", "nutrition", "sleep", "meditation", "custom"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetValue: varchar("targetValue", { length: 100 }), // e.g., "70kg", "5 workouts/week", "8 hours sleep"
  currentValue: varchar("currentValue", { length: 100 }),
  targetDate: timestamp("targetDate"),
  status: mysqlEnum("status", ["active", "completed", "paused", "abandoned"]).default("active").notNull(),
  progress: int("progress").default(0), // 0-100 percentage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type WellnessGoal = typeof wellnessGoals.$inferSelect;
export type InsertWellnessGoal = typeof wellnessGoals.$inferInsert;

/**
 * Coaching Recommendations - AI-generated personalized suggestions
 */
export const coachingRecommendations = mysqlTable("coaching_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recommendationType: mysqlEnum("recommendationType", ["workout", "nutrition", "mental_wellness", "sleep", "general"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Detailed recommendation text
  reasoning: text("reasoning"), // Why this recommendation was made
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  actionable: int("actionable").default(1).notNull(), // Whether user can take immediate action
  actionUrl: varchar("actionUrl", { length: 512 }), // Link to relevant section/workout/etc
  // Context that generated this recommendation
  basedOnData: text("basedOnData"), // JSON: what data points influenced this
  // User interaction
  viewed: int("viewed").default(0).notNull(),
  viewedAt: timestamp("viewedAt"),
  dismissed: int("dismissed").default(0).notNull(),
  dismissedAt: timestamp("dismissedAt"),
  completed: int("completed").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  // Validity
  expiresAt: timestamp("expiresAt"), // Some recommendations are time-sensitive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachingRecommendation = typeof coachingRecommendations.$inferSelect;
export type InsertCoachingRecommendation = typeof coachingRecommendations.$inferInsert;

/**
 * Coaching Feedback - user feedback on recommendations
 */
export const coachingFeedback = mysqlTable("coaching_feedback", {
  id: int("id").autoincrement().primaryKey(),
  recommendationId: int("recommendationId").notNull(),
  userId: int("userId").notNull(),
  helpful: int("helpful"), // 1 = helpful, 0 = not helpful
  rating: int("rating"), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachingFeedback = typeof coachingFeedback.$inferSelect;
export type InsertCoachingFeedback = typeof coachingFeedback.$inferInsert;

/**
 * Verified Facts - Cross-user knowledge base for fact-checked information
 * This table stores verified facts from the Learning Hub that can be shared
 * across all users in the Voice Assistant for up-to-date responses
 */
export const verifiedFacts = mysqlTable("verified_facts", {
  id: int("id").autoincrement().primaryKey(),
  // The original question that was fact-checked
  question: text("question").notNull(),
  // Normalized version for matching similar questions
  normalizedQuestion: varchar("normalizedQuestion", { length: 512 }).notNull(),
  // The verified answer based on web search results
  answer: text("answer").notNull(),
  // Verification status from fact-checking
  verificationStatus: mysqlEnum("verificationStatus", ["verified", "disputed", "debunked", "unverified"]).notNull(),
  // Confidence score 0-100
  confidenceScore: int("confidenceScore").notNull(),
  // JSON array of source objects with title, url, credibilityScore
  sources: text("sources").notNull(),
  // When this fact was verified
  verifiedAt: timestamp("verifiedAt").defaultNow().notNull(),
  // When this fact should be considered stale and re-verified (default 30 days)
  expiresAt: timestamp("expiresAt").notNull(),
  // Number of times this fact has been accessed
  accessCount: int("accessCount").default(0).notNull(),
  // Last time this fact was accessed
  lastAccessedAt: timestamp("lastAccessedAt"),
  // User who first verified this fact (optional, for attribution)
  verifiedByUserId: int("verifiedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VerifiedFact = typeof verifiedFacts.$inferSelect;
export type InsertVerifiedFact = typeof verifiedFacts.$inferInsert;

/**
 * Fact Access Log - Track which users accessed which verified facts
 * Used to send notifications when facts are updated
 */
export const factAccessLog = mysqlTable("fact_access_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  verifiedFactId: int("verifiedFactId").notNull(),
  // Store the fact version at time of access for comparison
  factVersion: text("factVersion").notNull(), // JSON snapshot of the fact
  accessedAt: timestamp("accessedAt").defaultNow().notNull(),
  // Track access source (voice_assistant, learning_hub)
  accessSource: mysqlEnum("accessSource", ["voice_assistant", "learning_hub"]).notNull(),
});

export type FactAccessLog = typeof factAccessLog.$inferSelect;
export type InsertFactAccessLog = typeof factAccessLog.$inferInsert;

/**
 * Fact Update Notifications - Notify users when facts they've accessed are updated
 */
export const factUpdateNotifications = mysqlTable("fact_update_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  verifiedFactId: int("verifiedFactId").notNull(),
  // The old and new versions for comparison
  oldVersion: text("oldVersion").notNull(), // JSON snapshot
  newVersion: text("newVersion").notNull(), // JSON snapshot
  // Notification metadata
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  // User interaction
  isRead: int("isRead").default(0).notNull(),
  readAt: timestamp("readAt"),
  isDismissed: int("isDismissed").default(0).notNull(),
  dismissedAt: timestamp("dismissedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FactUpdateNotification = typeof factUpdateNotifications.$inferSelect;
export type InsertFactUpdateNotification = typeof factUpdateNotifications.$inferInsert;

/**
 * Translation Categories - User-defined categories for organizing saved translations
 */
export const translationCategories = mysqlTable("translation_categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }), // Optional emoji or icon identifier
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TranslationCategory = typeof translationCategories.$inferSelect;
export type InsertTranslationCategory = typeof translationCategories.$inferInsert;

/**
 * Saved Translations - User's phrasebook of saved translations
 */
export const savedTranslations = mysqlTable("saved_translations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalText: text("originalText").notNull(),
  translatedText: text("translatedText").notNull(),
  sourceLanguage: varchar("sourceLanguage", { length: 50 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 50 }).notNull(),
  categoryId: int("categoryId"), // Optional category
  isFavorite: int("isFavorite").default(0).notNull(),
  usageCount: int("usageCount").default(1).notNull(), // Track frequency for caching
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt").defaultNow().notNull(),
});

export type SavedTranslation = typeof savedTranslations.$inferSelect;
export type InsertSavedTranslation = typeof savedTranslations.$inferInsert;

/**
 * Conversation Sessions - Practice conversations for language learning
 */
export const conversationSessions = mysqlTable("conversation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  language1: varchar("language1", { length: 50 }).notNull(),
  language2: varchar("language2", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
});

export type ConversationSession = typeof conversationSessions.$inferSelect;
export type InsertConversationSession = typeof conversationSessions.$inferInsert;

/**
 * Conversation Messages - Individual messages within practice conversations
 */
export const conversationMessages = mysqlTable("conversation_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  messageText: text("messageText").notNull(),
  translatedText: text("translatedText").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  sender: mysqlEnum("sender", ["user", "practice"]).notNull(), // user or practice partner
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = typeof conversationMessages.$inferInsert;

/**
 * Topic Progress - Track user progress through learning topics
 */
export const topicProgress = mysqlTable("topic_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topicName: varchar("topicName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "early-math", "elementary", etc.
  status: mysqlEnum("status", ["not_started", "learning", "practicing", "mastered"]).default("not_started").notNull(),
  lessonCompleted: int("lessonCompleted").default(0).notNull(), // 1 if lesson finished
  practiceCount: int("practiceCount").default(0).notNull(), // Number of practice problems attempted
  quizzesTaken: int("quizzesTaken").default(0).notNull(),
  bestQuizScore: int("bestQuizScore").default(0).notNull(), // Best score 0-100
  masteryLevel: int("masteryLevel").default(0).notNull(), // Overall mastery 0-100
  lastStudied: timestamp("lastStudied").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TopicProgress = typeof topicProgress.$inferSelect;
export type InsertTopicProgress = typeof topicProgress.$inferInsert;

/**
 * Topic Quiz Results - Store quiz attempts and detailed results
 */
export const topicQuizResults = mysqlTable("topic_quiz_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topicName: varchar("topicName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  quizType: mysqlEnum("quizType", ["quick_check", "topic_quiz", "mixed_review"]).default("topic_quiz").notNull(),
  score: int("score").notNull(), // Score 0-100
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  timeSpent: int("timeSpent"), // Time in seconds
  weakAreas: text("weakAreas"), // JSON array of subtopics needing review
  answers: text("answers"), // JSON array of question/answer pairs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TopicQuizResult = typeof topicQuizResults.$inferSelect;
export type InsertTopicQuizResult = typeof topicQuizResults.$inferInsert;

/**
 * Practice Sessions - Track individual practice sessions
 */
export const practiceSessions = mysqlTable("practice_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topicName: varchar("topicName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  problemsSolved: int("problemsSolved").default(0).notNull(),
  problemsCorrect: int("problemsCorrect").default(0).notNull(),
  accuracy: int("accuracy").default(0).notNull(), // Percentage 0-100
  hintsUsed: int("hintsUsed").default(0).notNull(),
  duration: int("duration"), // Time in seconds
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = typeof practiceSessions.$inferInsert;

/**
 * Translate Conversations - Shareable multilingual chat rooms
 */
export const translateConversations = mysqlTable("translate_conversations", {
  id: int("id").autoincrement().primaryKey(),
  shareableCode: varchar("shareableCode", { length: 64 }).notNull().unique(),
  creatorId: int("creatorId").notNull(),
  title: varchar("title", { length: 255 }),
  isActive: int("isActive").default(1).notNull(), // 1=active, 0=disabled
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TranslateConversation = typeof translateConversations.$inferSelect;
export type InsertTranslateConversation = typeof translateConversations.$inferInsert;

/**
 * Translate Conversation Participants - Users in each conversation with their language preferences
 */
export const translateConversationParticipants = mysqlTable("translate_conversation_participants", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  userId: int("userId").notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).notNull(), // ISO language code
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type TranslateConversationParticipant = typeof translateConversationParticipants.$inferSelect;
export type InsertTranslateConversationParticipant = typeof translateConversationParticipants.$inferInsert;

/**
 * Translate Messages - Original messages sent in translate conversations
 */
export const translateMessages = mysqlTable("translate_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  originalText: text("originalText").notNull(),
  originalLanguage: varchar("originalLanguage", { length: 10 }).notNull(), // ISO language code
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TranslateMessage = typeof translateMessages.$inferSelect;
export type InsertTranslateMessage = typeof translateMessages.$inferInsert;

/**
 * Translate Message Translations - Cached translations for each user
 */
export const translateMessageTranslations = mysqlTable("translate_message_translations", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  translatedText: text("translatedText").notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(), // ISO language code
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TranslateMessageTranslation = typeof translateMessageTranslations.$inferSelect;
export type InsertTranslateMessageTranslation = typeof translateMessageTranslations.$inferInsert;

/**
 * Daily Usage Tracking table for feature limits
 */
export const dailyUsage = mysqlTable("daily_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  voiceAssistantCount: int("voiceAssistantCount").default(0).notNull(),
  verifiedLearningCount: int("verifiedLearningCount").default(0).notNull(),
  mathTutorCount: int("mathTutorCount").default(0).notNull(),
  translateCount: int("translateCount").default(0).notNull(),
  imageOcrCount: int("imageOcrCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyUsage = typeof dailyUsage.$inferSelect;
export type InsertDailyUsage = typeof dailyUsage.$inferInsert;

/**
 * Learn Finance - Educational Content System
 * 7-tier progressive learning structure for financial literacy
 */

/**
 * Learning Tiers table - 7 main categories of financial education
 */
export const learningTiers = mysqlTable("learning_tiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(), // "Foundational Literacy", "Building Stability", etc.
  description: text("description").notNull(),
  orderIndex: int("orderIndex").notNull(), // 1-7 for display order
  icon: varchar("icon", { length: 50 }), // Emoji or icon name
  unlockCriteria: text("unlockCriteria"), // JSON object with prerequisites
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningTier = typeof learningTiers.$inferSelect;
export type InsertLearningTier = typeof learningTiers.$inferInsert;

/**
 * Financial Education Articles table
 */
export const financeArticles = mysqlTable("finance_articles", {
  id: int("id").autoincrement().primaryKey(),
  tierId: int("tierId").notNull(), // Foreign key to learning_tiers
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(), // URL-friendly version
  summary: text("summary").notNull(), // Short description for card preview
  content: text("content").notNull(), // Full article content in Markdown
  estimatedReadTime: int("estimatedReadTime").notNull(), // Minutes
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  tags: text("tags"), // JSON array of tags like ["budgeting", "debt", "savings"]
  relatedTools: text("relatedTools"), // JSON array of Money Hub tool references
  relatedArticles: text("relatedArticles"), // JSON array of related article IDs
  author: varchar("author", { length: 100 }).default("SASS-E").notNull(),
  published: boolean("published").default(false).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinanceArticle = typeof financeArticles.$inferSelect;
export type InsertFinanceArticle = typeof financeArticles.$inferInsert;

/**
 * User Learning Progress table
 */
export const userLearningProgress = mysqlTable("user_learning_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  articleId: int("articleId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  progressPercentage: int("progressPercentage").default(0).notNull(), // 0-100
  timeSpent: int("timeSpent").default(0).notNull(), // Seconds spent reading
  bookmarked: boolean("bookmarked").default(false).notNull(),
  lastReadAt: timestamp("lastReadAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = typeof userLearningProgress.$inferInsert;

/**
 * Financial Glossary table
 */
export const financialGlossary = mysqlTable("financial_glossary", {
  id: int("id").autoincrement().primaryKey(),
  term: varchar("term", { length: 200 }).notNull().unique(),
  definition: text("definition").notNull(), // Simple explanation
  example: text("example"), // Real-world example
  relatedTerms: text("relatedTerms"), // JSON array of related term IDs
  category: varchar("category", { length: 100 }), // "Credit", "Investing", "Debt", etc.
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialGlossaryTerm = typeof financialGlossary.$inferSelect;
export type InsertFinancialGlossaryTerm = typeof financialGlossary.$inferInsert;

/**
 * Learning Badges table
 */
export const learningBadges = mysqlTable("learning_badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }), // Emoji or icon reference
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).notNull(),
  criteria: text("criteria").notNull(), // JSON object describing how to earn
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningBadge = typeof learningBadges.$inferSelect;
export type InsertLearningBadge = typeof learningBadges.$inferInsert;

/**
 * User Badges table - tracks earned badges
 */
export const userLearningBadges = mysqlTable("user_learning_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserLearningBadge = typeof userLearningBadges.$inferSelect;
export type InsertUserLearningBadge = typeof userLearningBadges.$inferInsert;

/**
 * Hub Trials table - tracks 5-day free trials for specialized hubs
 * Free tier users can trial each hub once for 5 days
 */
export const hubTrials = mysqlTable("hub_trials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  hubId: mysqlEnum("hubId", ["money", "wellness", "translation_hub", "learning"]).notNull(),
  status: mysqlEnum("status", ["active", "expired", "converted"]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HubTrial = typeof hubTrials.$inferSelect;
export type InsertHubTrial = typeof hubTrials.$inferInsert;


