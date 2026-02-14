import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getSupabaseAdminClient } from "./supabaseClient";
import { 
  createNotificationAdapter, 
  createBudgetAdapter, 
  createDebtAdapter, 
  createLearningAdapter, 
  createIoTAdapter, 
  createGoalsAdapter, 
  createTranslationAdapter 
} from './adapters';

describe("Translate Chat System", () => {
  let testUser: any;
  let caller: any;

  beforeAll(async () => {
    // Mock user for testing (using UUID for Supabase)
    testUser = {
      id: "550e8400-e29b-41d4-a716-446655440001", // UUID string
      numericId: 1, // For MySQL compatibility
      openId: "test-user-123",
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    // Ensure test users exist in Supabase
    const supabase = getSupabaseAdminClient();
    const { error: userError } = await supabase.from('users').upsert({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      role: testUser.role,
      preferred_language: testUser.preferredLanguage,
      created_at: testUser.createdAt,
      updated_at: testUser.updatedAt,
      last_signed_in: testUser.lastSignedIn,
    }, { onConflict: 'id' });
    if (userError) {
      console.error('Failed to create test user:', userError);
      throw userError;
    }

    // Create adapters for test context
    const adapterContext = { user: testUser, accessToken: process.env.SUPABASE_SERVICE_KEY || "" };
    const notificationDb = createNotificationAdapter(adapterContext);
    const budgetDb = createBudgetAdapter(adapterContext);
    const debtDb = createDebtAdapter(adapterContext);
    const learningDb = createLearningAdapter(adapterContext);
    const iotDb = createIoTAdapter(adapterContext);
    const goalsDb = createGoalsAdapter(adapterContext);
    const translationDb = createTranslationAdapter(adapterContext);

    // Create caller with mock context
    caller = appRouter.createCaller({
      user: testUser,
      accessToken: process.env.SUPABASE_SERVICE_KEY || "",
      req: {} as any,
      res: {} as any,
      notificationDb,
      budgetDb,
      debtDb,
      learningDb,
      iotDb,
      goalsDb,
      translationDb,
    });
  });

  it("should create a conversation with shareable link", async () => {
    const result = await caller.translateChat.createConversation({
      title: "Test Conversation",
    });

    expect(result).toHaveProperty("conversationId");
    expect(result).toHaveProperty("shareableCode");
    expect(result).toHaveProperty("shareableLink");
    expect(result.shareableCode).toMatch(/^[A-Za-z0-9]{12}$/);
    expect(result.shareableLink).toContain(result.shareableCode);
  });

  it("should join a conversation via shareable code", async () => {
    // First create a conversation
    const created = await caller.translateChat.createConversation({
      title: "Join Test",
    });

    // Create a second user caller
    const secondUser = {
      ...testUser,
      id: "550e8400-e29b-41d4-a716-446655440002", // UUID string
      numericId: 2, // For MySQL compatibility
      openId: "test-user-456",
      name: "Second User",
      preferredLanguage: "es",
    };

    // Ensure second user exists in Supabase
    const supabase = getSupabaseAdminClient();
    const { error: user2Error } = await supabase.from('users').upsert({
      id: secondUser.id,
      email: secondUser.email,
      name: secondUser.name,
      role: secondUser.role,
      preferred_language: secondUser.preferredLanguage,
      created_at: secondUser.createdAt,
      updated_at: secondUser.updatedAt,
      last_signed_in: secondUser.lastSignedIn,
    }, { onConflict: 'id' });
    if (user2Error) {
      console.error('Failed to create second test user:', user2Error);
      throw user2Error;
    }

    const secondCaller = appRouter.createCaller({
      user: secondUser,
      accessToken: process.env.SUPABASE_SERVICE_KEY || "",
      req: {} as any,
      res: {} as any,
    });

    // Join the conversation
    const joined = await secondCaller.translateChat.joinConversation({
      shareableCode: created.shareableCode,
    });

    expect(joined).toHaveProperty("conversationId");
    expect(joined.conversationId).toBe(created.conversationId);
  });

  it("should get conversation details with participants", async () => {
    // Create a conversation
    const created = await caller.translateChat.createConversation({
      title: "Details Test",
    });

    // Get conversation details
    const details = await caller.translateChat.getConversation({
      shareableCode: created.shareableCode,
    });

    expect(details).toHaveProperty("conversation");
    expect(details).toHaveProperty("participants");
    expect(details.conversation.id).toBe(created.conversationId);
    expect(details.participants.length).toBeGreaterThan(0);
    expect(details.participants[0]).toHaveProperty("preferredLanguage");
  });

  it("should send a message in a conversation", async () => {
    // Create a conversation
    const created = await caller.translateChat.createConversation({
      title: "Message Test",
    });

    // Send a message
    const sent = await caller.translateChat.sendMessage({
      conversationId: created.conversationId,
      text: "Hello, this is a test message!",
    });

    expect(sent).toHaveProperty("messageId");
    expect(sent.messageId).toBeGreaterThan(0);
  });

  it("should retrieve messages with translations", async () => {
    // Create a conversation
    const created = await caller.translateChat.createConversation({
      title: "Messages Test",
    });

    // Send a message
    await caller.translateChat.sendMessage({
      conversationId: created.conversationId,
      text: "Test message for retrieval",
    });

    // Get messages
    const messages = await caller.translateChat.getMessages({
      conversationId: created.conversationId,
    });

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toHaveProperty("originalText");
    expect(messages[0]).toHaveProperty("translatedText");
    expect(messages[0]).toHaveProperty("isMine");
  });

  it("should translate messages for users with different languages", async () => {
    // Create a conversation
    const created = await caller.translateChat.createConversation({
      title: "Translation Test",
    });

    // Create a Spanish-speaking user
    const spanishUser = {
      ...testUser,
      id: "550e8400-e29b-41d4-a716-446655440003", // UUID string
      numericId: 3, // For MySQL compatibility
      openId: "test-user-789",
      name: "Spanish User",
      preferredLanguage: "es",
    };

    // Ensure Spanish user exists in Supabase
    const supabase = getSupabaseAdminClient();
    const { error: user3Error } = await supabase.from('users').upsert({
      id: spanishUser.id,
      email: `spanish-${Date.now()}@test.com`,
      name: spanishUser.name,
      role: spanishUser.role,
      preferred_language: spanishUser.preferredLanguage,
      created_at: spanishUser.createdAt,
      updated_at: spanishUser.updatedAt,
      last_signed_in: spanishUser.lastSignedIn,
    }, { onConflict: 'id' });
    if (user3Error) {
      console.error('Failed to create Spanish test user:', user3Error);
      throw user3Error;
    }

    const spanishCaller = appRouter.createCaller({
      user: spanishUser,
      accessToken: process.env.SUPABASE_SERVICE_KEY || "",
      req: {} as any,
      res: {} as any,
    });

    // Join the conversation
    await spanishCaller.translateChat.joinConversation({
      shareableCode: created.shareableCode,
    });

    // English user sends a message
    await caller.translateChat.sendMessage({
      conversationId: created.conversationId,
      text: "Hello, how are you?",
    });

    // Spanish user retrieves messages (should be translated)
    const messages = await spanishCaller.translateChat.getMessages({
      conversationId: created.conversationId,
    });

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].originalLanguage).toBe("en");
    expect(messages[0].targetLanguage).toBe("es");
    // Translation should be different from original (unless translation fails)
    // We can't guarantee exact translation, but we can check structure
    expect(messages[0]).toHaveProperty("translatedText");
  });

  it("should list user's conversations", async () => {
    // Create a conversation
    await caller.translateChat.createConversation({
      title: "List Test",
    });

    // Get user's conversations
    const conversations = await caller.translateChat.getMyConversations();

    expect(Array.isArray(conversations)).toBe(true);
    expect(conversations.length).toBeGreaterThan(0);
    expect(conversations[0]).toHaveProperty("id");
    expect(conversations[0]).toHaveProperty("shareableCode");
    expect(conversations[0]).toHaveProperty("title");
  });

  it("should allow user to leave a conversation", async () => {
    // Create a conversation
    const created = await caller.translateChat.createConversation({
      title: "Leave Test",
    });

    // Leave the conversation
    const result = await caller.translateChat.leaveConversation({
      conversationId: created.conversationId,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });
});
