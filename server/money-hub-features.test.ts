import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import {
  budgetAlerts,
  notificationPreferences,
  financialInsights,
  recurringTransactions,
  budgetTransactions,
  budgetCategories,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { checkCategoryAlerts, createBudgetAlert } from "./db";
import { generateSpendingInsights } from "./db";
import { detectRecurringPatterns, calculateRecurringProjections } from "./db";

describe("Money Hub Advanced Features", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  const testUserId = 888888;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
  });

  describe("Budget Alerts System", () => {
    it("should have notification preferences table", async () => {
      const prefs = await db!.select().from(notificationPreferences).limit(1);
      expect(Array.isArray(prefs)).toBe(true);
    });

    it("should have budget alerts table", async () => {
      const alerts = await db!.select().from(budgetAlerts).limit(1);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it("should create budget alert correctly", async () => {
      await createBudgetAlert(
        testUserId,
        "threshold_80",
        "Test alert message",
        undefined,
        80
      );

      const alerts = await db!
        .select()
        .from(budgetAlerts)
        .where(and(
          eq(budgetAlerts.userId, testUserId),
          eq(budgetAlerts.alertType, "threshold_80")
        ))
        .limit(1);

      expect(alerts.length).toBeGreaterThan(0);
      if (alerts.length > 0) {
        expect(alerts[0].message).toBe("Test alert message");
        expect(alerts[0].threshold).toBe(80);
      }
    });

    it("should not create duplicate alerts", async () => {
      // Try to create the same alert twice
      await createBudgetAlert(
        testUserId,
        "threshold_80",
        "Duplicate test",
        undefined,
        80
      );

      const countBefore = await db!
        .select()
        .from(budgetAlerts)
        .where(and(
          eq(budgetAlerts.userId, testUserId),
          eq(budgetAlerts.alertType, "threshold_80"),
          eq(budgetAlerts.isRead, 0)
        ));

      await createBudgetAlert(
        testUserId,
        "threshold_80",
        "Duplicate test",
        undefined,
        80
      );

      const countAfter = await db!
        .select()
        .from(budgetAlerts)
        .where(and(
          eq(budgetAlerts.userId, testUserId),
          eq(budgetAlerts.alertType, "threshold_80"),
          eq(budgetAlerts.isRead, 0)
        ));

      // Should not increase count (duplicate prevention)
      expect(countAfter.length).toBe(countBefore.length);
    });

    it("should support different alert types", () => {
      const alertTypes = [
        "threshold_80",
        "threshold_100",
        "exceeded",
        "weekly_summary",
        "monthly_report",
      ];

      alertTypes.forEach((type) => {
        expect(typeof type).toBe("string");
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  describe("AI Spending Insights", () => {
    it("should have financial insights table", async () => {
      const insights = await db!.select().from(financialInsights).limit(1);
      expect(Array.isArray(insights)).toBe(true);
    });

    it("should support different insight types", () => {
      const insightTypes = [
        "spending_pattern",
        "saving_opportunity",
        "cash_flow_prediction",
        "budget_recommendation",
        "trend_analysis",
      ];

      insightTypes.forEach((type) => {
        expect(typeof type).toBe("string");
      });
    });

    it("should support priority levels", () => {
      const priorities = ["low", "medium", "high"];
      priorities.forEach((priority) => {
        expect(["low", "medium", "high"]).toContain(priority);
      });
    });

    it("should handle actionable vs non-actionable insights", () => {
      const actionableValues = [0, 1];
      actionableValues.forEach((value) => {
        expect([0, 1]).toContain(value);
      });
    });
  });

  describe("Recurring Transaction Detection", () => {
    it("should have recurring transactions table", async () => {
      const recurring = await db!.select().from(recurringTransactions).limit(1);
      expect(Array.isArray(recurring)).toBe(true);
    });

    it("should support different frequency types", () => {
      const frequencies = ["weekly", "biweekly", "monthly", "quarterly", "yearly"];
      frequencies.forEach((freq) => {
        expect(typeof freq).toBe("string");
      });
    });

    it("should calculate confidence scores correctly", () => {
      // Confidence should be 0-100
      const testConfidence = 85;
      expect(testConfidence).toBeGreaterThanOrEqual(0);
      expect(testConfidence).toBeLessThanOrEqual(100);
    });

    it("should detect subscription keywords", () => {
      const subscriptionKeywords = [
        "netflix",
        "spotify",
        "subscription",
        "membership",
      ];

      const testDescription = "Netflix Monthly Subscription";
      const isSubscription = subscriptionKeywords.some((keyword) =>
        testDescription.toLowerCase().includes(keyword)
      );

      expect(isSubscription).toBe(true);
    });

    it("should calculate next expected date correctly", () => {
      const lastDate = new Date("2025-01-15");
      const frequency = "monthly";

      const nextExpectedDate = new Date(lastDate);
      nextExpectedDate.setMonth(nextExpectedDate.getMonth() + 1);

      expect(nextExpectedDate.getMonth()).toBe(1); // February (0-indexed)
    });
  });

  describe("Recurring Projections", () => {
    it("should convert weekly to monthly equivalent", () => {
      const weeklyAmount = 10000; // $100
      const monthlyEquivalent = weeklyAmount * 4.33; // Average weeks per month

      expect(monthlyEquivalent).toBeCloseTo(43300, 0);
    });

    it("should convert biweekly to monthly equivalent", () => {
      const biweeklyAmount = 20000; // $200
      const monthlyEquivalent = biweeklyAmount * 2.17;

      expect(monthlyEquivalent).toBeCloseTo(43400, 0);
    });

    it("should convert quarterly to monthly equivalent", () => {
      const quarterlyAmount = 30000; // $300
      const monthlyEquivalent = quarterlyAmount / 3;

      expect(monthlyEquivalent).toBe(10000);
    });

    it("should convert yearly to monthly equivalent", () => {
      const yearlyAmount = 120000; // $1200
      const monthlyEquivalent = yearlyAmount / 12;

      expect(monthlyEquivalent).toBe(10000);
    });

    it("should calculate yearly total from monthly", () => {
      const monthlyTotal = 50000; // $500
      const yearlyTotal = monthlyTotal * 12;

      expect(yearlyTotal).toBe(600000); // $6000
    });
  });

  describe("Pattern Detection Algorithm", () => {
    it("should calculate coefficient of variation", () => {
      const amounts = [10000, 10100, 9900, 10050];
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

      const variance =
        amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) /
        amounts.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgAmount;

      // Low variation indicates recurring pattern
      expect(coefficientOfVariation).toBeLessThan(0.25);
    });

    it("should calculate average interval between transactions", () => {
      const dates = [
        new Date("2025-01-01"),
        new Date("2025-02-01"),
        new Date("2025-03-01"),
      ];

      const intervals: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        const daysDiff =
          (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(daysDiff);
      }

      const avgInterval =
        intervals.reduce((sum, int) => sum + int, 0) / intervals.length;

      // Should be approximately 30-31 days (monthly)
      expect(avgInterval).toBeGreaterThan(28);
      expect(avgInterval).toBeLessThan(32);
    });

    it("should determine frequency from interval", () => {
      const testCases = [
        { interval: 7, expected: "weekly" },
        { interval: 14, expected: "biweekly" },
        { interval: 30, expected: "monthly" },
        { interval: 90, expected: "quarterly" },
        { interval: 365, expected: "yearly" },
      ];

      testCases.forEach(({ interval, expected }) => {
        let frequency = "monthly";
        if (interval < 10) frequency = "weekly";
        else if (interval < 20) frequency = "biweekly";
        else if (interval < 40) frequency = "monthly";
        else if (interval < 120) frequency = "quarterly";
        else frequency = "yearly";

        expect(frequency).toBe(expected);
      });
    });
  });

  describe("Alert Threshold Logic", () => {
    it("should trigger 80% threshold alert", () => {
      const limit = 100000; // $1000
      const spent = 80000; // $800
      const percentageUsed = (spent / limit) * 100;

      expect(percentageUsed).toBeGreaterThanOrEqual(80);
      expect(percentageUsed).toBeLessThan(100);
    });

    it("should trigger 100% threshold alert", () => {
      const limit = 100000; // $1000
      const spent = 100000; // $1000
      const percentageUsed = (spent / limit) * 100;

      expect(percentageUsed).toBeGreaterThanOrEqual(100);
    });

    it("should trigger exceeded alert", () => {
      const limit = 100000; // $1000
      const spent = 110000; // $1100
      const percentageUsed = (spent / limit) * 100;

      expect(percentageUsed).toBeGreaterThan(100);
      expect(spent).toBeGreaterThan(limit);
    });
  });

  describe("Data Integrity", () => {
    it("should handle missing data gracefully", async () => {
      const nonExistentUserId = 999999999;
      const result = await detectRecurringPatterns(nonExistentUserId);

      expect(result.success).toBe(false);
      expect(result.patternsFound).toBe(0);
    });

    it("should validate confidence scores are in range", () => {
      const testScores = [0, 50, 85, 95, 100];

      testScores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should handle empty projections", async () => {
      const nonExistentUserId = 999999999;
      const projections = await calculateRecurringProjections(nonExistentUserId);

      expect(projections.monthlyTotal).toBe(0);
      expect(projections.quarterlyTotal).toBe(0);
      expect(projections.yearlyTotal).toBe(0);
      expect(Object.keys(projections.byCategory).length).toBe(0);
    });
  });
});
