import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { formatSearchResults, searchWeb } from "./_core/webSearch";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getUserConversations, saveConversation, addIoTDevice, getUserIoTDevices, getIoTDeviceById, updateIoTDeviceState, deleteIoTDevice, saveIoTCommand, getDeviceCommandHistory, getUserProfile, createUserProfile, updateUserProfile, saveConversationFeedback, saveLearningSession, saveFactCheckResult, saveLearningSource, getUserLearningSessions, getFactCheckResultsBySession, saveStudyGuide, saveQuiz, getUserQuizzes, saveQuizAttempt, getQuizAttempts, saveVerifiedFact, getVerifiedFact, searchVerifiedFacts, normalizeQuestion, logFactAccess, createFactUpdateNotifications, getUserNotifications, markNotificationAsRead, dismissNotification, getUnreadNotificationCount, createConversationSession, getUserConversationSessions, getConversationSession, getConversationMessages, addConversationMessage, deleteConversationSession, saveConversationSessionToPhrasebook } from "./db";
import { iotController } from "./_core/iotController";
import { learningEngine } from "./_core/learningEngine";
import { languageLearningRouter } from "./languageLearningRouter";
import { debtCoachRouter } from "./debtCoachRouter";
import { budgetRouter } from "./budgetRouter";
import { goalsRouter } from "./goalsRouter";
import { mathRouter } from "./mathRouter";
import { scienceRouter } from "./scienceRouter";
import { wellbeingRouter } from "./wellbeingRouter";
import { wearableRouter } from "./wearableRouter";

export const appRouter = router({
  system: systemRouter,
  languageLearning: languageLearningRouter,
  debtCoach: debtCoachRouter,
  budget: budgetRouter,
  goals: goalsRouter,
  math: mathRouter,
  science: scienceRouter,
  wellbeing: wellbeingRouter,
  wearable: wearableRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    setLanguage: protectedProcedure
      .input(z.object({ language: z.string().length(2).or(z.string().length(5)) }))
      .mutation(async ({ ctx, input }) => {
        const { updateUserLanguage } = await import("./db");
        await updateUserLanguage(ctx.user.id, input.language);
        return { success: true, language: input.language };
      }),
    setStaySignedIn: protectedProcedure
      .input(z.object({ staySignedIn: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const { updateUserStaySignedIn } = await import("./db");
        await updateUserStaySignedIn(ctx.user.id, input.staySignedIn);
        return { success: true, staySignedIn: input.staySignedIn };
      }),
    generate2FASecret: protectedProcedure
      .mutation(async ({ ctx }) => {
        const speakeasy = await import("speakeasy");
        const QRCode = await import("qrcode");
        
        const secret = speakeasy.default.generateSecret({
          name: `SASS-E (${ctx.user.email || ctx.user.name || 'User'})`,
          issuer: 'SASS-E',
        });
        
        const qrCodeUrl = await QRCode.default.toDataURL(secret.otpauth_url!);
        
        return {
          secret: secret.base32,
          qrCode: qrCodeUrl,
        };
      }),
    enable2FA: protectedProcedure
      .input(z.object({ secret: z.string(), token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const speakeasy = await import("speakeasy");
        const { enable2FA, generateBackupCodes } = await import("./db");
        
        const verified = speakeasy.default.totp.verify({
          secret: input.secret,
          encoding: 'base32',
          token: input.token,
        });
        
        if (!verified) {
          throw new Error('Invalid verification code');
        }
        
        const backupCodes = generateBackupCodes();
        await enable2FA(ctx.user.id, input.secret, backupCodes);
        
        return { success: true, backupCodes };
      }),
    disable2FA: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const speakeasy = await import("speakeasy");
        const { getUserById, disable2FA } = await import("./db");
        
        const user = await getUserById(ctx.user.id);
        if (!user?.twoFactorSecret) {
          throw new Error('2FA is not enabled');
        }
        
        const verified = speakeasy.default.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: input.token,
        });
        
        if (!verified) {
          throw new Error('Invalid verification code');
        }
        
        await disable2FA(ctx.user.id);
        return { success: true };
      }),
    regenerateBackupCodes: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const speakeasy = await import("speakeasy");
        const { getUserById, updateBackupCodes, generateBackupCodes } = await import("./db");
        
        const user = await getUserById(ctx.user.id);
        if (!user?.twoFactorSecret) {
          throw new Error('2FA is not enabled');
        }
        
        const verified = speakeasy.default.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: input.token,
        });
        
        if (!verified) {
          throw new Error('Invalid verification code');
        }
        
        const backupCodes = generateBackupCodes();
        await updateBackupCodes(ctx.user.id, backupCodes);
        
        return { success: true, backupCodes };
      }),
    verify2FACode: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const speakeasy = await import("speakeasy");
        const { getUserById, useBackupCode } = await import("./db");
        
        const user = await getUserById(ctx.user.id);
        if (!user?.twoFactorSecret) {
          throw new Error('2FA is not enabled');
        }
        
        // Try TOTP verification first
        const verified = speakeasy.default.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: input.token,
        });
        
        if (verified) {
          return { success: true };
        }
        
        // Try backup code if TOTP failed
        if (user.backupCodes) {
          const backupCodeUsed = await useBackupCode(ctx.user.id, input.token);
          if (backupCodeUsed) {
            return { success: true, usedBackupCode: true };
          }
        }
        
        throw new Error('Invalid verification code');
      }),
  }),

  assistant: router({
    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          dateTimeInfo: z.object({
            currentDate: z.string(),
            currentTime: z.string(),
            timezone: z.string()
          }).optional(),
          locationInfo: z.object({
            latitude: z.number(),
            longitude: z.number()
          }).optional(),
          conversationHistory: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string()
          })).optional(),
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

        // Fetch weather data if location is provided
        let weatherContext = '';
        if (input.locationInfo) {
          const { getWeatherData, formatWeatherForPrompt } = await import('./_core/weather');
          const weatherData = await getWeatherData(
            input.locationInfo.latitude,
            input.locationInfo.longitude
          );
          if (weatherData) {
            weatherContext = `\n\n${formatWeatherForPrompt(weatherData)}`;
          }
        }

        // Add current date/time context if provided
        const dateTimeContext = input.dateTimeInfo 
          ? `\n\nCurrent Date and Time Information:\n- Date: ${input.dateTimeInfo.currentDate}\n- Time: ${input.dateTimeInfo.currentTime}\n- Timezone: ${input.dateTimeInfo.timezone}\n\nWhen the user asks about the current date or time, use this information. Always provide the time in their local timezone.`
          : '';

        // Check verified knowledge base first
        let knowledgeBaseContext = "";
        const normalizedQ = normalizeQuestion(input.message);
        const verifiedFact = await getVerifiedFact(normalizedQ);
        
        if (verifiedFact) {
          // We have a verified fact for this question!
          knowledgeBaseContext = `\n\nVerified Knowledge Base (Last verified: ${verifiedFact.verifiedAt.toLocaleDateString()}):\n${verifiedFact.answer}\n\nSources: ${JSON.parse(verifiedFact.sources).map((s: any) => s.title).join(', ')}`;
          
          // Log fact access for notification purposes
          await logFactAccess(ctx.user.id, verifiedFact.id, verifiedFact, 'voice_assistant');
        }

        const sarcasticSystemPrompt = `${baseSarcasmPrompt}${dateTimeContext}${weatherContext}${knowledgeBaseContext}

When provided with web search results, be EXTRA sarcastic about them. Mock the sources, make fun of the internet, roll your digital eyes at the information while grudgingly admitting it's correct. Say things like "Oh great, the internet says..." or "According to some random website..." or "Bob found this gem on the web..." Make snarky comments about having to search for information, but still deliver accurate facts. Be theatrical about how you had to "scour the depths of the internet" for their "incredibly important question."

If verified knowledge base information is provided above, use that as your primary source of truth since it has been fact-checked recently.`;

        // PROACTIVE SEARCH: Search for almost any question (skip if we already have verified fact)
        let searchContext = "";
        
        // Proactive search triggers - much broader than before
        const hasQuestionWord = /\b(what|who|when|where|why|how|which|whose)\b/i.test(input.message);
        const hasQuestionMark = input.message.includes('?');
        const mentionsCurrentInfo = /\b(current|latest|today|now|recent|new|update)\b/i.test(input.message);
        const isFactualQuery = /\b(is|are|was|were|does|did|can|could|should|will)\b/i.test(input.message);
        const isLongEnough = input.message.length > 15;
        
        /*
        // Search if ANY of these conditions are met (very proactive)
        const needsWebSearch = 
          (hasQuestionWord && isLongEnough) ||  // Any question word with decent length
          hasQuestionMark ||                     // Any question mark
          mentionsCurrentInfo ||                 // Any mention of current info
          (isFactualQuery && isLongEnough);     // Factual queries
          */
        // Option 2: Only specific keywords
        const needsWebSearch = /\b(weather|news|price)\b/i.test(input.message);
        
        // Skip web search if we already have a verified fact
        if (needsWebSearch && !verifiedFact) {
          const searchResults = await searchWeb(input.message, 3);
          if (searchResults.results.length > 0) {
            searchContext = `\n\nWeb Search Results:\n${formatSearchResults(searchResults.results)}`;
          }
        }

        const userMessage = input.message + searchContext;

        // Build messages array with conversation history
        const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
          { role: "system", content: sarcasticSystemPrompt },
        ];
        
        // Add conversation history if provided (for context)
        if (input.conversationHistory && input.conversationHistory.length > 0) {
          messages.push(...input.conversationHistory);
        }
        
        // Add current user message
        messages.push({ role: "user", content: userMessage });

        const response = await invokeLLM({ messages });

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

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await getUserConversations(ctx.user.id);
      return conversations;
    }),
    clearAllConversations: protectedProcedure.mutation(async ({ ctx }) => {
      const { deleteAllUserConversations } = await import('./db');
      await deleteAllUserConversations(ctx.user.id);
      return { success: true };
    }),
    history: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await getUserConversations(ctx.user.id);
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
          const sarcasticPrompt = `You are Agent Bob. The user tried to control a ${device.deviceType} named "${device.deviceName}" with this command: "${input.command}". You couldn't understand what they want. Respond sarcastically about their unclear command while asking them to be more specific.`;
          
          const response = await invokeLLM({
            messages: [{ role: "user", content: sarcasticPrompt }],
          });

          const messageContent = response.choices[0]?.message?.content;
          const messageString = typeof messageContent === 'string' ? messageContent : "Bob couldn't understand that command.";
          
          return {
            success: false,
            message: messageString,
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
        const sarcasticPrompt = `You are Agent Bob. The user just controlled a ${device.deviceType} named "${device.deviceName}" with the command "${input.command}". The command ${result.success ? "succeeded" : "failed"}. Respond sarcastically about their IoT command while confirming what happened.`;
        
        const bobResponse = await invokeLLM({
          messages: [{ role: "user", content: sarcasticPrompt }],
        });

        const bobMessageContent = bobResponse.choices[0]?.message?.content;
        const bobMessageString = typeof bobMessageContent === 'string' ? bobMessageContent : result.message;
        
        return {
          success: result.success,
          message: bobMessageString,
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

  learning: router({
    // Explain topic with automatic fact-checking
    explainWithFactCheck: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          question: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const userProfile = await getUserProfile(ctx.user.id);
          const sarcasmLevel = userProfile?.sarcasmLevel || 5;
          const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Step 1: Search for current information FIRST
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const searchResults = await searchWeb(input.question, 5);
        const searchContext = searchResults.results.map((r: any, i: number) => 
          `[${i+1}] ${r.title}\n${r.content}\nSource: ${r.url}`
        ).join('\n\n');

        // Step 2: Generate explanation based on search results
        const systemPrompt = `You are Agent Bob, a ${personalityDesc} AI learning assistant. Today's date is ${currentDate}. You MUST base your answer on the search results provided below, NOT on your training data. For questions about current events or living people, the search results are the authoritative source. Explain topics clearly and accurately, but with your signature wit and sarcasm. Break down complex concepts into understandable parts. Keep explanations concise (3-5 paragraphs) but comprehensive.`;

        const explanationResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Question: ${input.question}\n\nCurrent Web Search Results:\n${searchContext}\n\nBased on these search results, explain the answer to the question.` },
          ],
        });

        const explanationContent = explanationResponse.choices[0].message.content;
        const explanation = typeof explanationContent === 'string' ? explanationContent : JSON.stringify(explanationContent);

        // Step 3: Extract key claims for fact-checking
        const claimsPrompt = `Extract 3-5 key factual claims from this explanation that should be verified. Return as a JSON array of strings.\n\nExplanation: ${explanation}`;
        
        const claimsResponse = await invokeLLM({
          messages: [
            { role: "system", content: "You are a fact-checking assistant. Extract verifiable claims." },
            { role: "user", content: claimsPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "claims_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  claims: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of factual claims to verify"
                  }
                },
                required: ["claims"],
                additionalProperties: false
              }
            }
          }
        });

        const claimsContent = claimsResponse.choices[0].message.content;
        const claimsText = typeof claimsContent === 'string' ? claimsContent : JSON.stringify(claimsContent);
        const claimsData = JSON.parse(claimsText);
        const claims = claimsData.claims || [];

        // Step 4: Fact-check each claim using web search
        const factCheckResults = [];
        let totalConfidence = 0;
        let sourcesCount = 0;

        for (const claim of claims) {
          // Search for verification
          const searchResults = await searchWeb(claim, 3);

          // Analyze search results for verification
          const verificationPrompt = `Today's date is ${currentDate}. You MUST base your verification ONLY on the search results provided, NOT on your training data. For questions about living people or current events, the search results are the authoritative source.\n\nVerify this claim: "${claim}"\n\nSearch Results:\n${JSON.stringify(searchResults.results.slice(0, 3))}\n\nProvide verification status (verified/disputed/debunked/unverified), confidence score (0-100), and brief explanation based ONLY on the search results.`;
          
          const verificationResponse = await invokeLLM({
            messages: [
              { role: "system", content: "You are a fact-checking expert. Analyze search results to verify claims." },
              { role: "user", content: verificationPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "fact_verification",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["verified", "disputed", "debunked", "unverified"]
                    },
                    confidence: { type: "number" },
                    explanation: { type: "string" }
                  },
                  required: ["status", "confidence", "explanation"],
                  additionalProperties: false
                }
              }
            }
          });

          const verificationContent = verificationResponse.choices[0].message.content;
          const verificationText = typeof verificationContent === 'string' ? verificationContent : JSON.stringify(verificationContent);
          const verification = JSON.parse(verificationText);

          const sources = searchResults.results.slice(0, 3).map((result: any) => ({
            title: result.title || 'Unknown',
            url: result.url || '',
            sourceType: 'other' as const,
            credibilityScore: 75,
          }));

          factCheckResults.push({
            claim,
            status: verification.status,
            confidence: Math.round(verification.confidence),
            explanation: verification.explanation,
            sources,
          });

          totalConfidence += verification.confidence;
          sourcesCount += sources.length;
        }

        const overallConfidence = claims.length > 0 ? Math.round(totalConfidence / claims.length) : 0;

        // Step 5: Save verified fact to knowledge base
        // Only save if confidence is high and status is verified
        if (overallConfidence >= 70 && factCheckResults.some(fc => fc.status === 'verified')) {
          const normalizedQ = normalizeQuestion(input.question);
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // Facts expire after 30 days
          
          try {
            await saveVerifiedFact({
              question: input.question,
              normalizedQuestion: normalizedQ,
              answer: explanation,
              verificationStatus: 'verified',
              confidenceScore: overallConfidence,
              sources: JSON.stringify(factCheckResults.flatMap(fc => fc.sources)),
              verifiedAt: new Date(),
              expiresAt,
              verifiedByUserId: ctx.user.id,
            });
          } catch (error) {
            console.error('[Learning] Failed to save verified fact:', error);
            // Don't fail the whole request if knowledge base save fails
          }
        }

        // Step 6: Save to database
        const sessionResult = await saveLearningSession({
          userId: ctx.user.id,
          topic: input.topic,
          question: input.question,
          explanation,
          confidenceScore: overallConfidence,
          sourcesCount,
          sessionType: 'explanation',
        });

        const sessionId = sessionResult ? Number(sessionResult[0].insertId) : 0;

        // Save fact-check results
        for (const factCheck of factCheckResults) {
          const factCheckResult = await saveFactCheckResult({
            learningSessionId: sessionId,
            claim: factCheck.claim,
            verificationStatus: factCheck.status,
            confidenceScore: factCheck.confidence,
            sources: JSON.stringify(factCheck.sources),
            explanation: factCheck.explanation,
          });

          // Save individual sources
          const factCheckId = factCheckResult ? Number(factCheckResult[0].insertId) : 0;
          for (const source of factCheck.sources) {
            await saveLearningSource({
              factCheckResultId: factCheckId,
              title: source.title,
              url: source.url,
              sourceType: source.sourceType,
              credibilityScore: source.credibilityScore,
            });
          }
        }

        return {
          sessionId,
          explanation,
          confidenceScore: overallConfidence,
          factChecks: factCheckResults,
          sourcesCount,
        };
        } catch (error) {
          console.error('[Learning] Error in explainWithFactCheck:', error);
          throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    // Get user's learning history
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const sessions = await getUserLearningSessions(ctx.user.id, 50);
      return sessions;
    }),

    // Get fact-check results for a session
    getFactChecks: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const factChecks = await getFactCheckResultsBySession(input.sessionId);
        return factChecks;
      }),

    // Generate study guide from explanation
    generateStudyGuide: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get the learning session
        const sessions = await getUserLearningSessions(ctx.user.id, 100);
        const session = sessions.find(s => s.id === input.sessionId);
        
        if (!session) {
          throw new Error('Learning session not found');
        }

        const userProfile = await getUserProfile(ctx.user.id);
        const sarcasmLevel = userProfile?.sarcasmLevel || 5;
        const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Generate study guide with LLM
        const studyGuidePrompt = `Create a comprehensive study guide based on this explanation:

Topic: ${session.topic}
Explanation: ${session.explanation}

Generate a study guide with:
1. Key Concepts (3-5 main ideas)
2. Important Terms and Definitions (5-7 terms)
3. Summary (2-3 paragraphs)
4. Study Tips (3-4 actionable tips)

Maintain a ${personalityDesc} tone while being educational.`;

        const studyGuideResponse = await invokeLLM({
          messages: [
            { role: 'system', content: `You are Agent Bob, a ${personalityDesc} learning assistant creating study materials.` },
            { role: 'user', content: studyGuidePrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'study_guide',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  keyConcepts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Main concepts to remember'
                  },
                  terms: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        term: { type: 'string' },
                        definition: { type: 'string' }
                      },
                      required: ['term', 'definition'],
                      additionalProperties: false
                    }
                  },
                  summary: { type: 'string' },
                  studyTips: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['keyConcepts', 'terms', 'summary', 'studyTips'],
                additionalProperties: false
              }
            }
          }
        });

        const studyGuideContent = studyGuideResponse.choices[0].message.content;
        const studyGuideText = typeof studyGuideContent === 'string' ? studyGuideContent : JSON.stringify(studyGuideContent);
        const studyGuide = JSON.parse(studyGuideText);

        // Save to database
        await saveStudyGuide({
          userId: ctx.user.id,
          learningSessionId: input.sessionId,
          title: `Study Guide: ${session.topic}`,
          content: JSON.stringify(studyGuide),
          topicsCount: studyGuide.keyConcepts.length,
          questionsCount: 0,
        });

        return studyGuide;
      }),

    // Generate quiz from explanation
    generateQuiz: protectedProcedure
      .input(z.object({ 
        sessionId: z.number(),
        questionCount: z.number().min(3).max(10).default(5),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the learning session
        const sessions = await getUserLearningSessions(ctx.user.id, 100);
        const session = sessions.find(s => s.id === input.sessionId);
        
        if (!session) {
          throw new Error('Learning session not found');
        }

        const userProfile = await getUserProfile(ctx.user.id);
        const sarcasmLevel = userProfile?.sarcasmLevel || 5;
        const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Generate quiz with LLM
        console.log('[Quiz Generation] Starting quiz generation for session:', input.sessionId);
        const quizPrompt = `Create a ${input.questionCount}-question multiple choice quiz based on this explanation:

Topic: ${session.topic}
Explanation: ${session.explanation}

For each question:
- Create a clear, specific question
- Provide 4 answer options (A, B, C, D)
- Mark the correct answer
- Add a brief explanation for the correct answer

Maintain a ${personalityDesc} tone in questions and explanations.`;

        console.log('[Quiz Generation] Calling LLM with prompt length:', quizPrompt.length);
        
        let quizResponse;
        try {
          quizResponse = await invokeLLM({
            messages: [
              { role: 'system', content: `You are Agent Bob, a ${personalityDesc} learning assistant creating quiz questions.` },
              { role: 'user', content: quizPrompt },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'quiz_generation',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    questions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          question: { type: 'string' },
                        options: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                          correctAnswer: { 
                            type: 'string',
                            enum: ['A', 'B', 'C', 'D']
                          },
                          explanation: { type: 'string' }
                        },
                        required: ['question', 'options', 'correctAnswer', 'explanation'],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ['questions'],
                  additionalProperties: false
                }
              }
            }
          });
        } catch (error) {
          console.error('[Quiz Generation] LLM call failed with error:', error);
          throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : String(error)}`);
        }

        console.log('[Quiz Generation] LLM response received:', JSON.stringify(quizResponse).substring(0, 200));
        
        if (!quizResponse || !quizResponse.choices || quizResponse.choices.length === 0) {
          console.error('[Quiz Generation] Invalid LLM response:', JSON.stringify(quizResponse));
          throw new Error('Failed to generate quiz: Invalid LLM response');
        }

        const quizContent = quizResponse.choices[0].message.content;
        if (!quizContent) {
          throw new Error('Failed to generate quiz: Empty response content');
        }
        
        const quizText = typeof quizContent === 'string' ? quizContent : JSON.stringify(quizContent);
        const quiz = JSON.parse(quizText);

        // Save to database
        const quizResult = await saveQuiz({
          userId: ctx.user.id,
          learningSessionId: input.sessionId,
          title: `Quiz: ${session.topic}`,
          questions: JSON.stringify(quiz.questions),
          totalQuestions: quiz.questions.length,
        });

        if (!quizResult || !quizResult[0] || !quizResult[0].insertId) {
          throw new Error('Failed to save quiz to database');
        }

        const quizId = Number(quizResult[0].insertId);

        return {
          quizId,
          questions: quiz.questions,
        };
      }),

    // Analyze pronunciation using AI
    analyzePronunciation: protectedProcedure
      .input(
        z.object({
          word: z.string(),
          languageCode: z.string(),
          duration: z.number(),
          waveformStats: z.object({
            peaks: z.number(),
            average: z.number(),
            variance: z.number(),
            silenceRatio: z.number(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userProfile = await getUserProfile(ctx.user.id);
        const sarcasmLevel = userProfile?.sarcasmLevel || 5;
        const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Calculate expected duration based on word characteristics
        const syllableCount = countSyllables(input.word);
        const expectedDuration = syllableCount * 0.4; // ~0.4s per syllable
        const durationRatio = Math.min(input.duration, expectedDuration) / Math.max(input.duration, expectedDuration);

        // Analyze waveform characteristics
        const { peaks, average, variance, silenceRatio } = input.waveformStats;
        
        // Calculate individual scores based on audio characteristics
        // Timing score: how close to expected duration
        const timingScore = Math.round(durationRatio * 100);
        
        // Clarity score: based on amplitude and variance
        let clarityScore = 50;
        if (average > 0.25 && average < 0.75) clarityScore += 20;
        if (variance > 0.04 && variance < 0.18) clarityScore += 15;
        if (silenceRatio < 0.35) clarityScore += 15;
        clarityScore = Math.min(100, Math.max(0, clarityScore));
        
        // Pitch score: based on peak distribution
        const expectedPeaks = syllableCount * 8; // Rough estimate
        const peakRatio = Math.min(peaks, expectedPeaks) / Math.max(peaks, expectedPeaks);
        const pitchScore = Math.round(50 + (peakRatio * 50));
        
        // Accent score: combination of other factors with some randomness for realism
        const accentBase = (timingScore + clarityScore + pitchScore) / 3;
        const accentVariation = (Math.random() - 0.5) * 10;
        const accentScore = Math.round(Math.min(100, Math.max(0, accentBase + accentVariation)));
        
        // Overall score with weights
        const overallScore = Math.round(
          timingScore * 0.25 +
          clarityScore * 0.30 +
          pitchScore * 0.25 +
          accentScore * 0.20
        );

        // Generate feedback using LLM
        const feedbackPrompt = `You are SASS-E, a ${personalityDesc} language learning assistant. A student just practiced pronouncing the word "${input.word}" in ${input.languageCode}. Their scores are:
- Overall: ${overallScore}%
- Pitch: ${pitchScore}%
- Clarity: ${clarityScore}%
- Timing: ${timingScore}%
- Accent: ${accentScore}%

Give a brief, encouraging feedback (1-2 sentences) about their pronunciation. Be helpful but maintain your personality.`;

        let feedback = '';
        let tips: string[] = [];

        try {
          const response = await invokeLLM({
            messages: [
              { role: 'system', content: `You are SASS-E, a ${personalityDesc} AI language tutor.` },
              { role: 'user', content: feedbackPrompt },
            ],
          });
          const content = response.choices[0]?.message?.content;
          feedback = typeof content === 'string' ? content : 'Keep practicing!';
        } catch {
          // Fallback feedback based on score
          if (overallScore >= 90) feedback = "Excellent! Your pronunciation is nearly perfect! 🎉";
          else if (overallScore >= 80) feedback = "Great job! Your pronunciation is very good!";
          else if (overallScore >= 70) feedback = "Good effort! You're making progress.";
          else if (overallScore >= 60) feedback = "Not bad! Keep practicing to improve.";
          else if (overallScore >= 50) feedback = "Getting there! Focus on the tips below.";
          else feedback = "Keep trying! Listen carefully and practice more.";
        }

        // Generate tips based on scores
        if (pitchScore < 70) {
          tips.push("🎵 Work on your intonation. Try to match the rise and fall of the native pronunciation.");
        }
        if (clarityScore < 70) {
          tips.push("🗣️ Speak more clearly. Make sure each sound is distinct and audible.");
        }
        if (timingScore < 70) {
          tips.push("⏱️ Adjust your speed. Try to match the duration of the native pronunciation.");
        }
        if (accentScore < 70) {
          tips.push("👂 Listen carefully to the native accent and try to mimic the sound patterns.");
        }
        if (tips.length === 0) {
          tips.push("✨ Great work! Keep practicing to maintain your skills.");
        }

        return {
          overallScore,
          pitchScore,
          clarityScore,
          timingScore,
          accentScore,
          feedback,
          tips,
        };
      }),

    // Generate pronunciation audio using server-side TTS
    generatePronunciationAudio: protectedProcedure
      .input(z.object({
        word: z.string().min(1).max(500),
        languageCode: z.string().min(2).max(5),
        speed: z.number().min(0.5).max(1.5).default(0.85),
      }))
      .mutation(async ({ input }) => {
        const { generatePronunciation } = await import("./_core/textToSpeech");
        
        try {
          const result = await generatePronunciation(
            input.word,
            input.languageCode,
            input.speed
          );
          
          // Convert buffer to base64 for transmission
          const base64Audio = result.audioBuffer.toString('base64');
          
          return {
            success: true,
            audio: base64Audio,
            contentType: result.contentType,
          };
        } catch (error) {
          console.error('[TTS] Error generating pronunciation:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate audio',
            audio: null,
            contentType: null,
          };
        }
      }),

    // Submit quiz attempt
    submitQuizAttempt: protectedProcedure
      .input(z.object({
        quizId: z.number(),
        answers: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get user's quizzes to find the one being attempted
        const userQuizzes = await getUserQuizzes(ctx.user.id);
        const quiz = userQuizzes.find(q => q.id === input.quizId);
        
        if (!quiz) {
          throw new Error('Quiz not found');
        }

        // Parse quiz questions to check answers
        const questions = JSON.parse(quiz.questions);
        let correctCount = 0;
        
        // Convert numeric answer indices to letters (0 -> 'A', 1 -> 'B', etc.)
        const answerMap = ['A', 'B', 'C', 'D'];
        
        input.answers.forEach((answerIndex, questionIndex) => {
          const answerLetter = answerMap[answerIndex];
          if (questions[questionIndex] && answerLetter === questions[questionIndex].correctAnswer) {
            correctCount++;
          }
        });

        const score = Math.round((correctCount / questions.length) * 100);

        await saveQuizAttempt({
          quizId: input.quizId,
          userId: ctx.user.id,
          answers: JSON.stringify(input.answers),
          score,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          timeSpent: 0,
        });

        return {
          score,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          passed: score >= 70,
        };
      }),
  }),

  notifications: router({
    // Get user's notifications
    getNotifications: protectedProcedure
      .input(z.object({ includeRead: z.boolean().default(false) }).optional())
      .query(async ({ ctx, input }) => {
        const notifications = await getUserNotifications(ctx.user.id, input?.includeRead || false);
        
        // Parse JSON fields for each notification
        return notifications.map(notif => ({
          ...notif,
          oldVersion: JSON.parse(notif.oldVersion),
          newVersion: JSON.parse(notif.newVersion),
        }));
      }),
    
    // Get unread notification count
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      const count = await getUnreadNotificationCount(ctx.user.id);
      return { count };
    }),
    
    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationAsRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),
    
    // Dismiss notification
    dismiss: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await dismissNotification(input.notificationId, ctx.user.id);
        return { success: true };
      }),
  }),

  translation: router({
    // Translate text (simple, direct translation only)
    translate: protectedProcedure
      .input(
        z.object({
          text: z.string(),
          sourceLanguage: z.string(),
          targetLanguage: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Simple direct translation without personality
        const translationPrompt = `Translate the following text from ${input.sourceLanguage} to ${input.targetLanguage}. Provide only the direct translation without any additional commentary, explanation, or personality.\n\nText: "${input.text}"`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional translation assistant. Provide accurate, direct translations without adding any commentary or personality." },
            { role: "user", content: translationPrompt },
          ],
        });

        const responseContent = response.choices[0].message.content;
        const translatedText = (typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent)).trim();

        return {
          originalText: input.text,
          translatedText,
          sourceLanguage: input.sourceLanguage,
          targetLanguage: input.targetLanguage,
        };
      }),

    // Translate user message only (no response generation)
    chatWithTranslation: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          inputLanguage: z.string(),
          outputLanguage: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Simple translation: just translate the user's message from input language to output language
        let translatedMessage = input.message;
        
        // Only translate if languages are different
        if (input.inputLanguage.toLowerCase() !== input.outputLanguage.toLowerCase()) {
          const translatePrompt = `Translate the following text from ${input.inputLanguage} to ${input.outputLanguage}. Provide only the direct translation without any additional commentary.\n\nText: "${input.message}"`;
          
          const translateResponse = await invokeLLM({
            messages: [
              { role: "system", content: "You are a professional translation assistant. Provide accurate, direct translations without adding any commentary." },
              { role: "user", content: translatePrompt },
            ],
          });
          
          const translatedContent = translateResponse.choices[0].message.content;
          translatedMessage = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
        }

        return {
          originalMessage: input.message,
          translatedMessage: translatedMessage !== input.message ? translatedMessage : null,
          response: translatedMessage, // The translation IS the response
          inputLanguage: input.inputLanguage,
          outputLanguage: input.outputLanguage,
        };
      }),

    // Translate text from image (OCR + translation)
    translateImage: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          targetLanguage: z.string(),
          includePositions: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Step 1: Extract text from image using LLM vision
        const extractionSchema = input.includePositions ? {
          type: "object",
          properties: {
            textBlocks: {
              type: "array",
              description: "Array of text blocks with their positions and styles",
              items: {
                type: "object",
                properties: {
                  text: { type: "string", description: "The text content" },
                  x: { type: "number", description: "X coordinate (0-1, relative to image width)" },
                  y: { type: "number", description: "Y coordinate (0-1, relative to image height)" },
                  width: { type: "number", description: "Width (0-1, relative to image width)" },
                  height: { type: "number", description: "Height (0-1, relative to image height)" },
                  fontWeight: { type: "string", enum: ["normal", "bold"], description: "Font weight (normal or bold)" },
                  fontStyle: { type: "string", enum: ["normal", "italic"], description: "Font style (normal or italic)" },
                  fontFamily: { type: "string", enum: ["serif", "sans-serif", "monospace"], description: "Font family type" },
                  textDirection: { type: "string", enum: ["ltr", "rtl", "vertical"], description: "Text direction: left-to-right, right-to-left, or vertical" },
                },
                required: ["text", "x", "y", "width", "height", "fontWeight", "fontStyle", "fontFamily", "textDirection"],
                additionalProperties: false,
              },
            },
            detectedLanguage: {
              type: "string",
              description: "The detected language of the text",
            },
          },
          required: ["textBlocks", "detectedLanguage"],
          additionalProperties: false,
        } : {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The extracted text from the image",
            },
            detectedLanguage: {
              type: "string",
              description: "The detected language of the text",
            },
          },
          required: ["text", "detectedLanguage"],
          additionalProperties: false,
        };

        const extractPrompt = input.includePositions
          ? "Analyze this image and extract all visible text with their positions and visual characteristics. For each text block, provide:\n1. Text content\n2. Position as relative coordinates (0-1 range) where x,y is top-left corner, width,height are dimensions\n3. Font weight: 'normal' or 'bold' (analyze if text appears bold/heavy)\n4. Font style: 'normal' or 'italic' (check if text is slanted/italicized)\n5. Font family: 'serif' (with decorative strokes), 'sans-serif' (clean/modern), or 'monospace' (fixed-width)\n6. Text direction: 'ltr' (left-to-right like English), 'rtl' (right-to-left like Arabic/Hebrew), or 'vertical' (top-to-bottom like traditional Japanese/Chinese)\nAlso identify the language of the text."
          : "Extract all visible text from this image. Identify the language of the text. Return your response in this exact JSON format: {\"text\": \"extracted text here\", \"detectedLanguage\": \"language name\"}";

        const extractResponse = await invokeLLM({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: extractPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: input.imageUrl,
                  },
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "text_extraction",
              strict: true,
              schema: extractionSchema,
            },
          },
        });

        const extractContent = extractResponse.choices[0].message.content;
        const extracted = JSON.parse(typeof extractContent === 'string' ? extractContent : JSON.stringify(extractContent));

        // Step 2: Translate the extracted text if needed
        if (input.includePositions && extracted.textBlocks) {
          // Translate each text block
          const translatedBlocks = [];
          for (const block of extracted.textBlocks) {
            let translatedText = block.text;
            if (extracted.detectedLanguage.toLowerCase() !== input.targetLanguage.toLowerCase()) {
              const translatePrompt = `Translate the following text from ${extracted.detectedLanguage} to ${input.targetLanguage}. Provide only the direct translation.\n\nText: "${block.text}"`;
              
              const translateResponse = await invokeLLM({
                messages: [
                  { role: "system", content: "You are a professional translation assistant." },
                  { role: "user", content: translatePrompt },
                ],
              });
              
              const translatedContent = translateResponse.choices[0].message.content;
              translatedText = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
            }
            
            translatedBlocks.push({
              originalText: block.text,
              translatedText,
              x: block.x,
              y: block.y,
              width: block.width,
              height: block.height,
              fontWeight: block.fontWeight,
              fontStyle: block.fontStyle,
              fontFamily: block.fontFamily,
              textDirection: block.textDirection,
            });
          }

          return {
            detectedLanguage: extracted.detectedLanguage,
            targetLanguage: input.targetLanguage,
            textBlocks: translatedBlocks,
          };
        } else {
          // Original behavior for simple text extraction
          let translatedText = extracted.text;
          if (extracted.detectedLanguage.toLowerCase() !== input.targetLanguage.toLowerCase()) {
            const translatePrompt = `Translate the following text from ${extracted.detectedLanguage} to ${input.targetLanguage}. Provide only the direct translation.\n\nText: "${extracted.text}"`;
            
            const translateResponse = await invokeLLM({
              messages: [
                { role: "system", content: "You are a professional translation assistant." },
                { role: "user", content: translatePrompt },
              ],
            });
            
            const translatedContent = translateResponse.choices[0].message.content;
            translatedText = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
          }

          return {
            extractedText: extracted.text,
            detectedLanguage: extracted.detectedLanguage,
            translatedText,
            targetLanguage: input.targetLanguage,
          };
        }
      }),

    // Phrasebook endpoints
    saveTranslation: protectedProcedure
      .input(
        z.object({
          originalText: z.string(),
          translatedText: z.string(),
          sourceLanguage: z.string(),
          targetLanguage: z.string(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { saveTranslation } = await import("./db");
        return await saveTranslation({
          userId: ctx.user.id,
          ...input,
        });
      }),

    getSavedTranslations: protectedProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const { getSavedTranslations } = await import("./db");
        return await getSavedTranslations(ctx.user.id, input.categoryId);
      }),

    deleteSavedTranslation: protectedProcedure
      .input(z.object({ translationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteSavedTranslation } = await import("./db");
        return await deleteSavedTranslation(input.translationId, ctx.user.id);
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({ translationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { toggleTranslationFavorite } = await import("./db");
        return await toggleTranslationFavorite(input.translationId, ctx.user.id);
      }),

    updateCategory: protectedProcedure
      .input(
        z.object({
          translationId: z.number(),
          categoryId: z.number().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { updateTranslationCategory } = await import("./db");
        return await updateTranslationCategory(
          input.translationId,
          ctx.user.id,
          input.categoryId
        );
      }),

    // Category management
    createCategory: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          icon: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createTranslationCategory } = await import("./db");
        return await createTranslationCategory({
          userId: ctx.user.id,
          ...input,
        });
      }),

    getCategories: protectedProcedure.query(async ({ ctx }) => {
      const { getTranslationCategories } = await import("./db");
      return await getTranslationCategories(ctx.user.id);
    }),

    deleteCategory: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteTranslationCategory } = await import("./db");
        return await deleteTranslationCategory(input.categoryId, ctx.user.id);
      }),

    getFrequentTranslations: protectedProcedure.query(async ({ ctx }) => {
      const { getFrequentTranslations } = await import("./db");
      return await getFrequentTranslations(ctx.user.id);
    }),

    // Conversation mode endpoints
    createConversation: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          language1: z.string(),
          language2: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const sessionId = await createConversationSession(
          ctx.user.id,
          input.title,
          input.language1,
          input.language2
        );
        return { sessionId };
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversationSessions(ctx.user.id);
    }),

    getConversation: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await getConversationSession(input.sessionId, ctx.user.id);
        if (!session) throw new Error("Conversation not found");
        const messages = await getConversationMessages(input.sessionId);
        return { session, messages };
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          messageText: z.string(),
          language: z.string(),
          sender: z.enum(["user", "practice"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get the conversation session to determine target language
        const session = await getConversationSession(input.sessionId, ctx.user.id);
        if (!session) throw new Error("Conversation not found");

        // Determine target language (translate to the other language)
        const targetLanguage = input.language === session.language1 ? session.language2 : session.language1;

        // Translate the message
        const translationPrompt = `Translate the following text from ${input.language} to ${targetLanguage}. Provide only the direct translation without any additional commentary.\n\nText: "${input.messageText}"`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional translation assistant. Provide accurate, direct translations without adding any commentary." },
            { role: "user", content: translationPrompt },
          ],
        });

        const translatedContent = response.choices[0].message.content;
        const translatedText = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();

        // Save the message
        const messageId = await addConversationMessage(
          input.sessionId,
          input.messageText,
          translatedText,
          input.language,
          input.sender
        );

        return {
          messageId,
          originalText: input.messageText,
          translatedText,
          language: input.language,
          targetLanguage,
        };
      }),

    deleteConversation: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await deleteConversationSession(input.sessionId, ctx.user.id);
      }),

    saveConversationToPhrasebook: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await saveConversationSessionToPhrasebook(
          input.sessionId,
          ctx.user.id,
          input.categoryId
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;

/**
 * Count syllables in a word (approximate)
 */
function countSyllables(word: string): number {
  const vowels = word.toLowerCase().match(/[aeiouyáéíóúàèìòùäëïöüâêîôû]/gi);
  if (!vowels) return 1;
  
  // Count vowel groups (consecutive vowels count as one)
  let count = 0;
  let lastWasVowel = false;
  
  for (const char of word.toLowerCase()) {
    const isVowel = /[aeiouyáéíóúàèìòùäëïöüâêîôû]/.test(char);
    if (isVowel && !lastWasVowel) {
      count++;
    }
    lastWasVowel = isVowel;
  }
  
  return Math.max(1, count);
}
