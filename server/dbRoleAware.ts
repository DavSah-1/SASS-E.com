/**
 * Role-Aware Database Operations
 * 
 * This module provides wrapper functions that automatically route database operations
 * based on user role:
 * - Admin users → Manus MySQL (existing db.ts functions)
 * - Regular users → Supabase PostgreSQL (with RLS enforcement)
 * 
 * All functions accept a context parameter containing user role and access token.
 */

import { getSupabaseClient } from "./supabaseClient";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export interface DbContext {
  user: {
    id: string | number;
    numericId: number;
    role: "admin" | "user";
  };
  accessToken?: string;
}

/**
 * Helper to convert Supabase errors to TRPC errors
 */
function handleSupabaseError(error: any, operation: string): never {
  console.error(`[Supabase] ${operation} failed:`, error);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message || `Database operation failed: ${operation}`
  });
}

// ============================================================================
// CONVERSATIONS
// ============================================================================

export async function saveConversation(
  ctx: DbContext,
  conversation: { userId: number; userMessage: string; assistantResponse: string }
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
      .order('created_at', { ascending: false })
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
// IOT DEVICES
// ============================================================================

export async function addIoTDevice(
  ctx: DbContext,
  device: { userId: number; deviceId: string; deviceName: string; deviceType: "light" | "thermostat" | "plug" | "switch" | "sensor" | "lock" | "camera" | "speaker" | "other"; connectionType: "mqtt" | "http" | "websocket" | "local"; manufacturer?: string | null; model?: string | null; status?: "online" | "offline" | "error"; state?: string | null; capabilities?: string | null; connectionConfig?: string | null }
) {
  if (ctx.user.role === "admin") {
    return await db.addIoTDevice(device);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_devices')
      .insert({
        user_id: String(ctx.user.id),
        device_id: device.deviceId,
        device_name: device.deviceName,
        device_type: device.deviceType,
        connection_type: device.connectionType,
        manufacturer: device.manufacturer || null,
        model: device.model || null,
        status: device.status || 'offline',
        state: device.state || null,
        capabilities: device.capabilities || null,
        connection_config: device.connectionConfig || null,
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
      .order('created_at', { ascending: false });
    
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
      .eq('device_id', deviceId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
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
        state,
        status,
        last_seen: new Date().toISOString(),
      })
      .eq('device_id', deviceId)
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
      .eq('device_id', deviceId);
    
    if (error) handleSupabaseError(error, 'deleteIoTDevice');
  }
}

export async function saveIoTCommand(
  ctx: DbContext,
  command: { userId: number; deviceId: string; command: string; parameters?: string | null; status: "success" | "failed" | "pending"; errorMessage?: string | null; executedAt?: Date }
) {
  if (ctx.user.role === "admin") {
    return await db.saveIoTCommand(command);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('iot_command_history')
      .insert({
        user_id: String(ctx.user.id),
        device_id: command.deviceId,
        command: command.command,
        parameters: command.parameters || null,
        status: command.status,
        error_message: command.errorMessage || null,
        executed_at: command.executedAt?.toISOString() || new Date().toISOString(),
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
      .eq('device_id', deviceId)
      .order('executed_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getDeviceCommandHistory');
    return data || [];
  }
}

// ============================================================================
// USER PROFILE
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
      if (error.code === 'PGRST116') return undefined; // Not found
      handleSupabaseError(error, 'getUserProfile');
    }
    return data;
  }
}

export async function createUserProfile(
  ctx: DbContext,
  profile: {
    userId: number;
    sarcasmLevel: number;
    totalInteractions: number;
    positiveResponses: number;
    negativeResponses: number;
    averageResponseLength: number;
    preferredTopics: string;
    interactionPatterns: string;
  }
) {
  if (ctx.user.role === "admin") {
    return await db.createUserProfile(profile);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: String(ctx.user.id),
        sarcasm_level: profile.sarcasmLevel,
        total_interactions: profile.totalInteractions,
        positive_responses: profile.positiveResponses,
        negative_responses: profile.negativeResponses,
        average_response_length: profile.averageResponseLength,
        preferred_topics: profile.preferredTopics,
        interaction_patterns: profile.interactionPatterns,
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
  updates: Partial<{
    sarcasmLevel: number;
    totalInteractions: number;
    positiveResponses: number;
    negativeResponses: number;
    averageResponseLength: number;
    preferredTopics: string;
    interactionPatterns: string;
    lastInteraction: Date;
  }>
) {
  if (ctx.user.role === "admin") {
    return await db.updateUserProfile(userId, updates);
  } else {
    const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
    
    // Convert camelCase to snake_case for Supabase
    const supabaseUpdates: any = {};
    if (updates.sarcasmLevel !== undefined) supabaseUpdates.sarcasm_level = updates.sarcasmLevel;
    if (updates.totalInteractions !== undefined) supabaseUpdates.total_interactions = updates.totalInteractions;
    if (updates.positiveResponses !== undefined) supabaseUpdates.positive_responses = updates.positiveResponses;
    if (updates.negativeResponses !== undefined) supabaseUpdates.negative_responses = updates.negativeResponses;
    if (updates.averageResponseLength !== undefined) supabaseUpdates.average_response_length = updates.averageResponseLength;
    if (updates.preferredTopics !== undefined) supabaseUpdates.preferred_topics = updates.preferredTopics;
    if (updates.interactionPatterns !== undefined) supabaseUpdates.interaction_patterns = updates.interactionPatterns;
    if (updates.lastInteraction !== undefined) supabaseUpdates.last_interaction = updates.lastInteraction.toISOString();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(supabaseUpdates)
      .eq('user_id', String(ctx.user.id))
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateUserProfile');
    return data;
  }
}

// ============================================================================
// CONVERSATION FEEDBACK
// ============================================================================

export async function saveConversationFeedback(
  ctx: DbContext,
  feedback: { conversationId: number; userId: number; feedbackType: "like" | "dislike" | "too_sarcastic" | "not_sarcastic_enough" | "helpful" | "unhelpful"; comment?: string | null }
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
        feedback_type: feedback.feedbackType,
        comment: feedback.comment || null,
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
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      handleSupabaseError(error, 'getConversationFeedback');
    }
    return data;
  }
}

// NOTE: This file will be continued in parts due to size.
// The remaining 140+ functions will follow the same pattern.
// Each function checks role and routes to appropriate database.
