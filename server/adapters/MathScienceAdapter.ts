/**
 * MathScienceAdapter
 * 
 * Handles math and science learning operations across dual-database architecture.
 * Covers 10 tables: mathProblems, mathSolutions, mathProgress, experiments, experimentSteps,
 * userLabResults, scienceProgress, labQuizQuestions, labQuizAttempts
 */

export interface MathScienceAdapter {
  // Math operations
  getMathProblems(topic: string, difficulty?: string): Promise<any[]>;
  submitMathSolution(userId: number, problemId: number, userSolution: string, isCorrect: boolean, feedback?: string): Promise<void>;
  getMathProgress(userId: number, topic?: string): Promise<any[]>;
  updateMathProgress(userId: number, topic: string, updates: any): Promise<void>;

  // Science experiments
  getExperiments(subject?: string, difficulty?: string): Promise<any[]>;
  getExperimentSteps(experimentId: number): Promise<any[]>;
  submitLabResult(userId: number, experimentId: number, observations: string, conclusion?: string, photos?: string): Promise<void>;
  getUserLabResults(userId: number, experimentId?: number): Promise<any[]>;

  // Science progress
  getScienceProgress(userId: number, subject?: string): Promise<any[]>;
  updateScienceProgress(userId: number, subject: string, updates: any): Promise<void>;

  // Lab quizzes
  getLabQuizQuestions(experimentId: number): Promise<any[]>;
  submitLabQuizAttempt(userId: number, experimentId: number, answers: string, score: number, totalQuestions: number): Promise<void>;
  getLabQuizAttempts(userId: number, experimentId?: number): Promise<any[]>;
}
