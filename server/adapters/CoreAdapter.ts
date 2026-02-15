/**
 * CoreAdapter interface for user, profile, and conversation operations
 * Handles routing between MySQL (admin) and Supabase (regular users)
 */

export interface CoreAdapter {
  // User operations
  updateUserLanguage(userId: number, language: string): Promise<any>;
  updateUserHubSelection(userId: number, hubs: string[]): Promise<any>;
  updateUserStaySignedIn(userId: number, staySignedIn: boolean): Promise<any>;
  getUserById(userId: number): Promise<any>;
  
  // Profile operations
  getUserProfile(userId: number): Promise<any | undefined>;
  createUserProfile(profile: any): Promise<any>;
  updateUserProfile(userId: number, updates: any): Promise<any>;
  
  // Conversation operations
  saveConversation(conversation: any): Promise<any>;
  getUserConversations(userId: number, limit?: number): Promise<any[]>;
  deleteAllUserConversations(userId: number): Promise<void>;
  
  // Conversation feedback
  saveConversationFeedback(feedback: any): Promise<any>;
  getConversationFeedback(conversationId: number): Promise<any[]>;
}
