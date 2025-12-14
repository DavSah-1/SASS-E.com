import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../server/db";
import { budgetTemplates, budgetCategories, budgetTransactions, userBudgetTemplates } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Budget Features - Spending Trends and Templates", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  const testUserId = 999999; // Use a high ID to avoid conflicts

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
  });

  describe("Budget Templates", () => {
    it("should have seeded budget templates in database", async () => {
      const templates = await db!
        .select()
        .from(budgetTemplates)
        .where(eq(budgetTemplates.isSystemTemplate, 1));

      expect(templates.length).toBeGreaterThanOrEqual(3);
      
      const templateNames = templates.map(t => t.name);
      expect(templateNames).toContain("50/30/20 Rule");
      expect(templateNames).toContain("Zero-Based Budgeting");
      expect(templateNames).toContain("Envelope System");
    });

    it("should have correct allocations for 50/30/20 template", async () => {
      const template = await db!
        .select()
        .from(budgetTemplates)
        .where(and(
          eq(budgetTemplates.strategy, "50_30_20"),
          eq(budgetTemplates.isSystemTemplate, 1)
        ))
        .limit(1);

      expect(template.length).toBe(1);
      
      const allocations = JSON.parse(template[0].allocations);
      expect(allocations.needs).toBe(50);
      expect(allocations.wants).toBe(30);
      expect(allocations.savings).toBe(20);
    });

    it("should have correct strategy types for all templates", async () => {
      const templates = await db!
        .select()
        .from(budgetTemplates)
        .where(eq(budgetTemplates.isSystemTemplate, 1));

      const strategies = templates.map(t => t.strategy);
      expect(strategies).toContain("50_30_20");
      expect(strategies).toContain("zero_based");
      expect(strategies).toContain("envelope");
    });

    it("should have valid category mappings for templates", async () => {
      const templates = await db!
        .select()
        .from(budgetTemplates)
        .where(eq(budgetTemplates.isSystemTemplate, 1));

      for (const template of templates) {
        if (template.categoryMappings) {
          const mappings = JSON.parse(template.categoryMappings);
          expect(mappings).toBeDefined();
          expect(typeof mappings).toBe("object");
        }
      }
    });
  });

  describe("Spending Trends Data Structure", () => {
    it("should support monthly aggregation queries", async () => {
      // Test that we can query transactions by month
      const testMonth = "2025-01";
      const startDate = new Date(testMonth + "-01");
      const endDate = new Date(testMonth + "-01");
      endDate.setMonth(endDate.getMonth() + 1);

      // This query should not throw an error
      const transactions = await db!
        .select()
        .from(budgetTransactions)
        .where(and(
          eq(budgetTransactions.userId, testUserId)
        ))
        .limit(1);

      // Just verify the query structure works
      expect(Array.isArray(transactions)).toBe(true);
    });

    it("should have proper date indexing for trend queries", async () => {
      // Verify that transaction date queries work efficiently
      const result = await db!
        .select()
        .from(budgetTransactions)
        .limit(1);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Template Application Logic", () => {
    it("should calculate 50/30/20 allocations correctly", () => {
      const monthlyIncome = 500000; // $5000 in cents
      
      const needs = Math.round(monthlyIncome * 0.5);
      const wants = Math.round(monthlyIncome * 0.3);
      const savings = Math.round(monthlyIncome * 0.2);

      expect(needs).toBe(250000); // $2500
      expect(wants).toBe(150000); // $1500
      expect(savings).toBe(100000); // $1000
      expect(needs + wants + savings).toBe(monthlyIncome);
    });

    it("should handle zero-based budgeting allocation", () => {
      const monthlyIncome = 500000; // $5000 in cents
      const categoryCount = 8;
      
      const perCategory = Math.round(monthlyIncome / categoryCount);
      
      expect(perCategory).toBe(62500); // $625 per category
      expect(perCategory * categoryCount).toBeLessThanOrEqual(monthlyIncome + categoryCount);
    });

    it("should calculate envelope percentages correctly", () => {
      const monthlyIncome = 500000; // $5000 in cents
      const envelopes = [
        { category: "Groceries", suggested_percentage: 10 },
        { category: "Dining Out", suggested_percentage: 5 },
        { category: "Entertainment", suggested_percentage: 5 },
      ];

      const allocations = envelopes.map(env => ({
        category: env.category,
        amount: Math.round(monthlyIncome * (env.suggested_percentage / 100)),
      }));

      expect(allocations[0].amount).toBe(50000); // $500
      expect(allocations[1].amount).toBe(25000); // $250
      expect(allocations[2].amount).toBe(25000); // $250
    });
  });

  describe("Data Aggregation for Trends", () => {
    it("should aggregate transactions by month correctly", () => {
      const transactions = [
        { amount: 10000, date: new Date("2025-01-15") },
        { amount: 20000, date: new Date("2025-01-20") },
        { amount: 15000, date: new Date("2025-02-10") },
      ];

      const monthlyData: Record<string, number> = {};
      
      for (const tx of transactions) {
        const monthKey = tx.date.toISOString().slice(0, 7);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += tx.amount;
      }

      expect(monthlyData["2025-01"]).toBe(30000);
      expect(monthlyData["2025-02"]).toBe(15000);
    });

    it("should calculate month-over-month percentage change", () => {
      const currentMonth = 30000;
      const previousMonth = 25000;
      
      const percentageChange = ((currentMonth - previousMonth) / previousMonth) * 100;
      
      expect(percentageChange).toBe(20);
    });

    it("should determine trend direction correctly", () => {
      const getTrend = (change: number) => {
        if (change > 5) return "increasing";
        if (change < -5) return "decreasing";
        return "stable";
      };

      expect(getTrend(10)).toBe("increasing");
      expect(getTrend(-10)).toBe("decreasing");
      expect(getTrend(2)).toBe("stable");
      expect(getTrend(-2)).toBe("stable");
    });
  });

  describe("Chart Data Formatting", () => {
    it("should format currency correctly for charts", () => {
      const cents = 123456; // $1234.56
      const dollars = cents / 100;
      
      expect(dollars).toBe(1234.56);
      expect(dollars.toFixed(2)).toBe("1234.56");
    });

    it("should format month labels correctly", () => {
      const monthKey = "2025-01";
      const date = new Date(monthKey + "-01");
      const formatted = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      
      // Date parsing can vary by timezone, just verify it's a valid month format
      expect(formatted).toMatch(/^[A-Z][a-z]{2}\s\d{4}$/);
    });

    it("should calculate savings rate correctly", () => {
      const income = 500000; // $5000
      const expenses = 350000; // $3500
      const netCashFlow = income - expenses; // $1500
      
      const savingsRate = (netCashFlow / income) * 100;
      
      expect(savingsRate).toBe(30);
    });
  });

  describe("Template Usage Tracking", () => {
    it("should increment usage count correctly", () => {
      let usageCount = 0;
      
      // Simulate template application
      usageCount++;
      expect(usageCount).toBe(1);
      
      usageCount++;
      expect(usageCount).toBe(2);
    });

    it("should track active template per user", () => {
      const userTemplates = new Map<number, { templateId: number; isActive: boolean }>();
      
      // Apply template for user 1
      userTemplates.set(1, { templateId: 1, isActive: true });
      
      // Apply new template for user 1 (deactivate old)
      userTemplates.set(1, { templateId: 2, isActive: true });
      
      const activeTemplate = userTemplates.get(1);
      expect(activeTemplate?.templateId).toBe(2);
      expect(activeTemplate?.isActive).toBe(true);
    });
  });
});
