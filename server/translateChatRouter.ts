import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { eq } from "drizzle-orm";
// Migrated to use ctx.translationDb adapter
import { translateConversations } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";

export const translateChatRouter = router({
  /**
   * Create a new conversation and return shareable link
   */
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { conversationId, shareableCode } = await ctx.translationDb.createTranslateConversation( 
        String(ctx.user.id),
        input.title || 'Untitled Conversation'
      );

      // Add creator as first participant
      await ctx.translationDb.addConversationParticipant( 
        conversationId,
        String(ctx.user.id),
        ctx.user.preferredLanguage || 'en'
      );

      const baseUrl = process.env.VITE_APP_URL || 'http://localhost:3000';
      const shareableLink = `${baseUrl}/translate-chat/${shareableCode}`;

      return {
        conversationId,
        shareableCode,
        shareableLink,
      };
    }),

  /**
   * Join a conversation via shareable code
   */
  joinConversation: protectedProcedure
    .input(
      z.object({
        shareableCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.translationDb.getConversationByCode( input.shareableCode);

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Check if conversation is active (handle both INTEGER 1/0 and BOOLEAN true/false)
      const isActive = conversation.isActive === 1 || conversation.isActive === true || conversation.isActive === '1';
      if (!isActive) {
        throw new Error("This conversation is no longer active");
      }

      if (conversation.expiresAt && new Date(conversation.expiresAt) < new Date()) {
        throw new Error("This conversation has expired");
      }

      // Add user as participant
      await ctx.translationDb.addConversationParticipant( 
        conversation.id,
        String(ctx.user.id),
        ctx.user.preferredLanguage || 'en'
      );

      return {
        conversationId: conversation.id,
        title: conversation.title,
      };
    }),

  /**
   * Get conversation details
   */
  getConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.number().optional(),
        shareableCode: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let conversation;

      if (input.conversationId) {
        conversation = await ctx.translationDb.getConversationById( input.conversationId);
      } else if (input.shareableCode) {
        conversation = await ctx.translationDb.getConversationByCode( input.shareableCode);
      } else {
        throw new Error("Either conversationId or shareableCode is required");
      }

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Check if user is participant
      const isParticipant = await ctx.translationDb.isUserParticipant( conversation.id, String(ctx.user.id));
      if (!isParticipant) {
        throw new Error("You are not a participant in this conversation");
      }

      // Get participants
      const participants = await ctx.translationDb.getConversationParticipants( conversation.id);

      // Get user details for each participant
      const participantsWithDetails = await Promise.all(
        participants.map(async (p) => {
          const user = await ctx.translationDb.getUserById( p.userId);
          return {
            userId: p.userId,
            preferredLanguage: p.preferredLanguage,
            joinedAt: p.joinedAt,
            name: user?.name || 'Unknown User',
          };
        })
      );

      return {
        conversation,
        participants: participantsWithDetails,
      };
    }),

  /**
   * Send a message in a conversation
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is participant
      const isParticipant = await ctx.translationDb.isUserParticipant( input.conversationId, String(ctx.user.id));
      if (!isParticipant) {
        throw new Error("You are not a participant in this conversation");
      }

      const originalLanguage = ctx.user.preferredLanguage || 'en';

      // Save original message
      const messageId = await ctx.translationDb.saveTranslateMessage( 
        input.conversationId,
        String(ctx.user.id),
        input.text,
        originalLanguage
      );

      // Get all participants
      const participants = await ctx.translationDb.getConversationParticipants( input.conversationId);

      // Translate for each participant (except sender)
      for (const participant of participants) {
        if (participant.userId === String(ctx.user.id)) {
          // Save original for sender
          await ctx.translationDb.saveMessageTranslation( 
            messageId,
            participant.userId,
            input.text,
            originalLanguage
          );
          continue;
        }

        // Translate to participant's language
        if (participant.preferredLanguage !== originalLanguage) {
          try {
            const translationResponse = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `You are a professional translator. Translate the following text from ${originalLanguage} to ${participant.preferredLanguage}. Only return the translated text, nothing else.`,
                },
                {
                  role: "user",
                  content: input.text,
                },
              ],
            });

            const messageContent = translationResponse.choices[0]?.message?.content;
            const translatedText = typeof messageContent === 'string' ? messageContent : input.text;

            await ctx.translationDb.saveMessageTranslation( 
              messageId,
              participant.userId,
              translatedText,
              participant.preferredLanguage
            );
          } catch (error) {
            console.error("Translation error:", error);
            // Fallback: save original text
            await ctx.translationDb.saveMessageTranslation( 
              messageId,
              participant.userId,
              input.text,
              originalLanguage
            );
          }
        } else {
          // Same language, save original
          await ctx.translationDb.saveMessageTranslation( 
            messageId,
            participant.userId,
            input.text,
            originalLanguage
          );
        }
      }

      return { messageId };
    }),

  /**
   * Get messages for a conversation (with translations for current user)
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is participant
      const isParticipant = await ctx.translationDb.isUserParticipant( input.conversationId, String(ctx.user.id));
      if (!isParticipant) {
        throw new Error("You are not a participant in this conversation");
      }

      // Get messages
      const messages = await ctx.translationDb.getTranslateConversationMessages( input.conversationId, input.limit);

      // Get translations for current user
      const messagesWithTranslations = await Promise.all(
        messages.map(async (msg) => {
          const translation = await ctx.translationDb.getMessageTranslation( msg.id, String(ctx.user.id));

          return {
            id: msg.id,
            senderId: msg.senderId,
            originalText: msg.originalText,
            originalLanguage: msg.originalLanguage,
            translatedText: translation?.translatedText || msg.originalText,
            targetLanguage: translation?.targetLanguage || ctx.user.preferredLanguage || 'en',
            createdAt: msg.createdAt,
            isMine: msg.senderId === String(ctx.user.id),
          };
        })
      );

      return messagesWithTranslations;
    }),

  /**
   * Get user's conversations
   */
  getMyConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.translationDb.getUserTranslateConversations( String(ctx.user.id));

    return conversations.map((conv) => ({
      id: conv.id,
      title: conv.title || 'Untitled Conversation',
      shareableCode: conv.shareableCode,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));
  }),

  /**
   * Leave a conversation
   */
  leaveConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.translationDb.removeConversationParticipant( input.conversationId, String(ctx.user.id));
      return { success: true };
    }),

  /**
   * Delete a conversation (creator only)
   */
  deleteConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get conversation to check creator
      const conversation = await ctx.translationDb.getConversationById( input.conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Only creator can delete
      if (conversation.creatorId !== ctx.user.id) {
        throw new Error("Only the conversation creator can delete it");
      }

      // Delete conversation (cascade will handle participants, messages, translations)
      await ctx.translationDb.deleteTranslateConversation(input.conversationId, Number(ctx.user.id));
      
      return { success: true };
    }),
});
