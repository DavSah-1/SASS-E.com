/**
 * LearningHubAdapter
 * 
 * Handles learning hub operations across dual-database architecture.
 * Covers 3 tables: topicProgress, topicQuizResults, practiceSessions
 */

export interface LearningHubAdapter {
  // Topic progress
  getTopicProgress(userId: number, category?: string): Promise<any[]>;
  getTopicProgressByName(userId: number, topicName: string): Promise<any | null>;
  createTopicProgress(userId: number, topicName: string, category: string): Promise<any>;
  updateTopicProgress(userId: number, topicName: string, updates: any): Promise<void>;

  // Quiz results
  getTopicQuizResults(userId: number, topicId?: string): Promise<any[]>;
  submitTopicQuiz(userId: number, topicId: string, score: number, totalQuestions: number, answers: string): Promise<void>;

  // Practice sessions
  getPracticeSessions(userId: number, topicId?: string): Promise<any[]>;
  createPracticeSession(userId: number, topicId: string, problemsSolved: number, correctAnswers: number, duration?: number): Promise<void>;
}
