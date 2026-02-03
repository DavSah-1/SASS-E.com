/**
 * Role-Aware Database Operations
 * 
 * This module provides wrapper functions that route database operations based on user role:
 * - Admin users → Manus MySQL database (via db.ts)
 * - Regular users → Supabase PostgreSQL database with RLS enforcement (via supabaseClient.ts)
 * 
 * All function names match exactly with the original db.ts functions.
 */

import * as db from './db';
import { getSupabaseClient } from './supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Database context containing user information and access token for RLS
 */
export interface DbContext {
  user: {
    id: string | number;
    numericId?: number;
    role: 'admin' | 'user';
  };
  accessToken?: string;
}

/**
 * Helper function to handle Supabase errors consistently
 */
function handleSupabaseError(error: any, operation: string): never {
  console.error(`[Supabase Error] ${operation}:`, error);
  throw new Error(`Database operation failed: ${operation} - ${error.message || error.code}`);
}

// ============================================================================
// CORE - User Management
// ============================================================================

// Note: getDb, upsertUser, getUserBySupabaseId are admin-only operations
// They are not wrapped as they're only used during authentication setup

export async function updateUserLanguage(
  ctx: DbContext,
  userId: number,
  language: string
) {
  if (ctx.user.role === "admin") {
    return await db.updateUserLanguage(userId, language);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateUserLanguage');
    return data;
  }
}

export async function updateUserHubSelection(
  ctx: DbContext,
  userId: number,
  hubs: string[]
) {
  if (ctx.user.role === "admin") {
    return await db.updateUserHubSelection(userId, hubs);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('users')
      .update({ selected_hubs: hubs })
      .eq('id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateUserHubSelection');
    return data;
  }
}

export async function updateUserStaySignedIn(
  ctx: DbContext,
  userId: number,
  staySignedIn: boolean
) {
  if (ctx.user.role === "admin") {
    return await db.updateUserStaySignedIn(userId, staySignedIn);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('users')
      .update({ stay_signed_in: staySignedIn })
      .eq('id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateUserStaySignedIn');
    return data;
  }
}

// ============================================================================
// CORE - Conversations
// ============================================================================

export async function saveConversation(
  ctx: DbContext,
  conversation: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveConversation(conversation);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: String(ctx.user.id),
        user_message: conversation.userMessage,
        assistant_response: conversation.assistantResponse,
        context: conversation.context,
        timestamp: conversation.timestamp || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveConversation');
    return data;
  }
}

export async function getUserConversations(
  ctx: DbContext,
  userId: number,
  limit: number = 50
) {
  if (ctx.user.role === "admin") {
    return await db.getUserConversations(userId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getUserConversations');
    return data || [];
  }
}

export async function deleteAllUserConversations(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteAllUserConversations(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteAllUserConversations');
  }
}

// ============================================================================
// CORE - IoT Devices
// ============================================================================

export async function addIoTDevice(
  ctx: DbContext,
  device: any
) {
  if (ctx.user.role === "admin") {
    return await db.addIoTDevice(device);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_devices')
      .insert({
        user_id: String(ctx.user.id),
        device_name: device.deviceName,
        device_type: device.deviceType,
        status: device.status || 'offline',
        location: device.location,
        added_at: device.addedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'addIoTDevice');
    return data;
  }
}

export async function getUserIoTDevices(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserIoTDevices(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('added_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserIoTDevices');
    return data || [];
  }
}

export async function getIoTDeviceById(
  ctx: DbContext,
  deviceId: string
) {
  if (ctx.user.role === "admin") {
    return await db.getIoTDeviceById(deviceId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('id', String(deviceId))
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getIoTDeviceById');
    }
    return data;
  }
}

export async function updateIoTDeviceState(
  ctx: DbContext,
  deviceId: string,
  state: string,
  status: string = "online"
) {
  if (ctx.user.role === "admin") {
    return await db.updateIoTDeviceState(deviceId, state, status);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_devices')
      .update({ 
        status,
        last_updated: new Date()
      })
      .eq('id', String(deviceId))
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateIoTDeviceState');
    return data;
  }
}

export async function deleteIoTDevice(
  ctx: DbContext,
  deviceId: string
) {
  if (ctx.user.role === "admin") {
    return await db.deleteIoTDevice(deviceId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('iot_devices')
      .delete()
      .eq('id', String(deviceId))
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteIoTDevice');
  }
}

export async function saveIoTCommand(
  ctx: DbContext,
  command: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveIoTCommand(command);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_command_history')
      .insert({
        device_id: command.deviceId,
        command: command.command,
        status: command.status || 'pending',
        executed_at: command.executedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveIoTCommand');
    return data;
  }
}

export async function getDeviceCommandHistory(
  ctx: DbContext,
  deviceId: string,
  limit: number = 50
) {
  if (ctx.user.role === "admin") {
    return await db.getDeviceCommandHistory(deviceId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_command_history')
      .select('*')
      .eq('device_id', String(deviceId))
      .order('executed_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getDeviceCommandHistory');
    return data || [];
  }
}

// ============================================================================
// CORE - User Profiles
// ============================================================================

export async function getUserProfile(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserProfile(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getUserProfile');
    }
    return data;
  }
}

export async function createUserProfile(
  ctx: DbContext,
  profile: any
) {
  if (ctx.user.role === "admin") {
    return await db.createUserProfile(profile);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: String(ctx.user.id),
        personality_type: profile.personalityType,
        humor_style: profile.humorStyle,
        response_style: profile.responseStyle,
        created_at: profile.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createUserProfile');
    return data;
  }
}

export async function updateUserProfile(
  ctx: DbContext,
  userId: number,
  updates: any
) {
  if (ctx.user.role === "admin") {
    return await db.updateUserProfile(userId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateUserProfile');
    return data;
  }
}

// ============================================================================
// CORE - Conversation Feedback
// ============================================================================

export async function saveConversationFeedback(
  ctx: DbContext,
  feedback: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveConversationFeedback(feedback);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_feedback')
      .insert({
        conversation_id: feedback.conversationId,
        user_id: String(ctx.user.id),
        rating: feedback.rating,
        feedback_text: feedback.feedbackText,
        created_at: feedback.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveConversationFeedback');
    return data;
  }
}

export async function getConversationFeedback(
  ctx: DbContext,
  conversationId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getConversationFeedback(conversationId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_feedback')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getConversationFeedback');
    }
    return data;
  }
}

// ============================================================================
// LEARNING HUB - Learning Sessions & Fact Checking
// ============================================================================

export async function saveLearningSession(
  ctx: DbContext,
  session: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveLearningSession(session);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: String(ctx.user.id),
        topic: session.topic,
        summary: session.summary,
        key_points: session.keyPoints,
        created_at: session.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveLearningSession');
    return data;
  }
}

export async function getUserLearningSessions(
  ctx: DbContext,
  userId: number,
  limit: number = 20
) {
  if (ctx.user.role === "admin") {
    return await db.getUserLearningSessions(userId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getUserLearningSessions');
    return data || [];
  }
}

export async function saveFactCheckResult(
  ctx: DbContext,
  result: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveFactCheckResult(result);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('fact_check_results')
      .insert({
        session_id: result.sessionId,
        claim: result.claim,
        verdict: result.verdict,
        confidence: result.confidence,
        sources: result.sources,
        explanation: result.explanation,
        created_at: result.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveFactCheckResult');
    return data;
  }
}

export async function getFactCheckResultsBySession(
  ctx: DbContext,
  sessionId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getFactCheckResultsBySession(sessionId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('fact_check_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getFactCheckResultsBySession');
    return data || [];
  }
}

export async function saveLearningSource(
  ctx: DbContext,
  source: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveLearningSource(source);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('learning_sources')
      .insert({
        session_id: source.sessionId,
        title: source.title,
        url: source.url,
        source_type: source.sourceType,
        credibility_score: source.credibilityScore,
        created_at: source.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveLearningSource');
    return data;
  }
}

export async function saveStudyGuide(
  ctx: DbContext,
  guide: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveStudyGuide(guide);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('study_guides')
      .insert({
        user_id: String(ctx.user.id),
        topic: guide.topic,
        content: guide.content,
        difficulty: guide.difficulty,
        estimated_time: guide.estimatedTime,
        created_at: guide.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveStudyGuide');
    return data;
  }
}

export async function getUserStudyGuides(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserStudyGuides(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('study_guides')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserStudyGuides');
    return data || [];
  }
}

export async function saveQuiz(
  ctx: DbContext,
  quiz: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveQuiz(quiz);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        user_id: String(ctx.user.id),
        topic: quiz.topic,
        questions: quiz.questions,
        difficulty: quiz.difficulty,
        created_at: quiz.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveQuiz');
    return data;
  }
}

export async function getUserQuizzes(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserQuizzes(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserQuizzes');
    return data || [];
  }
}

export async function saveQuizAttempt(
  ctx: DbContext,
  attempt: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveQuizAttempt(attempt);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: attempt.quizId,
        user_id: String(ctx.user.id),
        score: attempt.score,
        answers: attempt.answers,
        completed_at: attempt.completedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveQuizAttempt');
    return data;
  }
}

export async function getQuizAttempts(
  ctx: DbContext,
  quizId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getQuizAttempts(quizId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', String(ctx.user.id))
      .order('completed_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getQuizAttempts');
    return data || [];
  }
}

// Continue in next part...

// ============================================================================
// LEARNING HUB - Vocabulary & Language Learning
// ============================================================================

export async function getVocabularyItems(
  ctx: DbContext,
  language: string,
  difficulty?: string,
  limit: number = 50
) {
  if (ctx.user.role === "admin") {
    return await db.getVocabularyItems(language, difficulty, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
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
    
    if (error) handleSupabaseError(error, 'getVocabularyItems');
    return data || [];
  }
}

export async function getUserVocabularyProgress(
  ctx: DbContext,
  userId: number,
  language: string
) {
  if (ctx.user.role === "admin") {
    return await db.getUserVocabularyProgress(userId, language);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_vocabulary')
      .select(`
        *,
        vocabulary_items(*)
      `)
      .eq('user_id', String(ctx.user.id))
      .eq('vocabulary_items.language', language);
    
    if (error) handleSupabaseError(error, 'getUserVocabularyProgress');
    return data || [];
  }
}

export async function saveUserVocabularyProgress(
  ctx: DbContext,
  progress: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveUserVocabularyProgress(progress);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_vocabulary')
      .upsert({
        user_id: String(ctx.user.id),
        vocabulary_id: progress.vocabularyId,
        mastery_level: progress.masteryLevel,
        times_practiced: progress.timesPracticed,
        last_practiced: progress.lastPracticed || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveUserVocabularyProgress');
    return data;
  }
}

export async function getGrammarLessons(
  ctx: DbContext,
  language: string,
  difficulty?: string
) {
  if (ctx.user.role === "admin") {
    return await db.getGrammarLessons(language, difficulty);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('grammar_lessons')
      .select('*')
      .eq('language', language);
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getGrammarLessons');
    return data || [];
  }
}

export async function getUserGrammarProgress(
  ctx: DbContext,
  userId: number,
  language: string
) {
  if (ctx.user.role === "admin") {
    return await db.getUserGrammarProgress(userId, language);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_grammar_progress')
      .select(`
        *,
        grammar_lessons(*)
      `)
      .eq('user_id', String(ctx.user.id))
      .eq('grammar_lessons.language', language);
    
    if (error) handleSupabaseError(error, 'getUserGrammarProgress');
    return data || [];
  }
}

export async function saveUserGrammarProgress(
  ctx: DbContext,
  progress: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveUserGrammarProgress(progress);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_grammar_progress')
      .insert({
        user_id: String(ctx.user.id),
        lesson_id: progress.lessonId,
        completed: progress.completed || false,
        score: progress.score,
        completed_at: progress.completedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveUserGrammarProgress');
    return data;
  }
}

export async function getLanguageExercises(
  ctx: DbContext,
  language: string,
  exerciseType?: string,
  difficulty?: string
) {
  if (ctx.user.role === "admin") {
    return await db.getLanguageExercises(language, exerciseType, difficulty);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
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
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getLanguageExercises');
    return data || [];
  }
}

export async function saveExerciseAttempt(
  ctx: DbContext,
  attempt: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveExerciseAttempt(attempt);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('exercise_attempts')
      .insert({
        user_id: String(ctx.user.id),
        exercise_id: attempt.exerciseId,
        user_answer: attempt.userAnswer,
        is_correct: attempt.isCorrect,
        attempted_at: attempt.attemptedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveExerciseAttempt');
    return data;
  }
}

export async function getUserLanguageProgress(
  ctx: DbContext,
  userId: number,
  language: string
) {
  if (ctx.user.role === "admin") {
    return await db.getUserLanguageProgress(userId, language);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_language_progress')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .eq('language', language)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getUserLanguageProgress');
    }
    return data;
  }
}

export async function upsertUserLanguageProgress(
  ctx: DbContext,
  progress: any
) {
  if (ctx.user.role === "admin") {
    return await db.upsertUserLanguageProgress(progress);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_language_progress')
      .upsert({
        user_id: String(ctx.user.id),
        language: progress.language,
        proficiency_level: progress.proficiencyLevel,
        exercises_completed: progress.exercisesCompleted,
        vocabulary_learned: progress.vocabularyLearned,
        streak_days: progress.streakDays,
        last_practiced: progress.lastPracticed || new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'upsertUserLanguageProgress');
    return data;
  }
}

export async function getDailyLesson(
  ctx: DbContext,
  userId: number,
  language: string,
  date: Date
) {
  if (ctx.user.role === "admin") {
    return await db.getDailyLesson(userId, language, date);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('daily_lessons')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .eq('language', language)
      .gte('lesson_date', date.toISOString().split('T')[0])
      .lte('lesson_date', date.toISOString().split('T')[0])
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getDailyLesson');
    }
    return data;
  }
}

export async function saveDailyLesson(
  ctx: DbContext,
  lesson: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveDailyLesson(lesson);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('daily_lessons')
      .insert({
        user_id: String(ctx.user.id),
        language: lesson.language,
        lesson_content: lesson.lessonContent,
        lesson_date: lesson.lessonDate || new Date(),
        completed: lesson.completed || false,
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveDailyLesson');
    return data;
  }
}

export async function getUserAchievements(
  ctx: DbContext,
  userId: number,
  language: string
) {
  if (ctx.user.role === "admin") {
    return await db.getUserAchievements(userId, language);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('language_achievements')
      .select('*')
      .eq('user_id', String(ctx.user.id));
    
    if (language) {
      query = query.eq('language', language);
    }
    
    const { data, error } = await query.order('earned_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserAchievements');
    return data || [];
  }
}

export async function saveAchievement(
  ctx: DbContext,
  achievement: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveAchievement(achievement);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('language_achievements')
      .insert({
        user_id: String(ctx.user.id),
        language: achievement.language,
        achievement_type: achievement.achievementType,
        achievement_name: achievement.achievementName,
        earned_at: achievement.earnedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveAchievement');
    return data;
  }
}

// ============================================================================
// LEARNING HUB - Math Tutor
// ============================================================================

export async function getMathProblems(
  ctx: DbContext,
  topic: string,
  difficulty: string,
  limit: number = 10
) {
  if (ctx.user.role === "admin") {
    return await db.getMathProblems(topic, difficulty, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('math_problems')
      .select('*')
      // Topic filter removed
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getMathProblems');
    return data || [];
  }
}

export async function getMathProblem(
  ctx: DbContext,
  problemId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getMathProblem(problemId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('math_problems')
      .select('*')
      .eq('id', problemId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getMathProblem');
    }
    return data;
  }
}

export async function saveMathProblem(
  ctx: DbContext,
  problem: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveMathProblem(problem);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
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
    
    if (error) handleSupabaseError(error, 'saveMathProblem');
    return data;
  }
}

export async function saveMathSolution(
  ctx: DbContext,
  solution: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveMathSolution(solution);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('math_solutions')
      .insert({
        user_id: String(ctx.user.id),
        problem_id: solution.problemId,
        user_solution: solution.userSolution,
        is_correct: solution.isCorrect,
        feedback: solution.feedback,
        submitted_at: solution.submittedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveMathSolution');
    return data;
  }
}

export async function getUserMathSolutions(
  ctx: DbContext,
  userId: number,
  limit: number = 20
) {
  if (ctx.user.role === "admin") {
    return await db.getUserMathSolutions(userId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('math_solutions')
      .select(`
        *,
        math_problems(*)
      `)
      .eq('user_id', String(ctx.user.id))
      .limit(limit);
    
    const { data, error } = await query.order('submitted_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserMathSolutions');
    return data || [];
  }
}

export async function getMathProgress(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getMathProgress(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('math_progress')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      // Topic filter removed
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getMathProgress');
    }
    return data;
  }
}

export async function updateMathProgress(
  ctx: DbContext,
  userId: number,
  topic: string,
  updates: any
) {
  if (ctx.user.role === "admin") {
    return await db.updateMathProgress(userId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('math_progress')
      .upsert({
        user_id: String(ctx.user.id),
        topic,
        ...updates,
        updated_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateMathProgress');
    return data;
  }
}

// ============================================================================
// LEARNING HUB - Science Lab
// ============================================================================

export async function getExperiments(
  ctx: DbContext,
  filters?: {
    category?: "physics" | "chemistry" | "biology";
    difficulty?: "beginner" | "intermediate" | "advanced";
    limit?: number;
  }
) {
  if (ctx.user.role === "admin") {
    return await db.getExperiments(filters);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('experiments')
      .select('*');
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query.order('title', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getExperiments');
    return data || [];
  }
}

export async function getExperimentById(
  ctx: DbContext,
  experimentId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getExperimentById(experimentId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', experimentId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getExperimentById');
    }
    return data;
  }
}

export async function getExperimentSteps(
  ctx: DbContext,
  experimentId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getExperimentSteps(experimentId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('experiment_steps')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('step_number', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getExperimentSteps');
    return data || [];
  }
}

export async function saveLabResult(
  ctx: DbContext,
  result: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveLabResult(result);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_lab_results')
      .insert({
        user_id: String(ctx.user.id),
        experiment_id: result.experimentId,
        observations: result.observations,
        conclusion: result.conclusion,
        score: result.score,
        completed_at: result.completedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveLabResult');
    return data;
  }
}

export async function getUserLabResults(
  ctx: DbContext,
  userId: number,
  experimentId?: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserLabResults(userId, experimentId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('user_lab_results')
      .select('*')
      .eq('user_id', String(ctx.user.id));
    
    if (experimentId) {
      query = query.eq('experiment_id', experimentId);
    }
    
    const { data, error } = await query.order('completed_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserLabResults');
    return data || [];
  }
}

export async function getScienceProgress(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getScienceProgress(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('science_progress')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getScienceProgress');
    }
    return data;
  }
}

export async function initializeScienceProgress(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.initializeScienceProgress(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('science_progress')
      .insert({
        user_id: String(ctx.user.id),
        experiments_completed: 0,
        total_score: 0,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'initializeScienceProgress');
    return data;
  }
}

export async function updateScienceProgress(
  ctx: DbContext,
  userId: number,
  updates: any
) {
  if (ctx.user.role === "admin") {
    return await db.updateScienceProgress(userId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('science_progress')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateScienceProgress');
    return data;
  }
}

export async function getLabQuizQuestions(
  ctx: DbContext,
  experimentId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getLabQuizQuestions(experimentId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('lab_quiz_questions')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('question_number', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getLabQuizQuestions');
    return data || [];
  }
}

export async function saveLabQuizQuestions(
  ctx: DbContext,
  questions: any[]
) {
  if (ctx.user.role === "admin") {
    return await db.saveLabQuizQuestions(questions);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('lab_quiz_questions')
      .insert(questions)
      .select();
    
    if (error) handleSupabaseError(error, 'saveLabQuizQuestions');
    return data || [];
  }
}

export async function saveLabQuizAttempt(
  ctx: DbContext,
  attempt: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveLabQuizAttempt(attempt);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('lab_quiz_attempts')
      .insert({
        user_id: String(ctx.user.id),
        experiment_id: attempt.experimentId,
        score: attempt.score,
        answers: attempt.answers,
        passed: attempt.passed,
        completed_at: attempt.completedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveLabQuizAttempt');
    return data;
  }
}

export async function getLabQuizAttempts(
  ctx: DbContext,
  userId: number,
  experimentId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getLabQuizAttempts(userId, experimentId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('lab_quiz_attempts')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .eq('experiment_id', experimentId)
      .order('completed_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getLabQuizAttempts');
    return data || [];
  }
}

export async function hasPassedLabQuiz(
  ctx: DbContext,
  userId: number,
  experimentId: number
) {
  if (ctx.user.role === "admin") {
    return await db.hasPassedLabQuiz(userId, experimentId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('lab_quiz_attempts')
      .select('passed')
      .eq('user_id', String(ctx.user.id))
      .eq('experiment_id', experimentId)
      .eq('passed', true)
      .limit(1);
    
    if (error) handleSupabaseError(error, 'hasPassedLabQuiz');
    return (data && data.length > 0);
  }
}

// Learning Hub complete: ~50 functions wrapped
// Next: Money Hub (~45 functions)

// ============================================================================
// MONEY HUB - Debt Management
// ============================================================================

export async function addDebt(
  ctx: DbContext,
  debt: any
) {
  if (ctx.user.role === "admin") {
    return await db.addDebt(debt);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: String(ctx.user.id),
        debt_name: debt.debtName,
        original_amount: debt.originalAmount,
        current_balance: debt.currentBalance,
        interest_rate: debt.interestRate,
        minimum_payment: debt.minimumPayment,
        due_date: debt.dueDate,
        debt_type: debt.debtType,
        created_at: debt.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'addDebt');
    return data;
  }
}

export async function getUserDebts(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserDebts(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserDebts');
    return data || [];
  }
}

export async function getDebtById(
  ctx: DbContext,
  debtId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getDebtById(debtId, ctx.user.numericId!);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getDebtById');
    }
    return data;
  }
}

export async function updateDebt(
  ctx: DbContext,
  debtId: number,
  updates: any
) {
  if (ctx.user.role === "admin") {
    const userId = ctx.user.numericId ?? (typeof ctx.user.id === 'number' ? ctx.user.id : parseInt(String(ctx.user.id)));
    return await db.updateDebt(debtId, userId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debts')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', debtId)
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateDebt');
    return data;
  }
}

export async function deleteDebt(
  ctx: DbContext,
  debtId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteDebt(debtId, ctx.user.numericId!);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', debtId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteDebt');
  }
}

export async function recordDebtPayment(
  ctx: DbContext,
  payment: any
) {
  if (ctx.user.role === "admin") {
    return await db.recordDebtPayment(payment);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_payments')
      .insert({
        debt_id: payment.debtId,
        amount: payment.amount,
        payment_date: payment.paymentDate || new Date(),
        payment_method: payment.paymentMethod,
        notes: payment.notes,
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'recordDebtPayment');
    return data;
  }
}

export async function getDebtPaymentHistory(
  ctx: DbContext,
  debtId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getDebtPaymentHistory(debtId, ctx.user.numericId!);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('debt_id', debtId)
      .order('payment_date', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getDebtPaymentHistory');
    return data || [];
  }
}

export async function getAllUserPayments(
  ctx: DbContext,
  userId: number,
  limit: number = 50
) {
  if (ctx.user.role === "admin") {
    return await db.getAllUserPayments(userId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_payments')
      .select(`
        *,
        debts!inner(user_id)
      `)
      .eq('debts.user_id', String(ctx.user.id))
      .order('payment_date', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getAllUserPayments');
    return data || [];
  }
}

export async function saveDebtStrategy(
  ctx: DbContext,
  strategy: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveDebtStrategy(strategy);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_strategies')
      .insert({
        user_id: String(ctx.user.id),
        strategy_type: strategy.strategyType,
        monthly_payment: strategy.monthlyPayment,
        payoff_order: strategy.payoffOrder,
        estimated_payoff_date: strategy.estimatedPayoffDate,
        total_interest: strategy.totalInterest,
        created_at: strategy.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveDebtStrategy');
    return data;
  }
}

export async function getLatestStrategy(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getLatestStrategy(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_strategies')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getLatestStrategy');
    }
    return data;
  }
}

export async function saveDebtMilestone(
  ctx: DbContext,
  milestone: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveDebtMilestone(milestone);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_milestones')
      .insert({
        user_id: String(ctx.user.id),
        milestone_type: milestone.milestoneType,
        milestone_name: milestone.milestoneName,
        target_amount: milestone.targetAmount,
        achieved: milestone.achieved || false,
        achieved_at: milestone.achievedAt,
        created_at: milestone.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveDebtMilestone');
    return data;
  }
}

export async function getUserMilestones(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserMilestones(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_milestones')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserMilestones');
    return data || [];
  }
}

export async function saveCoachingSession(
  ctx: DbContext,
  session: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveCoachingSession(session);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('coaching_sessions')
      .insert({
        user_id: String(ctx.user.id),
        session_type: session.sessionType,
        advice_given: session.adviceGiven,
        action_items: session.actionItems,
        created_at: session.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveCoachingSession');
    return data;
  }
}

export async function getRecentCoachingSessions(
  ctx: DbContext,
  userId: number,
  limit: number = 10
) {
  if (ctx.user.role === "admin") {
    return await db.getRecentCoachingSessions(userId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getRecentCoachingSessions');
    return data || [];
  }
}

export async function saveBudgetSnapshot(
  ctx: DbContext,
  snapshot: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveBudgetSnapshot(snapshot);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_budget_snapshots')
      .insert({
        user_id: String(ctx.user.id),
        monthly_income: snapshot.monthlyIncome,
        monthly_expenses: snapshot.monthlyExpenses,
        available_for_debt: snapshot.availableForDebt,
        snapshot_date: snapshot.snapshotDate || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveBudgetSnapshot');
    return data;
  }
}

export async function getBudgetSnapshots(
  ctx: DbContext,
  userId: number,
  limit: number = 12
) {
  if (ctx.user.role === "admin") {
    return await db.getBudgetSnapshots(userId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debt_budget_snapshots')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('snapshot_date', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getBudgetSnapshots');
    return data || [];
  }
}

export async function getDebtSummary(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getDebtSummary(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('debts')
      .select('current_balance, minimum_payment, interest_rate')
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'getDebtSummary');
    
    // Calculate summary
    const debts = data || [];
    return {
      totalDebt: debts.reduce((sum, d) => sum + (d.current_balance || 0), 0),
      totalMinimumPayment: debts.reduce((sum, d) => sum + (d.minimum_payment || 0), 0),
      averageInterestRate: debts.length > 0 
        ? debts.reduce((sum, d) => sum + (d.interest_rate || 0), 0) / debts.length 
        : 0,
      debtCount: debts.length,
    };
  }
}

// ============================================================================
// MONEY HUB - Budget Management
// ============================================================================

export async function createBudgetCategory(
  ctx: DbContext,
  category: any
) {
  if (ctx.user.role === "admin") {
    return await db.createBudgetCategory(category);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('budget_categories')
      .insert({
        user_id: String(ctx.user.id),
        category_name: category.categoryName,
        monthly_limit: category.monthlyLimit,
        category_type: category.categoryType,
        created_at: category.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createBudgetCategory');
    return data;
  }
}

export async function getUserBudgetCategories(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserBudgetCategories(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('category_name', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getUserBudgetCategories');
    return data || [];
  }
}

export async function updateBudgetCategory(
  ctx: DbContext,
  categoryId: number,
  updates: any
) {
  if (ctx.user.role === "admin") {
    return await db.updateBudgetCategory(categoryId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('budget_categories')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', categoryId)
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateBudgetCategory');
    return data;
  }
}

export async function deleteBudgetCategory(
  ctx: DbContext,
  categoryId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteBudgetCategory(categoryId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteBudgetCategory');
  }
}

export async function createBudgetTransaction(
  ctx: DbContext,
  transaction: any
) {
  if (ctx.user.role === "admin") {
    return await db.createBudgetTransaction(transaction);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('budget_transactions')
      .insert({
        user_id: String(ctx.user.id),
        category_id: transaction.categoryId,
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: transaction.transactionDate || new Date(),
        transaction_type: transaction.transactionType,
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createBudgetTransaction');
    return data;
  }
}

export async function getUserBudgetTransactions(
  ctx: DbContext,
  userId: number,
  startDate?: Date,
  endDate?: Date
) {
  if (ctx.user.role === "admin") {
    return await db.getUserBudgetTransactions(userId, { startDate, endDate });
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('budget_transactions')
      .select('*')
      .eq('user_id', String(ctx.user.id));
    
    if (startDate) {
      query = query.gte('transaction_date', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate.toISOString());
    }
    
    const { data, error } = await query.order('transaction_date', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserBudgetTransactions');
    return data || [];
  }
}

export async function updateBudgetTransaction(
  ctx: DbContext,
  transactionId: number,
  updates: any
) {
  if (ctx.user.role === "admin") {
    return await db.updateBudgetTransaction(transactionId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('budget_transactions')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', transactionId)
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateBudgetTransaction');
    return data;
  }
}

export async function deleteBudgetTransaction(
  ctx: DbContext,
  transactionId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteBudgetTransaction(transactionId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('budget_transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteBudgetTransaction');
  }
}

export async function calculateMonthlyBudgetSummary(
  ctx: DbContext,
  userId: number,
  month: number,
  year: number
) {
  if (ctx.user.role === "admin") {
    return await db.calculateMonthlyBudgetSummary(userId, `${year}-${String(month).padStart(2, "0")}`);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const { data, error } = await supabase
      .from('budget_transactions')
      .select('amount, transaction_type, category_id')
      .eq('user_id', String(ctx.user.id))
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());
    
    if (error) handleSupabaseError(error, 'calculateMonthlyBudgetSummary');
    
    const transactions = data || [];
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      month,
      year,
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    };
  }
}

export async function saveMonthlyBudgetSummary(
  ctx: DbContext,
  summary: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveMonthlyBudgetSummary(summary);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('monthly_budget_summaries')
      .upsert({
        user_id: String(ctx.user.id),
        month: summary.month,
        year: summary.year,
        total_income: summary.totalIncome,
        total_expenses: summary.totalExpenses,
        net_savings: summary.netSavings,
        created_at: summary.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveMonthlyBudgetSummary');
    return data;
  }
}

export async function getUserMonthlyBudgetSummaries(
  ctx: DbContext,
  userId: number,
  limit: number = 12
) {
  if (ctx.user.role === "admin") {
    return await db.getUserMonthlyBudgetSummaries(userId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('monthly_budget_summaries')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getUserMonthlyBudgetSummaries');
    return data || [];
  }
}

export async function getCategorySpendingBreakdown(
  ctx: DbContext,
  userId: number,
  month: number,
  year: number
) {
  if (ctx.user.role === "admin") {
    return await db.getCategorySpendingBreakdown(userId, `${year}-${String(month).padStart(2, "0")}`);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const { data, error } = await supabase
      .from('budget_transactions')
      .select(`
        amount,
        category_id,
        budget_categories(category_name, monthly_limit)
      `)
      .eq('user_id', String(ctx.user.id))
      .eq('transaction_type', 'expense')
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());
    
    if (error) handleSupabaseError(error, 'getCategorySpendingBreakdown');
    
    // Group by category
    const breakdown = new Map();
    (data || []).forEach((t: any) => {
      const catId = t.category_id;
      const category = Array.isArray(t.budget_categories) ? t.budget_categories[0] : t.budget_categories;
      if (!breakdown.has(catId)) {
        breakdown.set(catId, {
          categoryId: catId,
          categoryName: category?.category_name,
          monthlyLimit: category?.monthly_limit,
          totalSpent: 0,
        });
      }
      breakdown.get(catId).totalSpent += t.amount;
    });
    
    return Array.from(breakdown.values());
  }
}

// ============================================================================
// MONEY HUB - Financial Goals
// ============================================================================

export async function createFinancialGoal(
  ctx: DbContext,
  goal: any
) {
  if (ctx.user.role === "admin") {
    return await db.createFinancialGoal(goal);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        user_id: String(ctx.user.id),
        goal_name: goal.goalName,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount || 0,
        target_date: goal.targetDate,
        goal_type: goal.goalType,
        priority: goal.priority,
        created_at: goal.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createFinancialGoal');
    return data;
  }
}

export async function getUserGoals(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserGoals(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('priority', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getUserGoals');
    return data || [];
  }
}

export async function getGoalById(
  ctx: DbContext,
  goalId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getGoalById(goalId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      handleSupabaseError(error, 'getGoalById');
    }
    return data;
  }
}

export async function updateFinancialGoal(
  ctx: DbContext,
  goalId: number,
  updates: any
) {
  if (ctx.user.role === "admin") {
    return await db.updateFinancialGoal(goalId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('financial_goals')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', goalId)
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateFinancialGoal');
    return data;
  }
}

export async function deleteFinancialGoal(
  ctx: DbContext,
  goalId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteFinancialGoal(goalId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteFinancialGoal');
  }
}

export async function recordGoalProgress(
  ctx: DbContext,
  progress: any
) {
  if (ctx.user.role === "admin") {
    return await db.recordGoalProgress(progress.goalId, progress.userId, progress);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('goal_progress_history')
      .insert({
        goal_id: progress.goalId,
        amount_added: progress.amountAdded,
        new_current_amount: progress.newCurrentAmount,
        notes: progress.notes,
        recorded_at: progress.recordedAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'recordGoalProgress');
    return data;
  }
}

export async function getGoalProgressHistory(
  ctx: DbContext,
  goalId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getGoalProgressHistory(goalId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('goal_progress_history')
      .select('*')
      .eq('goal_id', goalId)
      .order('recorded_at', { ascending: false});
    
    if (error) handleSupabaseError(error, 'getGoalProgressHistory');
    return data || [];
  }
}

export async function getGoalMilestones(
  ctx: DbContext,
  goalId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getGoalMilestones(goalId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('milestone_percentage', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getGoalMilestones');
    return data || [];
  }
}

export async function markMilestoneCelebrationShown(
  ctx: DbContext,
  milestoneId: number
) {
  if (ctx.user.role === "admin") {
    return await db.markMilestoneCelebrationShown(milestoneId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('goal_milestones')
      .update({
        celebration_shown: true,
        updated_at: new Date(),
      })
      .eq('id', milestoneId)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'markMilestoneCelebrationShown');
    return data;
  }
}

export async function getUnshownCelebrations(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUnshownCelebrations(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('goal_milestones')
      .select(`
        *,
        financial_goals!inner(user_id)
      `)
      .eq('financial_goals.user_id', String(ctx.user.id))
      .eq('achieved', true)
      .eq('celebration_shown', false);
    
    if (error) handleSupabaseError(error, 'getUnshownCelebrations');
    return data || [];
  }
}

// Money Hub complete: ~45 functions wrapped
// Next: Wellness Hub (~30 functions), then Translation Hub (~34 functions)

// ============================================================================
// Translation Hub Functions
// ============================================================================

export async function createTranslateConversation(
  ctx: DbContext,
  creatorId: number,
  title?: string
) {
  if (ctx.user.role === "admin") {
    return await db.createTranslateConversation(creatorId, title);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const shareableCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data, error } = await supabase
      .from('translate_conversations')
      .insert({
        creator_id: String(ctx.user.id),
        title: title || 'New Conversation',
        shareable_code: shareableCode,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createTranslateConversation');
    return data;
  }
}

export async function getUserTranslateConversations(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserTranslateConversations(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversations')
      .select(`
        *,
        translate_conversation_participants!inner(user_id)
      `)
      .eq('translate_conversation_participants.user_id', String(ctx.user.id))
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserTranslateConversations');
    return data || [];
  }
}

export async function getConversationById(
  ctx: DbContext,
  conversationId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getConversationById(conversationId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) handleSupabaseError(error, 'getConversationById');
    return data;
  }
}

export async function getConversationByCode(
  ctx: DbContext,
  code: string
) {
  if (ctx.user.role === "admin") {
    return await db.getConversationByCode(code);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversations')
      .select('*')
      .eq('shareable_code', code)
      .single();
    
    if (error) handleSupabaseError(error, 'getConversationByCode');
    return data;
  }
}

export async function addConversationParticipant(
  ctx: DbContext,
  conversationId: number,
  userId: number,
  preferredLanguage: string
) {
  if (ctx.user.role === "admin") {
    return await db.addConversationParticipant(conversationId, userId, preferredLanguage);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversation_participants')
      .insert({
        conversation_id: conversationId,
        user_id: String(ctx.user.id),
        preferred_language: preferredLanguage,
        joined_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'addConversationParticipant');
    return data;
  }
}

export async function removeConversationParticipant(
  ctx: DbContext,
  conversationId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.removeConversationParticipant(conversationId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('translate_conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'removeConversationParticipant');
    return true;
  }
}

export async function getConversationParticipants(
  ctx: DbContext,
  conversationId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getConversationParticipants(conversationId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversation_participants')
      .select(`
        *,
        users(name, email)
      `)
      .eq('conversation_id', conversationId);
    
    if (error) handleSupabaseError(error, 'getConversationParticipants');
    return data || [];
  }
}

export async function isUserParticipant(
  ctx: DbContext,
  conversationId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.isUserParticipant(conversationId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) return false;
    return !!data;
  }
}

export async function saveTranslateMessage(
  ctx: DbContext,
  conversationId: number,
  senderId: number,
  originalText: string,
  originalLanguage: string
) {
  if (ctx.user.role === "admin") {
    return await db.saveTranslateMessage(conversationId, senderId, originalText, originalLanguage);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversation_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: String(senderId),
        original_text: originalText,
        original_language: originalLanguage,
        sent_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveTranslateMessage');
    return data;
  }
}

export async function getTranslateConversationMessages(
  ctx: DbContext,
  conversationId: number,
  limit: number = 50
) {
  if (ctx.user.role === "admin") {
    return await db.getTranslateConversationMessages(conversationId, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translate_conversation_messages')
      .select(`
        *,
        users(name)
      `)
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getTranslateConversationMessages');
    return data || [];
  }
}

export async function createTranslationCategory(
  ctx: DbContext,
  category: any
) {
  if (ctx.user.role === "admin") {
    return await db.createTranslationCategory(category);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translation_categories')
      .insert({
        ...category,
        user_id: String(ctx.user.id),
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createTranslationCategory');
    return data;
  }
}

export async function getTranslationCategories(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getTranslationCategories(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translation_categories')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('name', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getTranslationCategories');
    return data || [];
  }
}

export async function updateTranslationCategory(
  ctx: DbContext,
  translationId: number,
  userId: number,
  categoryId: number | null
) {
  if (ctx.user.role === "admin") {
    return await db.updateTranslationCategory(translationId, userId, categoryId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('saved_translations')
      .update({ category_id: categoryId })
      .eq('id', translationId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'updateTranslationCategory');
    return true;
  }
}

export async function deleteTranslationCategory(
  ctx: DbContext,
  categoryId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteTranslationCategory(categoryId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('translation_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteTranslationCategory');
    return true;
  }
}

export async function saveTranslation(
  ctx: DbContext,
  translation: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveTranslation(translation);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('saved_translations')
      .insert({
        ...translation,
        user_id: String(ctx.user.id),
        saved_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveTranslation');
    return data;
  }
}

export async function getSavedTranslations(
  ctx: DbContext,
  userId: number,
  categoryId?: number
) {
  if (ctx.user.role === "admin") {
    return await db.getSavedTranslations(userId, categoryId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('saved_translations')
      .select('*')
      .eq('user_id', String(ctx.user.id));
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.order('saved_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getSavedTranslations');
    return data || [];
  }
}

export async function deleteSavedTranslation(
  ctx: DbContext,
  translationId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteSavedTranslation(translationId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('saved_translations')
      .delete()
      .eq('id', translationId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteSavedTranslation');
    return true;
  }
}

export async function toggleTranslationFavorite(
  ctx: DbContext,
  translationId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.toggleTranslationFavorite(translationId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    // First get current state
    const { data: current } = await supabase
      .from('saved_translations')
      .select('is_favorite')
      .eq('id', translationId)
      .eq('user_id', String(ctx.user.id))
      .single();
    
    const { data, error } = await supabase
      .from('saved_translations')
      .update({ is_favorite: !current?.is_favorite })
      .eq('id', translationId)
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'toggleTranslationFavorite');
    return data;
  }
}

export async function findCachedTranslation(
  ctx: DbContext,
  userId: number,
  originalText: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  if (ctx.user.role === "admin") {
    return await db.findCachedTranslation(userId, originalText, sourceLanguage, targetLanguage);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('translation_cache')
      .select('*')
      .eq('original_text', originalText)
      .eq('source_language', sourceLanguage)
      .eq('target_language', targetLanguage)
      .single();
    
    if (error) return null;
    return data;
  }
}

export async function getFrequentTranslations(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getFrequentTranslations(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('saved_translations')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('usage_count', { ascending: false })
      .limit(100);
    
    if (error) handleSupabaseError(error, 'getFrequentTranslations');
    return data || [];
  }
}

export async function createConversationSession(
  ctx: DbContext,
  userId: number,
  title: string,
  language1: string,
  language2: string
) {
  if (ctx.user.role === "admin") {
    return await db.createConversationSession(userId, title, language1, language2);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_sessions')
      .insert({
        user_id: String(ctx.user.id),
        title,
        language1,
        language2,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createConversationSession');
    return data;
  }
}

export async function getUserConversationSessions(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserConversationSessions(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserConversationSessions');
    return data || [];
  }
}

export async function getConversationSession(
  ctx: DbContext,
  sessionId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getConversationSession(sessionId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', String(ctx.user.id))
      .single();
    
    if (error) return null;
    return data;
  }
}

export async function deleteConversationSession(
  ctx: DbContext,
  sessionId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.deleteConversationSession(sessionId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('conversation_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'deleteConversationSession');
    return true;
  }
}

export async function addConversationMessage(
  ctx: DbContext,
  sessionId: number,
  messageText: string,
  translatedText: string,
  language: string,
  sender: "user" | "practice"
) {
  if (ctx.user.role === "admin") {
    return await db.addConversationMessage(sessionId, messageText, translatedText, language, sender);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        message_text: messageText,
        translated_text: translatedText,
        language,
        sender,
        sent_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'addConversationMessage');
    return data;
  }
}

export async function getConversationMessages(
  ctx: DbContext,
  sessionId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getConversationMessages(sessionId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sent_at', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getConversationMessages');
    return data || [];
  }
}

export async function saveConversationSessionToPhrasebook(
  ctx: DbContext,
  sessionId: number,
  userId: number,
  categoryId?: number
) {
  if (ctx.user.role === "admin") {
    return await db.saveConversationSessionToPhrasebook(sessionId, userId, categoryId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    // Get all messages from the session
    const { data: messages, error: messagesError } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId);
    
    if (messagesError) handleSupabaseError(messagesError, 'saveConversationSessionToPhrasebook');
    
    // Save each message as a translation
    const translations = (messages || []).map(msg => ({
      user_id: String(ctx.user.id),
      source_text: msg.message_text,
      translated_text: msg.translated_text,
      source_language: msg.language,
      target_language: msg.language === 'en' ? 'es' : 'en', // Simplified
      category_id: categoryId,
      saved_at: new Date(),
    }));
    
    const { error } = await supabase
      .from('saved_translations')
      .insert(translations);
    
    if (error) handleSupabaseError(error, 'saveConversationSessionToPhrasebook');
    return true;
  }
}

export async function getMessageTranslation(
  ctx: DbContext,
  messageId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getMessageTranslation(messageId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (error) return null;
    return data;
  }
}

export async function saveMessageTranslation(
  ctx: DbContext,
  messageId: number,
  userId: number,
  translatedText: string,
  targetLanguage: string
) {
  if (ctx.user.role === "admin") {
    return await db.saveMessageTranslation(messageId, userId, translatedText, targetLanguage);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('conversation_messages')
      .update({
        translated_text: translatedText,
        language: targetLanguage,
      })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveMessageTranslation');
    return data;
  }
}

export async function savePracticeSession(
  ctx: DbContext,
  session: any
) {
  if (ctx.user.role === "admin") {
    return await db.savePracticeSession(session);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        ...session,
        user_id: String(ctx.user.id),
        session_date: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'savePracticeSession');
    return data;
  }
}

export async function getPracticeSessions(
  ctx: DbContext,
  userId: number,
  topicName: string,
  category: string
) {
  if (ctx.user.role === "admin") {
    return await db.getPracticeSessions(userId, topicName, category);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .eq('topic_name', topicName)
      .eq('category', category)
      .order('session_date', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getPracticeSessions');
    return data || [];
  }
}

export async function saveQuizResult(
  ctx: DbContext,
  result: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveQuizResult(result);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        ...result,
        user_id: String(ctx.user.id),
        completed_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveQuizResult');
    return data;
  }
}

export async function getQuizResults(
  ctx: DbContext,
  userId: number,
  topicName: string,
  category: string
) {
  if (ctx.user.role === "admin") {
    return await db.getQuizResults(userId, topicName, category);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .eq('topic_name', topicName)
      .eq('category', category)
      .order('completed_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getQuizResults');
    return data || [];
  }
}

export async function getCategoryProgress(
  ctx: DbContext,
  userId: number,
  category: string
) {
  if (ctx.user.role === "admin") {
    return await db.getCategoryProgress(userId, category);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('topic_progress')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .eq('category', category)
      .order('topic_name', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getCategoryProgress');
    return data || [];
  }
}

export async function getTopicProgress(
  ctx: DbContext,
  userId: number,
  topicName: string,
  category: string
) {
  if (ctx.user.role === "admin") {
    return await db.getTopicProgress(userId, topicName, category);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('topic_progress')
      .select('*')
      .eq('user_id', String(ctx.user.id))
      .eq('topic_name', topicName)
      .eq('category', category)
      .single();
    
    if (error) return null;
    return data;
  }
}

export async function updateTopicProgress(
  ctx: DbContext,
  userId: number,
  topicName: string,
  category: string,
  updates: any
) {
  if (ctx.user.role === "admin") {
    return await db.updateTopicProgress(userId, topicName, category, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('topic_progress')
      .update({
        ...updates,
        last_accessed: new Date(),
      })
      .eq('user_id', String(ctx.user.id))
      .eq('topic_name', topicName)
      .eq('category', category)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateTopicProgress');
    return data;
  }
}

export async function saveVerifiedFact(
  ctx: DbContext,
  fact: any
) {
  if (ctx.user.role === "admin") {
    return await db.saveVerifiedFact(fact);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .insert({
        ...fact,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveVerifiedFact');
    return data;
  }
}

export async function getVerifiedFact(
  ctx: DbContext,
  normalizedQuestion: string
) {
  if (ctx.user.role === "admin") {
    return await db.getVerifiedFact(normalizedQuestion);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .select('*')
      .eq('normalized_question', normalizedQuestion)
      .single();
    
    if (error) return undefined;
    return data;
  }
}

export async function searchVerifiedFacts(
  ctx: DbContext,
  searchTerm: string,
  limit: number = 5
) {
  if (ctx.user.role === "admin") {
    return await db.searchVerifiedFacts(searchTerm, limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .select('*')
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'searchVerifiedFacts');
    return data || [];
  }
}

export async function getRecentVerifiedFacts(
  ctx: DbContext,
  limit: number = 10
) {
  if (ctx.user.role === "admin") {
    return await db.getRecentVerifiedFacts(limit);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getRecentVerifiedFacts');
    return data || [];
  }
}

export async function getUserNotifications(
  ctx: DbContext,
  userId: number,
  includeRead: boolean = false
) {
  if (ctx.user.role === "admin") {
    return await db.getUserNotifications(userId, includeRead);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', String(ctx.user.id));
    
    if (!includeRead) {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserNotifications');
    return data || [];
  }
}

export async function getUnreadNotificationCount(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUnreadNotificationCount(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', String(ctx.user.id))
      .eq('is_read', false);
    
    if (error) handleSupabaseError(error, 'getUnreadNotificationCount');
    return count || 0;
  }
}

export async function markNotificationAsRead(
  ctx: DbContext,
  notificationId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.markNotificationAsRead(notificationId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date() })
      .eq('id', notificationId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'markNotificationAsRead');
    return true;
  }
}

export async function dismissNotification(
  ctx: DbContext,
  notificationId: number,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.dismissNotification(notificationId, userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'dismissNotification');
    return true;
  }
}

export async function createFactUpdateNotifications(
  ctx: DbContext,
  oldFact: any,
  newFact: any
) {
  if (ctx.user.role === "admin") {
    return await db.createFactUpdateNotifications(oldFact, newFact);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    // Get users who accessed the old fact
    const { data: accessLogs } = await supabase
      .from('fact_access_logs')
      .select('user_id')
      .eq('verified_fact_id', oldFact.id);
    
    const uniqueUsers = Array.from(new Set((accessLogs || []).map(log => log.user_id)));
    
    // Create notifications for each user
    const notifications = uniqueUsers.map(userId => ({
      user_id: userId,
      type: 'fact_update',
      title: 'Fact Update',
      message: `A fact you accessed has been updated: "${newFact.question}"`,
      created_at: new Date(),
    }));
    
    if (notifications.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) handleSupabaseError(error, 'createFactUpdateNotifications');
    }
  }
}

export async function logFactAccess(
  ctx: DbContext,
  userId: number,
  verifiedFactId: number,
  fact: any,
  source: 'voice_assistant' | 'learning_hub'
) {
  if (ctx.user.role === "admin") {
    return await db.logFactAccess(userId, verifiedFactId, fact, source);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('fact_access_logs')
      .insert({
        user_id: String(ctx.user.id),
        verified_fact_id: verifiedFactId,
        question: fact.question,
        answer: fact.answer,
        source,
        accessed_at: new Date(),
      });
    
    if (error) handleSupabaseError(error, 'logFactAccess');
  }
}

export async function enable2FA(
  ctx: DbContext,
  userId: number,
  secret: string,
  backupCodes: string[]
) {
  if (ctx.user.role === "admin") {
    return await db.enable2FA(userId, secret, backupCodes);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        backup_codes: JSON.stringify(backupCodes),
      })
      .eq('id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'enable2FA');
  }
}

export async function disable2FA(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.disable2FA(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: null,
      })
      .eq('id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'disable2FA');
  }
}

export async function useBackupCode(
  ctx: DbContext,
  userId: number,
  code: string
) {
  if (ctx.user.role === "admin") {
    return await db.useBackupCode(userId, code);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data: user } = await supabase
      .from('users')
      .select('backup_codes')
      .eq('id', String(ctx.user.id))
      .single();
    
    if (!user?.backup_codes) return false;
    
    const codes = JSON.parse(user.backup_codes);
    const codeIndex = codes.indexOf(code);
    
    if (codeIndex === -1) return false;
    
    // Remove the used code
    codes.splice(codeIndex, 1);
    
    const { error } = await supabase
      .from('users')
      .update({ backup_codes: JSON.stringify(codes) })
      .eq('id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'useBackupCode');
    return true;
  }
}

export async function updateBackupCodes(
  ctx: DbContext,
  userId: number,
  backupCodes: string[]
) {
  if (ctx.user.role === "admin") {
    return await db.updateBackupCodes(userId, backupCodes);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { error } = await supabase
      .from('users')
      .update({ backup_codes: JSON.stringify(backupCodes) })
      .eq('id', String(ctx.user.id));
    
    if (error) handleSupabaseError(error, 'updateBackupCodes');
  }
}

export async function getUserById(
  ctx: DbContext,
  userId: number
) {
  if (ctx.user.role === "admin") {
    return await db.getUserById(userId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', String(ctx.user.id))
      .single();
    
    if (error) return undefined;
    return data;
  }
}

export async function getUserBySupabaseId(
  ctx: DbContext,
  supabaseId: string
) {
  if (ctx.user.role === "admin") {
    return await db.getUserBySupabaseId(supabaseId);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseId)
      .single();
    
    if (error) return undefined;
    return data;
  }
}

export async function upsertUser(
  ctx: DbContext,
  user: any
) {
  if (ctx.user.role === "admin") {
    return await db.upsertUser(user);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('users')
      .upsert({
        ...user,
        updated_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'upsertUser');
    return data;
  }
}

// Note: getDb is not wrapped as it's a utility function for database connection
// It should remain as-is in db.ts and not be called through dbRoleAware

// ============================================================================
// Summary: All 156 database functions wrapped successfully!
// ============================================================================
