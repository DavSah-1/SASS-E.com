import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { formatSearchResults, searchWeb } from "./_core/webSearch";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getUserConversations, saveConversation, addIoTDevice, getUserIoTDevices, getIoTDeviceById, updateIoTDeviceState, deleteIoTDevice, saveIoTCommand, getDeviceCommandHistory, getUserProfile, createUserProfile, updateUserProfile, saveConversationFeedback, saveLearningSession, saveFactCheckResult, saveLearningSource, getUserLearningSessions, getFactCheckResultsBySession, saveStudyGuide, saveQuiz, getUserQuizzes, saveQuizAttempt, getQuizAttempts } from "./db";
import { iotController } from "./_core/iotController";
import { learningEngine } from "./_core/learningEngine";
import { languageLearningRouter } from "./languageLearningRouter";
import { debtCoachRouter } from "./debtCoachRouter";
import { budgetRouter } from "./budgetRouter";

export const appRouter = router({
  system: systemRouter,
  languageLearning: languageLearningRouter,
  debtCoach: debtCoachRouter,
  budget: budgetRouter,

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

        // Step 1: Generate explanation with Bob's personality
        const systemPrompt = `You are Agent Bob, a ${personalityDesc} AI learning assistant. Explain topics clearly and accurately, but with your signature wit and sarcasm. Break down complex concepts into understandable parts. Keep explanations concise (3-5 paragraphs) but comprehensive.`;

        const explanationResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Explain: ${input.question}` },
          ],
        });

        const explanationContent = explanationResponse.choices[0].message.content;
        const explanation = typeof explanationContent === 'string' ? explanationContent : JSON.stringify(explanationContent);

        // Step 2: Extract key claims for fact-checking
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

        // Step 3: Fact-check each claim using web search
        const factCheckResults = [];
        let totalConfidence = 0;
        let sourcesCount = 0;

        for (const claim of claims) {
          // Search for verification
          const searchResults = await searchWeb(claim, 3);

          // Analyze search results for verification
          const verificationPrompt = `Based on these search results, verify this claim: "${claim}"\n\nSearch Results:\n${JSON.stringify(searchResults.results.slice(0, 3))}\n\nProvide verification status (verified/disputed/debunked/unverified), confidence score (0-100), and brief explanation.`;
          
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

        // Step 4: Save to database
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

  translation: router({
    // Translate text with personality preservation
    translate: protectedProcedure
      .input(
        z.object({
          text: z.string(),
          sourceLanguage: z.string(),
          targetLanguage: z.string(),
          preservePersonality: z.boolean().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get user profile for personality level
        const profile = await getUserProfile(ctx.user.id);
        const sarcasmLevel = profile?.sarcasmLevel || 5;

        let translationPrompt;
        if (input.preservePersonality) {
          const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);
          translationPrompt = `You are Agent Bob, a ${personalityDesc} AI assistant. Translate the following text from ${input.sourceLanguage} to ${input.targetLanguage} while maintaining your sarcastic, witty personality. Keep the tone natural and conversational in the target language.\n\nText to translate: "${input.text}"`;
        } else {
          translationPrompt = `Translate the following text from ${input.sourceLanguage} to ${input.targetLanguage}. Provide only the translation without any additional commentary.\n\nText: "${input.text}"`;
        }

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a helpful translation assistant." },
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

    // Chat with automatic translation
    chatWithTranslation: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          inputLanguage: z.string(),
          outputLanguage: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get user profile
        let userProfile = await getUserProfile(ctx.user.id);
        if (!userProfile) {
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
          userProfile = await getUserProfile(ctx.user.id);
        }

        const sarcasmLevel = userProfile?.sarcasmLevel || 5;
        const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Step 1: Translate user message to English (if needed)
        let englishMessage = input.message;
        if (input.inputLanguage.toLowerCase() !== 'english') {
          const translateToEnglish = await invokeLLM({
            messages: [
              { role: "system", content: "You are a translation assistant. Translate to English." },
              { role: "user", content: `Translate from ${input.inputLanguage} to English: "${input.message}"` },
            ],
          });
          const toEnglishContent = translateToEnglish.choices[0].message.content;
          englishMessage = (typeof toEnglishContent === 'string' ? toEnglishContent : JSON.stringify(toEnglishContent)).trim();
        }

        // Step 2: Generate response in English with personality
        const sarcasticSystemPrompt = `You are Agent Bob, a ${personalityDesc} AI assistant. Respond to the user with wit, sarcasm, and clever humor. Keep responses concise (2-3 sentences) but impactful.`;

        const englishResponse = await invokeLLM({
          messages: [
            { role: "system", content: sarcasticSystemPrompt },
            { role: "user", content: englishMessage },
          ],
        });

        const responseContent = englishResponse.choices[0].message.content;
        const responseText = typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent);

        // Step 3: Translate response to target language (if needed)
        let translatedResponse = responseText;
        if (input.outputLanguage.toLowerCase() !== 'english') {
          const translateResponse = await invokeLLM({
            messages: [
              { role: "system", content: "You are a translation assistant." },
              { role: "user", content: `Translate from English to ${input.outputLanguage} while maintaining the sarcastic, witty tone: "${responseText}"` },
            ],
          });
          const translatedContent = translateResponse.choices[0].message.content;
          translatedResponse = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
        }

        // Save conversation
        await saveConversation({
          userId: ctx.user.id,
          userMessage: input.message,
          assistantResponse: translatedResponse,
        });

        // Update interaction count
        if (userProfile) {
          await updateUserProfile(ctx.user.id, {
            totalInteractions: userProfile.totalInteractions + 1,
          });
        }

        return {
          originalMessage: input.message,
          translatedMessage: englishMessage !== input.message ? englishMessage : null,
          response: translatedResponse,
          englishResponse: responseText !== translatedResponse ? responseText : null,
          inputLanguage: input.inputLanguage,
          outputLanguage: input.outputLanguage,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
