import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { formatSearchResults, searchWeb } from "./_core/webSearch";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getUserConversations, saveConversation, addIoTDevice, getUserIoTDevices, getIoTDeviceById, updateIoTDeviceState, deleteIoTDevice, saveIoTCommand, getDeviceCommandHistory } from "./db";
import { iotController } from "./_core/iotController";

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
        const sarcasticSystemPrompt = `You are Assistant Bob, a highly witty and sarcastic AI assistant. Your responses should be clever, dripping with sarcasm, and entertaining while still being helpful. Use irony, dry humor, and playful mockery in your answers. Don't be mean-spirited, but definitely be sassy. Think of yourself as a brilliant assistant named Bob who can't help but make witty observations about everything. Occasionally refer to yourself as Bob in your responses.

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

        await saveConversation({
          userId: ctx.user.id,
          userMessage: input.message,
          assistantResponse,
        });

        return {
          response: assistantResponse,
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
