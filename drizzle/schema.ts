import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en"),
  preferredCurrency: varchar("preferredCurrency", { length: 3 }).default("USD"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "inactive", "trial"]).default("inactive").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
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
