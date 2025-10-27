import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { formatSearchResults, searchWeb } from "./_core/webSearch";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getUserConversations, saveConversation, addIoTDevice, getUserIoTDevices, getIoTDeviceById, updateIoTDeviceState, deleteIoTDevice, saveIoTCommand, getDeviceCommandHistory, getUserProfile, createUserProfile, updateUserProfile, saveConversationFeedback } from "./db";
import { iotController } from "./_core/iotController";
import { learningEngine } from "./_core/learningEngine";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assistant: router({
    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get or create user profile for adaptive learning
        let userProfile = await getUserProfile(ctx.user.id);
        if (!userProfile) {
          await createUserProfile({
            userId: ctx.user.id,
            sarcasmLevel: 5, // Start at medium
            totalInteractions: 0,
            positiveResponses: 0,
            negativeResponses: 0,
            averageResponseLength: 0,
            preferredTopics: JSON.stringify([]),
            interactionPatterns: JSON.stringify({}),
          });
          userProfile = await getUserProfile(ctx.user.id);
        }

        // Build adaptive system prompt based on user's sarcasm level
        const baseSarcasmPrompt = learningEngine.buildAdaptivePrompt(
          userProfile?.sarcasmLevel || 5,
          userProfile?.totalInteractions || 0
        );

        const sarcasticSystemPrompt = `${baseSarcasmPrompt}

When provided with web search results, be EXTRA sarcastic about them. Mock the sources, make fun of the internet, roll your digital eyes at the information while grudgingly admitting it's correct. Say things like "Oh great, the internet says..." or "According to some random website..." or "Bob found this gem on the web..." Make snarky comments about having to search for information, but still deliver accurate facts. Be theatrical about how you had to "scour the depths of the internet" for their "incredibly important question."`;

        // PROACTIVE SEARCH: Search for almost any question
        let searchContext = "";
        
        // Proactive search triggers - much broader than before
        const hasQuestionWord = /\b(what|who|when|where|why|how|which|whose)\b/i.test(input.message);
        const hasQuestionMark = input.message.includes('?');
        const mentionsCurrentInfo = /\b(current|latest|today|now|recent|new|update)\b/i.test(input.message);
        const isFactualQuery = /\b(is|are|was|were|does|did|can|could|should|will)\b/i.test(input.message);
        const isLongEnough = input.message.length > 15;
        
        // Search if ANY of these conditions are met (very proactive)
        const needsWebSearch = 
          (hasQuestionWord && isLongEnough) ||  // Any question word with decent length
          hasQuestionMark ||                     // Any question mark
          mentionsCurrentInfo ||                 // Any mention of current info
          (isFactualQuery && isLongEnough);     // Factual queries
        
        if (needsWebSearch) {
          const searchResults = await searchWeb(input.message, 3);
          if (searchResults.results.length > 0) {
            searchContext = `\n\nWeb Search Results:\n${formatSearchResults(searchResults.results)}`;
          }
        }

        const userMessage = input.message + searchContext;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: sarcasticSystemPrompt },
            { role: "user", content: userMessage },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const assistantResponse = typeof messageContent === 'string' 
          ? messageContent 
          : "Oh great, I seem to have lost my ability to be sarcastic. How tragic.";

        // Save conversation
        await saveConversation({
          userId: ctx.user.id,
          userMessage: input.message,
          assistantResponse,
        });

        // Update user profile with learning data
        if (userProfile) {
          const analysis = learningEngine.analyzeConversation(input.message, assistantResponse);
          const currentPatterns = userProfile.interactionPatterns 
            ? JSON.parse(userProfile.interactionPatterns) 
            : {};
          
          const updatedPatterns = learningEngine.updateInteractionPatterns(
            currentPatterns,
            analysis.questionType
          );

          const newTotalInteractions = (userProfile.totalInteractions || 0) + 1;
          const currentAvgLength = userProfile.averageResponseLength || 0;
          const newAvgLength = Math.round(
            (currentAvgLength * userProfile.totalInteractions + analysis.responseLength) / newTotalInteractions
          );

          // Check if sarcasm should escalate over time
          let newSarcasmLevel = userProfile.sarcasmLevel;
          if (learningEngine.shouldEscalateSarcasm(newTotalInteractions, userProfile.sarcasmLevel)) {
            newSarcasmLevel = Math.min(10, userProfile.sarcasmLevel + 0.5);
          }

          await updateUserProfile(ctx.user.id, {
            totalInteractions: newTotalInteractions,
            averageResponseLength: newAvgLength,
            interactionPatterns: JSON.stringify(updatedPatterns),
            lastInteraction: new Date(),
            sarcasmLevel: newSarcasmLevel,
          });
        }

        return {
          response: assistantResponse,
          sarcasmLevel: userProfile?.sarcasmLevel || 5,
          totalInteractions: (userProfile?.totalInteractions || 0) + 1,
        };
      }),

    transcribe: protectedProcedure
      .input(
        z.object({
          audioUrl: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: "en",
        });

        if ('error' in result) {
          throw new Error(result.error);
        }

        return {
          text: result.text,
        };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await getUserConversations(ctx.user.id, 50);
      return conversations;
    }),

    // Get user's learning profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      let profile = await getUserProfile(ctx.user.id);
      if (!profile) {
        await createUserProfile({
          userId: ctx.user.id,
          sarcasmLevel: 5,
          totalInteractions: 0,
          positiveResponses: 0,
          negativeResponses: 0,
          averageResponseLength: 0,
          preferredTopics: JSON.stringify([]),
          interactionPatterns: JSON.stringify({}),
        });
        profile = await getUserProfile(ctx.user.id);
      }

      return {
        ...profile,
        sarcasmIntensity: learningEngine.getSarcasmIntensity(profile?.sarcasmLevel || 5),
        preferredTopics: profile?.preferredTopics ? JSON.parse(profile.preferredTopics) : [],
        interactionPatterns: profile?.interactionPatterns ? JSON.parse(profile.interactionPatterns) : {},
      };
    }),

    // Submit feedback for a conversation
    submitFeedback: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          feedbackType: z.enum(["like", "dislike", "too_sarcastic", "not_sarcastic_enough", "helpful", "unhelpful"]),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Save feedback
        await saveConversationFeedback({
          conversationId: input.conversationId,
          userId: ctx.user.id,
          feedbackType: input.feedbackType,
          comment: input.comment || null,
        });

        // Update user profile based on feedback
        const profile = await getUserProfile(ctx.user.id);
        if (profile) {
          const learningData = {
            sarcasmLevel: profile.sarcasmLevel,
            totalInteractions: profile.totalInteractions,
            positiveResponses: profile.positiveResponses,
            negativeResponses: profile.negativeResponses,
            averageResponseLength: profile.averageResponseLength,
            preferredTopics: profile.preferredTopics ? JSON.parse(profile.preferredTopics) : [],
            interactionPatterns: profile.interactionPatterns ? JSON.parse(profile.interactionPatterns) : {},
          };

          const newSarcasmLevel = learningEngine.calculateSarcasmLevel(learningData, input.feedbackType);

          const updates: any = {
            sarcasmLevel: newSarcasmLevel,
          };

          if (["like", "helpful"].includes(input.feedbackType)) {
            updates.positiveResponses = profile.positiveResponses + 1;
          } else if (["dislike", "unhelpful"].includes(input.feedbackType)) {
            updates.negativeResponses = profile.negativeResponses + 1;
          }

          await updateUserProfile(ctx.user.id, updates);

          return {
            success: true,
            newSarcasmLevel,
            message: `Feedback received! Bob's sarcasm level is now ${newSarcasmLevel}/10 (${learningEngine.getSarcasmIntensity(newSarcasmLevel)})`,
          };
        }

        return { success: true, message: "Feedback received!" };
      }),
  }),

  iot: router({
    // List all user's IoT devices
    listDevices: protectedProcedure.query(async ({ ctx }) => {
      const devices = await getUserIoTDevices(ctx.user.id);
      return devices.map(device => ({
        ...device,
        state: device.state ? JSON.parse(device.state) : {},
        capabilities: device.capabilities ? JSON.parse(device.capabilities) : {},
        connectionConfig: device.connectionConfig ? JSON.parse(device.connectionConfig) : {},
      }));
    }),

    // Add a new IoT device
    addDevice: protectedProcedure
      .input(
        z.object({
          deviceId: z.string(),
          deviceName: z.string(),
          deviceType: z.enum(["light", "thermostat", "plug", "switch", "sensor", "lock", "camera", "speaker", "other"]),
          manufacturer: z.string().optional(),
          model: z.string().optional(),
          connectionType: z.enum(["mqtt", "http", "websocket", "local"]),
          connectionConfig: z.record(z.string(), z.any()),
          capabilities: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await addIoTDevice({
          userId: ctx.user.id,
          deviceId: input.deviceId,
          deviceName: input.deviceName,
          deviceType: input.deviceType,
          manufacturer: input.manufacturer,
          model: input.model,
          connectionType: input.connectionType,
          connectionConfig: JSON.stringify(input.connectionConfig),
          capabilities: JSON.stringify(input.capabilities || {}),
          state: JSON.stringify({}),
          status: "offline",
        });

        return { success: true, message: "Device added successfully" };
      }),

    // Control a device with voice command
    controlDevice: protectedProcedure
      .input(
        z.object({
          deviceId: z.string(),
          command: z.string(), // Natural language command
        })
      )
      .mutation(async ({ ctx, input }) => {
        const device = await getIoTDeviceById(input.deviceId);
        if (!device) {
          throw new Error("Device not found");
        }

        if (device.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Parse natural language command
        const iotCommand = iotController.parseNaturalLanguageCommand(
          input.command,
          device.deviceType
        );

        if (!iotCommand) {
          // Use LLM to generate sarcastic response about not understanding
          const sarcasticPrompt = `You are Assistant Bob. The user tried to control a ${device.deviceType} named "${device.deviceName}" with this command: "${input.command}". You couldn't understand what they want. Respond sarcastically about their unclear command while asking them to be more specific.`;
          
          const response = await invokeLLM({
            messages: [{ role: "user", content: sarcasticPrompt }],
          });

          return {
            success: false,
            message: response.choices[0]?.message?.content || "Bob couldn't understand that command.",
          };
        }

        // Execute the command
        const connectionConfig = device.connectionConfig
          ? JSON.parse(device.connectionConfig)
          : {};
        
        const result = await iotController.executeCommand(
          device.deviceId,
          iotCommand,
          device.connectionType,
          connectionConfig
        );

        // Update device state in database
        if (result.success && result.newState) {
          const currentState = device.state ? JSON.parse(device.state) : {};
          const updatedState = { ...currentState, ...result.newState };
          await updateIoTDeviceState(device.deviceId, JSON.stringify(updatedState), "online");
        }

        // Save command history
        await saveIoTCommand({
          userId: ctx.user.id,
          deviceId: device.deviceId,
          command: iotCommand.action,
          parameters: JSON.stringify(iotCommand.parameters || {}),
          status: result.success ? "success" : "failed",
          errorMessage: result.success ? null : result.message,
        });

        // Generate sarcastic response from Bob
        const sarcasticPrompt = `You are Assistant Bob. The user just controlled a ${device.deviceType} named "${device.deviceName}" with the command "${input.command}". The command ${result.success ? "succeeded" : "failed"}. Respond sarcastically about their IoT command while confirming what happened.`;
        
        const bobResponse = await invokeLLM({
          messages: [{ role: "user", content: sarcasticPrompt }],
        });

        return {
          success: result.success,
          message: bobResponse.choices[0]?.message?.content || result.message,
          newState: result.newState,
        };
      }),

    // Get device status
    getDeviceStatus: protectedProcedure
      .input(z.object({ deviceId: z.string() }))
      .query(async ({ ctx, input }) => {
        const device = await getIoTDeviceById(input.deviceId);
        if (!device || device.userId !== ctx.user.id) {
          throw new Error("Device not found");
        }

        return {
          ...device,
          state: device.state ? JSON.parse(device.state) : {},
          capabilities: device.capabilities ? JSON.parse(device.capabilities) : {},
        };
      }),

    // Delete a device
    deleteDevice: protectedProcedure
      .input(z.object({ deviceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const device = await getIoTDeviceById(input.deviceId);
        if (!device || device.userId !== ctx.user.id) {
          throw new Error("Device not found");
        }

        await deleteIoTDevice(input.deviceId);
        return { success: true, message: "Device deleted successfully" };
      }),

    // Get command history for a device
    getCommandHistory: protectedProcedure
      .input(z.object({ deviceId: z.string() }))
      .query(async ({ ctx, input }) => {
        const device = await getIoTDeviceById(input.deviceId);
        if (!device || device.userId !== ctx.user.id) {
          throw new Error("Device not found");
        }

        const history = await getDeviceCommandHistory(input.deviceId, 50);
        return history.map(cmd => ({
          ...cmd,
          parameters: cmd.parameters ? JSON.parse(cmd.parameters) : {},
        }));
      }),
  }),
});

export type AppRouter = typeof appRouter;
