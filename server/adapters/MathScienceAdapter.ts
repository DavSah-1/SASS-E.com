/**
 * MathScienceAdapter Interface
 * 
 * Specialized adapter for math and science operations (problems, experiments, lab quizzes).
 * Covers 9 tables: mathProblems, mathSolutions, mathProgress, experiments, experimentSteps,
 * userLabResults, scienceProgress, labQuizQuestions, labQuizAttempts
 */

export interface MathScienceAdapter {
  // Math Progress
  getMathProgress(userId: number): Promise<any | undefined>;
  updateMathProgress(userId: number, updates: any): Promise<void>;

  // Math Operations
  getMathProblems(topic?: string, difficulty?: string, limit?: number): Promise<any[]>;
  getMathProblem(problemId: number): Promise<any | undefined>;
  saveMathProblem(problem: any): Promise<number>;
  saveMathSolution(solution: any): Promise<number>;
  getUserMathSolutions(userId: number, limit?: number): Promise<any[]>;

  // Science Progress
  getScienceProgress(userId: number): Promise<any | undefined>;
  initializeScienceProgress(userId: number): Promise<void>;
  updateScienceProgress(userId: number, updates: any): Promise<void>;

  // Science Operations
  getExperiments(filters: any): Promise<any[]>;
  getExperimentById(experimentId: number): Promise<any | undefined>;
  getExperimentSteps(experimentId: number): Promise<any[]>;
  saveLabResult(result: any): Promise<number>;
  getUserLabResults(userId: number, experimentId?: number): Promise<any[]>;

  // Lab Quiz Operations
  getLabQuizQuestions(experimentId: number): Promise<any[]>;
  saveLabQuizQuestions(questions: any[]): Promise<boolean>;
  saveLabQuizAttempt(attempt: any): Promise<any>;
  getLabQuizAttempts(userId: number, experimentId?: number): Promise<any[]>;
  hasPassedLabQuiz(userId: number, experimentId: number): Promise<boolean>;
}
