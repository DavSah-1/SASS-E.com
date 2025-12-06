import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context for testing
const createMockContext = (userId: number): Context => ({
  user: {
    id: userId,
    openId: `test-open-id-${userId}`,
    name: "Test User",
    email: "test@example.com",
    loginMethod: "test",
    role: "user",
    preferredLanguage: "en",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
});

describe("Debt Coach API", () => {
  const userId = 999999; // Test user ID
  const mockContext = createMockContext(userId);

  let testDebtId: number;

  it("should add a new debt", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.debtCoach.addDebt({
      debtName: "Test Credit Card",
      debtType: "credit_card",
      originalBalance: 500000, // $5,000.00 in cents
      currentBalance: 500000,
      interestRate: 1899, // 18.99%
      minimumPayment: 10000, // $100.00
      dueDay: 15,
      creditor: "Test Bank",
      accountNumber: "****1234",
      notes: "Test debt for API testing",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Debt added successfully");
  });

  it("should retrieve all debts for user", async () => {
    const caller = appRouter.createCaller(mockContext);

    const debts = await caller.debtCoach.getDebts({
      includeInactive: false,
    });

    expect(Array.isArray(debts)).toBe(true);
    expect(debts.length).toBeGreaterThan(0);

    // Store first debt ID for subsequent tests
    if (debts.length > 0) {
      testDebtId = debts[0].id;
    }
  });

  it("should get a specific debt by ID", async () => {
    const caller = appRouter.createCaller(mockContext);

    // First get all debts to find a valid ID
    const debts = await caller.debtCoach.getDebts({ includeInactive: false });
    expect(debts.length).toBeGreaterThan(0);

    const debtId = debts[0].id;
    const debt = await caller.debtCoach.getDebt({ debtId });

    expect(debt).toBeDefined();
    expect(debt.id).toBe(debtId);
    expect(debt.debtName).toBe("Test Credit Card");
  });

  it("should record a payment toward a debt", async () => {
    const caller = appRouter.createCaller(mockContext);

    // Get a debt to make payment on
    const debts = await caller.debtCoach.getDebts({ includeInactive: false });
    expect(debts.length).toBeGreaterThan(0);

    const debtId = debts[0].id;

    const result = await caller.debtCoach.recordPayment({
      debtId,
      amount: 20000, // $200.00
      paymentDate: new Date().toISOString(),
      paymentType: "extra",
      notes: "Test payment",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Payment recorded successfully");
    expect(result.balanceAfter).toBeDefined();
    expect(result.principalPaid).toBeDefined();
    expect(result.interestPaid).toBeDefined();
    expect(result.coachingMessage).toBeDefined();
  });

  it("should get payment history for a debt", async () => {
    const caller = appRouter.createCaller(mockContext);

    const debts = await caller.debtCoach.getDebts({ includeInactive: false });
    expect(debts.length).toBeGreaterThan(0);

    const debtId = debts[0].id;
    const payments = await caller.debtCoach.getPaymentHistory({
      debtId,
      limit: 10,
    });

    expect(Array.isArray(payments)).toBe(true);
    expect(payments.length).toBeGreaterThan(0);
  });

  it("should calculate debt elimination strategy (snowball)", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.debtCoach.calculateStrategy({
      strategyType: "snowball",
      monthlyExtraPayment: 50000, // $500.00 extra per month
    });

    expect(result.strategyType).toBe("snowball");
    expect(result.monthlyExtraPayment).toBe(50000);
    expect(result.projectedPayoffDate).toBeDefined();
    expect(result.totalInterestPaid).toBeGreaterThan(0);
    expect(result.monthsToPayoff).toBeGreaterThan(0);
    expect(Array.isArray(result.payoffOrder)).toBe(true);
  });

  it("should calculate debt elimination strategy (avalanche)", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.debtCoach.calculateStrategy({
      strategyType: "avalanche",
      monthlyExtraPayment: 50000,
    });

    expect(result.strategyType).toBe("avalanche");
    expect(result.monthlyExtraPayment).toBe(50000);
    expect(result.projectedPayoffDate).toBeDefined();
  });

  it("should get latest calculated strategy", async () => {
    const caller = appRouter.createCaller(mockContext);

    const strategy = await caller.debtCoach.getStrategy({
      strategyType: "snowball",
    });

    expect(strategy).toBeDefined();
    if (strategy) {
      expect(strategy.strategyType).toBe("snowball");
      expect(Array.isArray(strategy.payoffOrder)).toBe(true);
    }
  });

  it("should get debt summary statistics", async () => {
    const caller = appRouter.createCaller(mockContext);

    const summary = await caller.debtCoach.getSummary();

    expect(summary).toBeDefined();
    expect(summary.totalDebts).toBeGreaterThanOrEqual(0);
    expect(summary.totalBalance).toBeGreaterThanOrEqual(0);
    expect(summary.totalOriginalBalance).toBeGreaterThanOrEqual(0);
    expect(summary.totalPaid).toBeGreaterThanOrEqual(0);
  });

  it("should get user milestones", async () => {
    const caller = appRouter.createCaller(mockContext);

    const milestones = await caller.debtCoach.getMilestones({});

    expect(Array.isArray(milestones)).toBe(true);
    // Milestones may be empty for new users
  });

  it("should get coaching messages", async () => {
    const caller = appRouter.createCaller(mockContext);

    const messages = await caller.debtCoach.getCoachingMessages({
      limit: 5,
    });

    expect(Array.isArray(messages)).toBe(true);
    // Should have at least welcome message and payment logged message
    expect(messages.length).toBeGreaterThan(0);
  });

  it("should generate motivational message", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.debtCoach.getMotivation();

    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("should update a debt", async () => {
    const caller = appRouter.createCaller(mockContext);

    const debts = await caller.debtCoach.getDebts({ includeInactive: false });
    expect(debts.length).toBeGreaterThan(0);

    const debtId = debts[0].id;

    const result = await caller.debtCoach.updateDebt({
      debtId,
      updates: {
        debtName: "Updated Test Credit Card",
        notes: "Updated notes",
      },
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Debt updated successfully");

    // Verify update
    const updatedDebt = await caller.debtCoach.getDebt({ debtId });
    expect(updatedDebt.debtName).toBe("Updated Test Credit Card");
  });

  it("should save and retrieve budget snapshots", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.debtCoach.saveBudget({
      monthYear: "2025-01",
      totalIncome: 500000, // $5,000
      totalExpenses: 300000, // $3,000
      totalDebtPayments: 150000, // $1,500
      extraPaymentBudget: 50000, // $500
      actualExtraPayments: 50000, // $500
      notes: "Test budget",
    });

    expect(result.success).toBe(true);

    // Retrieve budgets
    const budgets = await caller.debtCoach.getBudgets({ limit: 12 });
    expect(Array.isArray(budgets)).toBe(true);
    expect(budgets.length).toBeGreaterThan(0);
  });

  it("should delete a debt (soft delete)", async () => {
    const caller = appRouter.createCaller(mockContext);

    const debts = await caller.debtCoach.getDebts({ includeInactive: false });
    expect(debts.length).toBeGreaterThan(0);

    const debtId = debts[0].id;

    const result = await caller.debtCoach.deleteDebt({ debtId });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Debt deleted successfully");

    // Verify debt is no longer active
    const activeDebts = await caller.debtCoach.getDebts({
      includeInactive: false,
    });
    const deletedDebt = activeDebts.find((d) => d.id === debtId);
    expect(deletedDebt).toBeUndefined();

    // But should still exist when including inactive
    const allDebts = await caller.debtCoach.getDebts({
      includeInactive: true,
    });
    const closedDebt = allDebts.find((d) => d.id === debtId);
    expect(closedDebt).toBeDefined();
    expect(closedDebt?.status).toBe("closed");
  });
});
