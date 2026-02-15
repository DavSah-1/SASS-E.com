/**
 * SupabaseLearningAdapter
 * 
 * Supabase implementation of LearningAdapter with RLS enforcement
 */

import { getSupabaseClient } from '../supabaseClient';
import type { LearningAdapter } from './LearningAdapter';

export class SupabaseLearningAdapter implements LearningAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient() {
    return getSupabaseClient(this.userId, this.accessToken);
  }

  async saveLearningSession(session: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: this.userId,
        session_type: session.sessionType,
        language: session.language,
        duration_minutes: session.durationMinutes,
        topics_covered: session.topicsCovered,
        notes: session.notes,
        session_date: session.sessionDate,
      });

    if (error) throw new Error(`Supabase saveLearningSession error: ${error.message}`);
  }

  async getUserLearningSessions(userId: number, limit: number = 50): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Supabase getUserLearningSessions error: ${error.message}`);

    return (data || []).map((s: any) => ({
      id: s.id,
      userId: parseInt(this.userId),
      sessionType: s.session_type,
      language: s.language,
      durationMinutes: s.duration_minutes,
      topicsCovered: s.topics_covered,
      notes: s.notes,
      sessionDate: s.session_date,
      createdAt: s.created_at,
    }));
  }

  async saveLearningSource(source: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('learning_sources')
      .insert({
        user_id: this.userId,
        source_type: source.sourceType,
        source_name: source.sourceName,
        source_url: source.sourceUrl,
        language: source.language,
        notes: source.notes,
      });

    if (error) throw new Error(`Supabase saveLearningSource error: ${error.message}`);
  }

  async getUserVocabularyProgress(userId: number, language: string): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_vocabulary')
      .select('*')
      .eq('user_id', this.userId)
      .eq('language', language)
      .order('last_reviewed', { ascending: false });

    if (error) throw new Error(`Supabase getUserVocabularyProgress error: ${error.message}`);

    return (data || []).map((v: any) => ({
      id: v.id,
      userId: parseInt(this.userId),
      language: v.language,
      word: v.word,
      translation: v.translation,
      proficiencyLevel: v.proficiency_level,
      timesReviewed: v.times_reviewed,
      lastReviewed: v.last_reviewed,
      createdAt: v.created_at,
    }));
  }

  async saveUserVocabularyProgress(progress: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('user_vocabulary')
      .insert({
        user_id: this.userId,
        language: progress.language,
        word: progress.word,
        translation: progress.translation,
        proficiency_level: progress.proficiencyLevel,
        times_reviewed: progress.timesReviewed || 1,
        last_reviewed: progress.lastReviewed || new Date().toISOString(),
      });

    if (error) throw new Error(`Supabase saveUserVocabularyProgress error: ${error.message}`);
  }

  async getGrammarLessons(language: string, difficulty?: string): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('grammar_lessons')
      .select('*')
      .eq('language', language)
      .order('lesson_order', { ascending: true });

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Supabase getGrammarLessons error: ${error.message}`);

    return (data || []).map((l: any) => ({
      id: l.id,
      language: l.language,
      lessonTitle: l.lesson_title,
      lessonContent: l.lesson_content,
      difficulty: l.difficulty,
      lessonOrder: l.lesson_order,
      createdAt: l.created_at,
    }));
  }

  async getUserGrammarProgress(userId: number, language: string): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_grammar_progress')
      .select('*')
      .eq('user_id', this.userId)
      .eq('language', language)
      .order('last_practiced', { ascending: false });

    if (error) throw new Error(`Supabase getUserGrammarProgress error: ${error.message}`);

    return (data || []).map((g: any) => ({
      id: g.id,
      userId: parseInt(this.userId),
      lessonId: g.lesson_id,
      language: g.language,
      completed: g.completed === 1,
      score: g.score,
      lastPracticed: g.last_practiced,
      createdAt: g.created_at,
    }));
  }

  async saveUserGrammarProgress(progress: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('user_grammar_progress')
      .insert({
        user_id: this.userId,
        lesson_id: progress.lessonId,
        language: progress.language,
        completed: progress.completed ? 1 : 0,
        score: progress.score,
        last_practiced: progress.lastPracticed || new Date().toISOString(),
      });

    if (error) throw new Error(`Supabase saveUserGrammarProgress error: ${error.message}`);
  }

  async getUserLanguageProgress(userId: number, language: string): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_language_progress')
      .select('*')
      .eq('user_id', this.userId)
      .eq('language', language)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getUserLanguageProgress error: ${error.message}`);
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: parseInt(this.userId),
      language: data.language,
      proficiencyLevel: data.proficiency_level,
      vocabularyCount: data.vocabulary_count,
      grammarLessonsCompleted: data.grammar_lessons_completed,
      totalStudyHours: data.total_study_hours,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastStudied: data.last_studied,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async upsertUserLanguageProgress(progress: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('user_language_progress')
      .upsert({
        user_id: this.userId,
        language: progress.language,
        proficiency_level: progress.proficiencyLevel,
        vocabulary_count: progress.vocabularyCount,
        grammar_lessons_completed: progress.grammarLessonsCompleted,
        total_study_hours: progress.totalStudyHours,
        current_streak: progress.currentStreak,
        longest_streak: progress.longestStreak,
        last_studied: progress.lastStudied,
      }, {
        onConflict: 'user_id,language'
      });

    if (error) throw new Error(`Supabase upsertUserLanguageProgress error: ${error.message}`);
  }

  async getDailyLesson(userId: number, language: string, lessonDate: Date): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('daily_lessons')
      .select('*')
      .eq('user_id', this.userId)
      .eq('language', language)
      .eq('lesson_date', lessonDate.toISOString().split('T')[0])
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getDailyLesson error: ${error.message}`);
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: parseInt(this.userId),
      language: data.language,
      lessonDate: data.lesson_date,
      lessonContent: data.lesson_content,
      completed: data.completed === 1,
      createdAt: data.created_at,
    };
  }

  async saveDailyLesson(lesson: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('daily_lessons')
      .insert({
        user_id: this.userId,
        language: lesson.language,
        lesson_date: lesson.lessonDate,
        lesson_content: lesson.lessonContent,
        completed: lesson.completed ? 1 : 0,
      });

    if (error) throw new Error(`Supabase saveDailyLesson error: ${error.message}`);
  }

  async getMathProgress(userId: number): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('math_progress')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getMathProgress error: ${error.message}`);
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: parseInt(this.userId),
      currentLevel: data.current_level,
      topicsCompleted: data.topics_completed,
      totalProblems: data.total_problems,
      correctAnswers: data.correct_answers,
      lastPracticed: data.last_practiced,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateMathProgress(userId: number, updates: any): Promise<void> {
    const supabase = await this.getClient();
    const supabaseUpdates: any = {};

    if (updates.currentLevel !== undefined) supabaseUpdates.current_level = updates.currentLevel;
    if (updates.topicsCompleted !== undefined) supabaseUpdates.topics_completed = updates.topicsCompleted;
    if (updates.totalProblems !== undefined) supabaseUpdates.total_problems = updates.totalProblems;
    if (updates.correctAnswers !== undefined) supabaseUpdates.correct_answers = updates.correctAnswers;
    if (updates.lastPracticed !== undefined) supabaseUpdates.last_practiced = updates.lastPracticed;

    const { error } = await supabase
      .from('math_progress')
      .update(supabaseUpdates)
      .eq('user_id', this.userId);

    if (error) throw new Error(`Supabase updateMathProgress error: ${error.message}`);
  }

  async getScienceProgress(userId: number): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('science_progress')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getScienceProgress error: ${error.message}`);
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: parseInt(this.userId),
      currentLevel: data.current_level,
      topicsCompleted: data.topics_completed,
      experimentsCompleted: data.experiments_completed,
      lastPracticed: data.last_practiced,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async initializeScienceProgress(userId: number): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('science_progress')
      .insert({
        user_id: this.userId,
        current_level: 1,
        topics_completed: 0,
        experiments_completed: 0,
      });

    if (error) throw new Error(`Supabase initializeScienceProgress error: ${error.message}`);
  }

  async updateScienceProgress(userId: number, updates: any): Promise<void> {
    const supabase = await this.getClient();
    const supabaseUpdates: any = {};

    if (updates.currentLevel !== undefined) supabaseUpdates.current_level = updates.currentLevel;
    if (updates.topicsCompleted !== undefined) supabaseUpdates.topics_completed = updates.topicsCompleted;
    if (updates.experimentsCompleted !== undefined) supabaseUpdates.experiments_completed = updates.experimentsCompleted;
    if (updates.lastPracticed !== undefined) supabaseUpdates.last_practiced = updates.lastPracticed;

    const { error } = await supabase
      .from('science_progress')
      .update(supabaseUpdates)
      .eq('user_id', this.userId);

    if (error) throw new Error(`Supabase updateScienceProgress error: ${error.message}`);
  }

  async recordGoalProgress(progress: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('goal_progress')
      .insert({
        goal_id: progress.goalId,
        user_id: this.userId,
        amount: progress.amount,
        note: progress.note,
        source: progress.source || 'manual',
      });

    if (error) throw new Error(`Supabase recordGoalProgress error: ${error.message}`);
  }

  async getGoalProgressHistory(goalId: number, limit: number = 50): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('goal_progress')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Supabase getGoalProgressHistory error: ${error.message}`);

    return (data || []).map((p: any) => ({
      id: p.id,
      goalId: p.goal_id,
      userId: parseInt(this.userId),
      amount: p.amount,
      note: p.note,
      source: p.source,
      createdAt: p.created_at,
    }));
  }

  async getTopicProgress(userId: number, topicName: string, category: string): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('topic_progress')
      .select('*')
      .eq('user_id', this.userId)
      .eq('topic_name', topicName)
      .eq('category', category)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getTopicProgress error: ${error.message}`);
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: parseInt(this.userId),
      topicName: data.topic_name,
      category: data.category,
      completed: data.completed === 1,
      score: data.score,
      lastPracticed: data.last_practiced,
      createdAt: data.created_at,
    };
  }

  async getCategoryProgress(userId: number, category: string): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('topic_progress')
      .select('*')
      .eq('user_id', this.userId)
      .eq('category', category)
      .order('last_studied', { ascending: false });

    if (error) throw new Error(`Supabase getCategoryProgress error: ${error.message}`);

    return (data || []).map((t: any) => ({
      id: t.id,
      userId: parseInt(this.userId),
      topicName: t.topic_name,
      category: t.category,
      status: t.status,
      lessonCompleted: t.lesson_completed,
      practiceCount: t.practice_count,
      quizzesTaken: t.quizzes_taken,
      bestQuizScore: t.best_quiz_score,
      masteryLevel: t.mastery_level,
      lastStudied: t.last_studied,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  }

  async getVocabularyItems(language: string, difficulty?: string, limit: number = 50): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('vocabulary_items')
      .select('*')
      .eq('language', language);
    
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }
    
    const { data, error } = await query
      .order('word', { ascending: true })
      .limit(limit);
    
    if (error) throw new Error(`Supabase getVocabularyItems error: ${error.message}`);
    return data || [];
  }

  async getLanguageExercises(language: string, exerciseType?: string, difficulty?: string, limit?: number): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('language_exercises')
      .select('*')
      .eq('language', language);
    
    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(`Supabase getLanguageExercises error: ${error.message}`);
    return data || [];
  }

  async saveExerciseAttempt(attempt: any): Promise<number> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('exercise_attempts')
      .insert({
        user_id: this.userId,
        exercise_id: attempt.exerciseId,
        workout_id: attempt.workoutId || 1,
        exercise_name: attempt.exerciseName || 'Test Exercise',
        sets_completed: attempt.setsCompleted || 1,
        reps_completed: attempt.repsCompleted || 1,
        user_answer: attempt.userAnswer,
        is_correct: attempt.isCorrect,
        created_at: attempt.attemptedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveExerciseAttempt error: ${error.message}`);
    return data?.id;
  }

  async getUserAchievements(userId: number, language?: string): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('language_achievements')
      .select('*')
      .eq('user_id', this.userId);
    
    if (language) {
      query = query.eq('language', language);
    }
    
    const { data, error } = await query.order('earned_at', { ascending: false });
    
    if (error) throw new Error(`Supabase getUserAchievements error: ${error.message}`);
    return data || [];
  }

  async updateTopicProgress(userId: number, topicName: string, category: string, updates: any): Promise<void> {
    const supabase = await this.getClient();
    const supabaseData: any = {
      user_id: this.userId,
      topic_name: topicName,
      category: category,
      last_accessed: new Date().toISOString(),
    };
    if (updates.status !== undefined) supabaseData.status = updates.status;
    if (updates.lessonCompleted !== undefined) supabaseData.lesson_completed = updates.lessonCompleted;
    if (updates.practiceCount !== undefined) supabaseData.practice_count = updates.practiceCount;
    if (updates.quizzesTaken !== undefined) supabaseData.quizzes_taken = updates.quizzesTaken;
    if (updates.bestQuizScore !== undefined) supabaseData.best_quiz_score = updates.bestQuizScore;
    if (updates.masteryLevel !== undefined) supabaseData.mastery_level = updates.masteryLevel;
    
    const { error } = await supabase
      .from('topic_progress')
      .upsert(supabaseData, { onConflict: 'user_id,topic_name,category' });
    
    if (error) throw new Error(`Supabase updateTopicProgress error: ${error.message}`);
  }

  async savePracticeSession(session: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('practice_sessions')
      .insert({
        ...session,
        user_id: this.userId,
        session_date: new Date(),
      });
    
    if (error) throw new Error(`Supabase savePracticeSession error: ${error.message}`);
  }

  async saveQuizResult(result: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: this.userId,
        topic_id: result.topicName,
        score: result.score,
        total_questions: result.totalQuestions,
        answers: result.answers ? JSON.stringify(result.answers) : null,
        created_at: new Date(),
      });
    
    if (error) throw new Error(`Supabase saveQuizResult error: ${error.message}`);
  }

  async getQuizResults(userId: number, topicName: string, category: string, limit?: number): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', this.userId)
      .eq('topic_name', topicName)
      .eq('category', category)
      .order('completed_at', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) throw new Error(`Supabase getQuizResults error: ${error.message}`);
    return data || [];
  }

  async getPracticeSessions(userId: number, topicName: string, category: string, limit?: number): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .eq('topic_name', topicName)
      .eq('category', category)
      .order('session_date', { ascending: false });
    
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) throw new Error(`Supabase getPracticeSessions error: ${error.message}`);
    return data || [];
  }

  async getMathProblems(topic?: string, difficulty?: string, limit: number = 10): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase.from('math_problems').select('*');
    
    if (difficulty) query = query.eq('difficulty', difficulty);
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Supabase getMathProblems error: ${error.message}`);
    return data || [];
  }

  async getMathProblem(problemId: number): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('math_problems')
      .select('*')
      .eq('id', problemId)
      .maybeSingle();
    
    if (error) throw new Error(`Supabase getMathProblem error: ${error.message}`);
    return data;
  }

  async saveMathProblem(problem: any): Promise<number> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('math_problems')
      .insert({
        topic: problem.topic,
        difficulty: problem.difficulty,
        problem_text: problem.problemText,
        solution: problem.solution,
        hints: problem.hints,
        created_at: problem.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveMathProblem error: ${error.message}`);
    return data?.id || 0;
  }

  async saveMathSolution(solution: any): Promise<number> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('math_solutions')
      .insert({
        user_id: this.userId,
        problem_id: solution.problemId,
        user_solution: solution.userSolution,
        is_correct: solution.isCorrect,
        feedback: solution.feedback,
        submitted_at: solution.submittedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveMathSolution error: ${error.message}`);
    return data?.id || 0;
  }

  async getUserMathSolutions(userId: number, limit: number = 20): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('math_solutions')
      .select(`
        *,
        math_problems(*)
      `)
      .eq('user_id', this.userId)
      .order('submitted_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Supabase getUserMathSolutions error: ${error.message}`);
    return data || [];
  }

  async getExperiments(filters: any): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase.from('experiments').select('*');
    
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters?.limit) query = query.limit(filters.limit);
    
    const { data, error } = await query.order('title', { ascending: true });
    
    if (error) throw new Error(`Supabase getExperiments error: ${error.message}`);
    return data || [];
  }

  async getExperimentById(experimentId: number): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', experimentId)
      .maybeSingle();
    
    if (error) throw new Error(`Supabase getExperimentById error: ${error.message}`);
    return data;
  }

  async getExperimentSteps(experimentId: number): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('experiment_steps')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('step_number', { ascending: true });
    
    if (error) throw new Error(`Supabase getExperimentSteps error: ${error.message}`);
    return data || [];
  }

  async saveLabResult(result: any): Promise<number> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_lab_results')
      .insert({
        user_id: this.userId,
        experiment_id: result.experimentId,
        observations: result.observations,
        conclusion: result.conclusion,
        score: result.score,
        completed_at: result.completedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveLabResult error: ${error.message}`);
    return data?.id || 0;
  }

  async getUserLabResults(userId: number, experimentId?: number): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('user_lab_results')
      .select('*')
      .eq('user_id', this.userId);
    
    if (experimentId) query = query.eq('experiment_id', experimentId);
    
    const { data, error } = await query.order('completed_at', { ascending: false });
    
    if (error) throw new Error(`Supabase getUserLabResults error: ${error.message}`);
    return data || [];
  }
}
