/**
 * MysqlMathScienceAdapter
 * 
 * MySQL implementation of MathScienceAdapter - delegates to MysqlLearningAdapter
 */

import { MysqlLearningAdapter } from './MysqlLearningAdapter';
import type { MathScienceAdapter } from './MathScienceAdapter';

export class MysqlMathScienceAdapter implements MathScienceAdapter {
  private learningAdapter: MysqlLearningAdapter;

  constructor() {
    this.learningAdapter = new MysqlLearningAdapter();
  }

  async getMathProgress(userId: number): Promise<any | undefined> {
    return this.learningAdapter.getMathProgress(userId);
  }

  async updateMathProgress(userId: number, updates: any): Promise<void> {
    return this.learningAdapter.updateMathProgress(userId, updates);
  }

  async getMathProblems(topic?: string, difficulty?: string, limit?: number): Promise<any[]> {
    return this.learningAdapter.getMathProblems(topic, difficulty, limit);
  }

  async getMathProblem(problemId: number): Promise<any | undefined> {
    return this.learningAdapter.getMathProblem(problemId);
  }

  async saveMathProblem(problem: any): Promise<number> {
    return this.learningAdapter.saveMathProblem(problem);
  }

  async saveMathSolution(solution: any): Promise<number> {
    return this.learningAdapter.saveMathSolution(solution);
  }

  async getUserMathSolutions(userId: number, limit?: number): Promise<any[]> {
    return this.learningAdapter.getUserMathSolutions(userId, limit);
  }

  async getScienceProgress(userId: number): Promise<any | undefined> {
    return this.learningAdapter.getScienceProgress(userId);
  }

  async initializeScienceProgress(userId: number): Promise<void> {
    return this.learningAdapter.initializeScienceProgress(userId);
  }

  async updateScienceProgress(userId: number, updates: any): Promise<void> {
    return this.learningAdapter.updateScienceProgress(userId, updates);
  }

  async getExperiments(filters: any): Promise<any[]> {
    return this.learningAdapter.getExperiments(filters);
  }

  async getExperimentById(experimentId: number): Promise<any | undefined> {
    return this.learningAdapter.getExperimentById(experimentId);
  }

  async getExperimentSteps(experimentId: number): Promise<any[]> {
    return this.learningAdapter.getExperimentSteps(experimentId);
  }

  async saveLabResult(result: any): Promise<number> {
    return this.learningAdapter.saveLabResult(result);
  }

  async getUserLabResults(userId: number, experimentId?: number): Promise<any[]> {
    return this.learningAdapter.getUserLabResults(userId, experimentId);
  }

  async getLabQuizQuestions(experimentId: number): Promise<any[]> {
    return this.learningAdapter.getLabQuizQuestions(experimentId);
  }

  async saveLabQuizQuestions(questions: any[]): Promise<boolean> {
    return this.learningAdapter.saveLabQuizQuestions(questions);
  }

  async saveLabQuizAttempt(attempt: any): Promise<any> {
    return this.learningAdapter.saveLabQuizAttempt(attempt);
  }

  async getLabQuizAttempts(userId: number, experimentId?: number): Promise<any[]> {
    return this.learningAdapter.getLabQuizAttempts(userId, experimentId);
  }

  async hasPassedLabQuiz(userId: number, experimentId: number): Promise<boolean> {
    return this.learningAdapter.hasPassedLabQuiz(userId, experimentId);
  }
}
