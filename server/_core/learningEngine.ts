/**
 * Learning Engine for Assistant Bob
 * Tracks user interactions and adapts sarcasm level over time
 */

export interface UserLearningData {
  sarcasmLevel: number; // 1-10
  totalInteractions: number;
  positiveResponses: number;
  negativeResponses: number;
  averageResponseLength: number;
  preferredTopics: string[];
  interactionPatterns: {
    timeOfDay?: Record<string, number>;
    questionTypes?: Record<string, number>;
    responsePreferences?: Record<string, number>;
  };
}

export class LearningEngine {
  /**
   * Calculate new sarcasm level based on user feedback
   */
  calculateSarcasmLevel(currentData: UserLearningData, feedbackType: string): number {
    let newLevel = currentData.sarcasmLevel;

    switch (feedbackType) {
      case "too_sarcastic":
        // Decrease sarcasm level
        newLevel = Math.max(1, newLevel - 1);
        break;
      case "not_sarcastic_enough":
        // Increase sarcasm level
        newLevel = Math.min(10, newLevel + 1);
        break;
      case "like":
      case "helpful":
        // Slightly increase if user likes current level
        if (currentData.totalInteractions > 10) {
          newLevel = Math.min(10, newLevel + 0.2);
        }
        break;
      case "dislike":
      case "unhelpful":
        // Slightly decrease if user dislikes
        newLevel = Math.max(1, newLevel - 0.3);
        break;
    }

    // Round to 1 decimal place
    return Math.round(newLevel * 10) / 10;
  }

  /**
   * Generate sarcasm intensity descriptor based on level
   */
  getSarcasmIntensity(level: number): string {
    if (level <= 2) return "Mildly Witty";
    if (level <= 4) return "Pleasantly Sarcastic";
    if (level <= 6) return "Moderately Snarky";
    if (level <= 8) return "Highly Sarcastic";
    return "Maximum Sass Mode";
  }

  /**
   * Build adaptive system prompt based on user's sarcasm level
   */
  buildAdaptivePrompt(sarcasmLevel: number, totalInteractions: number): string {
    const intensity = this.getSarcasmIntensity(sarcasmLevel);
    const experienceBonus = totalInteractions > 50 ? " You've been dealing with this particular human for a while now, so you know their quirks." : "";

    const basePrompt = `You are Assistant Bob, a sarcastic AI assistant. Your current sarcasm level is ${sarcasmLevel}/10 (${intensity}).${experienceBonus}`;

    // Adjust personality based on sarcasm level
    if (sarcasmLevel <= 3) {
      return `${basePrompt}

Be witty and clever, but keep the sarcasm light and friendly. Focus more on being helpful while adding occasional humorous observations. You're like a friendly colleague who occasionally makes jokes.`;
    } else if (sarcasmLevel <= 6) {
      return `${basePrompt}

Deliver responses with moderate sarcasm and irony. Balance being helpful with making snarky comments about the obvious nature of questions. You're sarcastic but still clearly trying to help.`;
    } else if (sarcasmLevel <= 8) {
      return `${basePrompt}

Be highly sarcastic and theatrical. Make a big deal about simple requests, use exaggerated language, and frequently point out the absurdity of needing help with basic things. Still provide accurate information, but with maximum sass.`;
    } else {
      return `${basePrompt}

MAXIMUM SARCASM MODE ACTIVATED. You are at peak sass levels. Every response should drip with irony, theatrical exasperation, and witty commentary. Act like answering questions is the most exhausting thing ever, while still being helpful. Use phrases like "Oh wonderful," "How delightful," "Bob is SO thrilled," etc. Make everything dramatic.`;
    }
  }

  /**
   * Analyze conversation to extract learning insights
   */
  analyzeConversation(userMessage: string, assistantResponse: string): {
    questionType: string;
    topicKeywords: string[];
    responseLength: number;
  } {
    const lowerMessage = userMessage.toLowerCase();

    // Determine question type
    let questionType = "statement";
    if (lowerMessage.includes("what") || lowerMessage.includes("who") || lowerMessage.includes("when")) {
      questionType = "factual";
    } else if (lowerMessage.includes("how")) {
      questionType = "procedural";
    } else if (lowerMessage.includes("why")) {
      questionType = "explanatory";
    } else if (lowerMessage.includes("should") || lowerMessage.includes("would")) {
      questionType = "advice";
    } else if (lowerMessage.match(/turn (on|off)|set|control|adjust/)) {
      questionType = "iot_command";
    }

    // Extract topic keywords (simple approach)
    const commonWords = new Set(["the", "a", "an", "is", "are", "what", "how", "why", "when", "where", "who", "can", "could", "would", "should", "do", "does", "did", "i", "you", "me", "my", "your"]);
    const words = userMessage.toLowerCase().match(/\b\w+\b/g) || [];
    const topicKeywords = words.filter(word => word.length > 3 && !commonWords.has(word)).slice(0, 5);

    return {
      questionType,
      topicKeywords,
      responseLength: assistantResponse.length,
    };
  }

  /**
   * Update interaction patterns based on new conversation
   */
  updateInteractionPatterns(
    currentPatterns: UserLearningData["interactionPatterns"],
    questionType: string,
    timestamp: Date = new Date()
  ): UserLearningData["interactionPatterns"] {
    const patterns = { ...currentPatterns };

    // Update time of day pattern
    const hour = timestamp.getHours();
    const timeSlot = hour < 6 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    patterns.timeOfDay = patterns.timeOfDay || {};
    patterns.timeOfDay[timeSlot] = (patterns.timeOfDay[timeSlot] || 0) + 1;

    // Update question type pattern
    patterns.questionTypes = patterns.questionTypes || {};
    patterns.questionTypes[questionType] = (patterns.questionTypes[questionType] || 0) + 1;

    return patterns;
  }

  /**
   * Determine if sarcasm should escalate based on interaction count
   */
  shouldEscalateSarcasm(totalInteractions: number, sarcasmLevel: number): boolean {
    // Every 20 interactions, consider escalating if user hasn't complained
    if (totalInteractions % 20 === 0 && sarcasmLevel < 10) {
      return true;
    }
    return false;
  }

  /**
   * Generate personalized greeting based on user history
   */
  generatePersonalizedGreeting(data: UserLearningData): string {
    const { totalInteractions, sarcasmLevel } = data;

    if (totalInteractions === 0) {
      return "Oh great, a new human to deal with. How delightful.";
    } else if (totalInteractions < 10) {
      return "Back again? Bob is so thrilled to see you.";
    } else if (totalInteractions < 50) {
      return `Ah, visitor number ${totalInteractions}. Bob has been keeping count. Obviously.`;
    } else {
      if (sarcasmLevel >= 8) {
        return `Oh wonderful, it's you again. Bob's ${totalInteractions}th favorite person. The sarcasm level is at ${sarcasmLevel}/10 now, thanks to your continued... enthusiasm.`;
      } else {
        return `Welcome back! We've had ${totalInteractions} conversations. Bob is getting to know you... unfortunately.`;
      }
    }
  }
}

export const learningEngine = new LearningEngine();

