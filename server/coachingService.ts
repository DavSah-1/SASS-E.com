/**
 * AI-Powered Adaptive Coaching Service
 * Generates personalized wellness recommendations based on user profile and progress data
 */

import { invokeLLM } from "./_core/llm";
import type { WellnessProfile, UserWorkoutHistory, FoodLog, MoodLog, HealthMetric } from "../drizzle/schema";

interface CoachingContext {
  profile: WellnessProfile;
  recentWorkouts: UserWorkoutHistory[];
  recentMeals: FoodLog[];
  recentMoods: MoodLog[];
  recentMetrics: HealthMetric[];
  daysSinceOnboarding: number;
}

interface GeneratedRecommendation {
  type: "workout" | "nutrition" | "mental_wellness" | "sleep" | "general";
  title: string;
  content: string;
  reasoning: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  actionUrl?: string;
}

/**
 * Generate personalized coaching recommendations using AI
 */
export async function generateCoachingRecommendations(
  context: CoachingContext
): Promise<GeneratedRecommendation[]> {
  const { profile, recentWorkouts, recentMeals, recentMoods, recentMetrics, daysSinceOnboarding } = context;

  // Parse JSON fields
  const goals = JSON.parse(profile.primaryGoals || "[]");
  const challenges = JSON.parse(profile.challenges || "[]");
  const equipment = JSON.parse(profile.availableEquipment || "[]");
  const preferredWorkouts = JSON.parse(profile.preferredWorkoutTypes || "[]");

  // Build context for AI
  const prompt = `You are an expert wellness coach. Analyze the following user data and generate 3-5 personalized, actionable recommendations.

USER PROFILE:
- Fitness Level: ${profile.fitnessLevel}
- Primary Goals: ${goals.join(", ")}
- Activity Level: ${profile.activityLevel}
- Sleep: ${profile.sleepHoursPerNight} hours/night
- Diet Preference: ${profile.dietPreference}
- Target Workouts: ${profile.workoutDaysPerWeek} days/week, ${profile.workoutDurationPreference} min each
- Challenges: ${challenges.join(", ")}
- Available Equipment: ${equipment.join(", ")}
- Preferred Workout Types: ${preferredWorkouts.join(", ")}
- Days Since Starting: ${daysSinceOnboarding}

RECENT ACTIVITY (Last 7 Days):
- Workouts Completed: ${recentWorkouts.length} (Target: ${profile.workoutDaysPerWeek})
- Meals Logged: ${recentMeals.length}
- Average Mood: ${calculateAverageMood(recentMoods)}
- Weight Trend: ${analyzeWeightTrend(recentMetrics)}

ANALYSIS NEEDED:
1. Are they meeting their workout frequency goals?
2. Is their workout intensity appropriate for their fitness level?
3. Are there patterns in their mood or energy that suggest needed changes?
4. Based on their goals, what should they focus on next?
5. What specific, actionable steps can help them overcome their challenges?

Generate 3-5 recommendations as a JSON array. Each recommendation should have:
- type: "workout" | "nutrition" | "mental_wellness" | "sleep" | "general"
- title: Brief, motivating title (max 50 chars)
- content: Detailed, actionable advice (2-3 sentences)
- reasoning: Why this recommendation matters for their goals (1 sentence)
- priority: "low" | "medium" | "high"
- actionable: true if they can act on it immediately
- actionUrl: Optional link to relevant section (e.g., "/wellness?tab=fitness")

Focus on:
- Specific, measurable actions
- Addressing their stated challenges
- Progressive overload for their fitness level
- Celebrating progress and maintaining motivation
- Realistic adjustments based on their lifestyle

Return ONLY the JSON array, no additional text.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert wellness coach who provides personalized, evidence-based recommendations. Always return valid JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "coaching_recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["workout", "nutrition", "mental_wellness", "sleep", "general"],
                    },
                    title: { type: "string" },
                    content: { type: "string" },
                    reasoning: { type: "string" },
                    priority: {
                      type: "string",
                      enum: ["low", "medium", "high"],
                    },
                    actionable: { type: "boolean" },
                    actionUrl: { type: "string" },
                  },
                  required: ["type", "title", "content", "reasoning", "priority", "actionable"],
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (error) {
    console.error("Error generating coaching recommendations:", error);
    // Return fallback recommendations
    return getFallbackRecommendations(profile, recentWorkouts);
  }
}

/**
 * Calculate average mood from recent mood logs
 */
function calculateAverageMood(moods: MoodLog[]): string {
  if (moods.length === 0) return "No data";

  const moodValues: Record<string, number> = {
    terrible: 1,
    bad: 2,
    okay: 3,
    good: 4,
    great: 5,
  };

  const sum = moods.reduce((acc, mood) => acc + (moodValues[mood.mood] || 3), 0);
  const avg = sum / moods.length;

  if (avg >= 4.5) return "Great";
  if (avg >= 3.5) return "Good";
  if (avg >= 2.5) return "Okay";
  if (avg >= 1.5) return "Below Average";
  return "Poor";
}

/**
 * Analyze weight trend from recent metrics
 */
function analyzeWeightTrend(metrics: HealthMetric[]): string {
  const weightsWithDates = metrics
    .filter((m) => m.weight)
    .map((m) => ({ weight: m.weight! / 1000, date: m.date })) // Convert grams to kg
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (weightsWithDates.length < 2) return "Insufficient data";

  const first = weightsWithDates[0].weight;
  const last = weightsWithDates[weightsWithDates.length - 1].weight;
  const change = last - first;

  if (Math.abs(change) < 0.5) return "Stable";
  if (change > 0) return `+${change.toFixed(1)}kg`;
  return `${change.toFixed(1)}kg`;
}

/**
 * Fallback recommendations if AI fails
 */
function getFallbackRecommendations(
  profile: WellnessProfile,
  recentWorkouts: UserWorkoutHistory[]
): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = [];

  // Check workout frequency
  const workoutGap = (profile.workoutDaysPerWeek || 3) - recentWorkouts.length;
  if (workoutGap > 0) {
    recommendations.push({
      type: "workout",
      title: "Catch Up on Your Workouts",
      content: `You've completed ${recentWorkouts.length} workouts this week, but your goal is ${profile.workoutDaysPerWeek}. Try to fit in ${workoutGap} more session${workoutGap > 1 ? "s" : ""} before the week ends!`,
      reasoning: "Consistency is key to reaching your fitness goals.",
      priority: "high",
      actionable: true,
      actionUrl: "/wellness?tab=fitness",
    });
  }

  // Beginner encouragement
  if (profile.fitnessLevel === "beginner" && recentWorkouts.length > 0) {
    recommendations.push({
      type: "general",
      title: "You're Building Great Habits!",
      content: "As a beginner, showing up consistently is the most important thing. Focus on form over intensity, and remember that rest days are just as important as workout days.",
      reasoning: "Building sustainable habits leads to long-term success.",
      priority: "medium",
      actionable: false,
    });
  }

  // Hydration reminder
  recommendations.push({
    type: "nutrition",
    title: "Stay Hydrated Throughout the Day",
    content: "Aim for 2-3 liters of water daily. Set reminders on your phone or keep a water bottle at your desk. Proper hydration improves energy, focus, and workout performance.",
    reasoning: "Hydration is essential for all wellness goals.",
    priority: "medium",
    actionable: true,
    actionUrl: "/wellness?tab=nutrition",
  });

  return recommendations;
}

/**
 * Generate quick daily insight based on recent activity
 */
export async function generateDailyInsight(context: CoachingContext): Promise<string> {
  const { profile, recentWorkouts, recentMoods } = context;

  const goals = JSON.parse(profile.primaryGoals || "[]");
  const avgMood = calculateAverageMood(recentMoods);

  const prompt = `Generate a brief, motivating daily insight (1-2 sentences) for a wellness app user.

User Info:
- Goals: ${goals.join(", ")}
- Fitness Level: ${profile.fitnessLevel}
- Recent Workouts: ${recentWorkouts.length} in past 7 days
- Average Mood: ${avgMood}

Create an encouraging, personalized message that:
- Acknowledges their progress or current state
- Provides a small, actionable tip
- Stays positive and motivating

Return only the insight text, no JSON or formatting.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a supportive wellness coach providing daily motivation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }
    return "Keep up the great work! Every step forward counts.";
  } catch (error) {
    console.error("Error generating daily insight:", error);
    return "Remember: progress, not perfection. You're doing great!";
  }
}
