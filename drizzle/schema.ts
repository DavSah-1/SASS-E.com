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

