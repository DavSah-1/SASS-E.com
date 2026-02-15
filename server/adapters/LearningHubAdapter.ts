/**
 * LearningHubAdapter Interface
 * 
 * Specialized adapter for learning hub operations (topic progress, quizzes, practice sessions).
 * Covers 3 tables: topicProgress, topicQuizResults, practiceSessions
 */

export interface LearningHubAdapter {
  // Topic Progress
  getTopicProgress(userId: number, topicName: string, category: string): Promise<any | undefined>;
  getCategoryProgress(userId: number, category: string): Promise<any[]>;
  updateTopicProgress(userId: number, topicName: string, category: string, updates: any): Promise<void>;

  // Practice Sessions
  savePracticeSession(session: any): Promise<void>;
  getPracticeSessions(userId: number, topicName: string, category: string, limit?: number): Promise<any[]>;

  // Quiz Results
  saveQuizResult(result: any): Promise<void>;
  getQuizResults(userId: number, topicName: string, category: string, limit?: number): Promise<any[]>;
}
