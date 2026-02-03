import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getSupabaseClient, getSupabaseAdminClient } from "./supabaseClient";
import { TRPCError } from "@trpc/server";

/**
 * Example Router: RLS-Enforced Supabase Queries
 * 
 * This router demonstrates how to use RLS-enforced Supabase clients
 * for user-scoped data operations.
 * 
 * KEY PRINCIPLES:
 * 1. Use `getSupabaseClient(ctx.user.id, ctx.accessToken)` for user data
 * 2. Use `getSupabaseAdminClient()` ONLY for admin operations
 * 3. RLS automatically filters data by user_id
 * 4. No need to manually add WHERE user_id = ... clauses
 */

export const exampleSupabaseRouter = router({
  /**
   * Example: Get user's conversations (RLS-enforced)
   * 
   * This query automatically returns only the current user's conversations
   * because RLS policies filter by auth.uid()
   */
  getMyConversations: protectedProcedure
    .query(async ({ ctx }) => {
      // Get RLS-enforced client for current user
      const supabase = await getSupabaseClient(
        String(ctx.user.id), 
        ctx.accessToken
      );

      // Query conversations - RLS automatically filters by user_id
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),

  /**
   * Example: Create a conversation (RLS-enforced)
   * 
   * RLS policies ensure the user_id is set correctly
   */
  createConversation: protectedProcedure
    .input(z.object({
      userMessage: z.string(),
      assistantResponse: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await getSupabaseClient(
        String(ctx.user.id),
        ctx.accessToken
      );

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: ctx.user.id,
          user_message: input.userMessage,
          assistant_response: input.assistantResponse,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),

  /**
   * Example: Update a conversation (RLS-enforced)
   * 
   * User can only update their own conversations due to RLS
   */
  updateConversation: protectedProcedure
    .input(z.object({
      id: z.number(),
      userMessage: z.string().optional(),
      assistantResponse: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await getSupabaseClient(
        String(ctx.user.id),
        ctx.accessToken
      );

      const { id, ...updateData } = input;

      const { data, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id)
        // No need to add .eq('user_id', ctx.user.id) - RLS handles this!
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found or you do not have permission to update it'
        });
      }

      return data;
    }),

  /**
   * Example: Delete a conversation (RLS-enforced)
   * 
   * User can only delete their own conversations due to RLS
   */
  deleteConversation: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabase = await getSupabaseClient(
        String(ctx.user.id),
        ctx.accessToken
      );

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', input.id);
        // No need to add .eq('user_id', ctx.user.id) - RLS handles this!

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return { success: true };
    }),

  /**
   * ADMIN EXAMPLE: Get all conversations (bypasses RLS)
   * 
   * This should ONLY be used for admin operations
   * Regular users should NEVER have access to this
   */
  adminGetAllConversations: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required'
        });
      }

      // Use admin client (bypasses RLS)
      const supabase = getSupabaseAdminClient();

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),

  /**
   * Example: Query with joins (RLS-enforced)
   * 
   * RLS applies to all tables in the query
   */
  getConversationsWithUserInfo: protectedProcedure
    .query(async ({ ctx }) => {
      const supabase = await getSupabaseClient(
        String(ctx.user.id),
        ctx.accessToken
      );

      // This query will only return conversations owned by the current user
      // Even though we're joining with users table, RLS ensures data isolation
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          users:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),
});

/**
 * MIGRATION GUIDE
 * 
 * To migrate existing procedures to use RLS-enforced Supabase clients:
 * 
 * 1. Replace database imports:
 *    OLD: import { getSupabaseDb } from "./supabaseDb";
 *    NEW: import { getSupabaseClient } from "./supabaseClient";
 * 
 * 2. Replace database calls:
 *    OLD: const db = await getSupabaseDb();
 *    NEW: const supabase = await getSupabaseClient(String(ctx.user.id), ctx.accessToken);
 * 
 * 3. Replace Drizzle queries with Supabase queries:
 *    OLD: await db.select().from(conversations).where(eq(conversations.user_id, userId))
 *    NEW: await supabase.from('conversations').select('*')
 *    (Note: No WHERE clause needed - RLS handles it!)
 * 
 * 4. Handle errors:
 *    Supabase returns { data, error } instead of throwing
 *    Always check for errors and throw TRPCError
 * 
 * 5. For admin operations:
 *    Use getSupabaseAdminClient() instead
 *    Add explicit role checks in your procedure
 */
