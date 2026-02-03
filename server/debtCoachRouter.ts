import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as dbRoleAware from "./dbRoleAware";

/**
 * Debt Elimination Financial Coach Router
 * Provides comprehensive debt management and motivational coaching
 */
export const debtCoachRouter = router({
  /**
   * Add a new debt
   */
  addDebt: protectedProcedure
    .input(
      z.object({
        debtName: z.string().min(1).max(255),
        debtType: z.enum([
          "credit_card",
          "student_loan",
          "personal_loan",
          "auto_loan",
          "mortgage",
          "medical",
          "other",
        ]),
        originalBalance: z.number().int().positive(), // In cents
        currentBalance: z.number().int().nonnegative(), // In cents
        interestRate: z.number().int().nonnegative().max(10000), // Basis points (e.g., 1550 = 15.50%)
        minimumPayment: z.number().int().positive(), // In cents
        dueDay: z.number().int().min(1).max(31),
        creditor: z.string().max(255).optional(),
        accountNumber: z.string().max(100).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await dbRoleAware.addDebt(ctx, {
        userId: ctx.user.numericId,
        ...input,
      });

      // Generate welcome coaching message for first debt
      const userDebts = await dbRoleAware.getUserDebts(ctx, ctx.user.numericId);
      if (userDebts.length === 1) {
        const coachingMessage = await generateCoachingMessage(
          ctx.user.numericId,
          "welcome",
          { debtName: input.debtName, balance: input.currentBalance }
        );
        
        await dbRoleAware.saveCoachingSession(ctx, {
          userId: ctx.user.numericId,
          sessionType: "welcome",
          message: coachingMessage,
          sentiment: "encouraging",
        });
      }

      return { success: true, message: "Debt added successfully" };
    }),

  /**
   * Get all debts for the current user
   */
  getDebts: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const debts = await dbRoleAware.getUserDebts(ctx, ctx.user.numericId, input.includeInactive);
      return debts;
    }),

  /**
   * Get a specific debt by ID
   */
  getDebt: protectedProcedure
    .input(z.object({ debtId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const debt = await dbRoleAware.getDebtById(ctx, input.debtId);
      if (!debt) {
        throw new Error("Debt not found");
      }
      return debt;
    }),

  /**
   * Update a debt
   */
  updateDebt: protectedProcedure
    .input(
      z.object({
        debtId: z.number().int().positive(),
        updates: z.object({
          debtName: z.string().min(1).max(255).optional(),
          currentBalance: z.number().int().nonnegative().optional(),
          interestRate: z.number().int().nonnegative().max(10000).optional(),
          minimumPayment: z.number().int().positive().optional(),
          dueDay: z.number().int().min(1).max(31).optional(),
          creditor: z.string().max(255).optional(),
          accountNumber: z.string().max(100).optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await dbRoleAware.updateDebt(ctx, input.debtId, input.updates);
      return { success: true, message: "Debt updated successfully" };
    }),

  /**
   * Delete a debt (soft delete)
   */
  deleteDebt: protectedProcedure
    .input(z.object({ debtId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await dbRoleAware.deleteDebt(ctx, input.debtId);
      return { success: true, message: "Debt deleted successfully" };
    }),

  /**
   * Record a payment toward a debt
   */
  recordPayment: protectedProcedure
    .input(
      z.object({
        debtId: z.number().int().positive(),
        amount: z.number().int().positive(), // In cents
        paymentDate: z.string().datetime(),
        paymentType: z.enum(["minimum", "extra", "lump_sum", "automatic"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current debt to calculate new balance
      const debt = await dbRoleAware.getDebtById(ctx, input.debtId);
      if (!debt) {
        throw new Error("Debt not found");
      }

      // Calculate interest and principal portions
      const monthlyInterestRate = debt.interestRate / 10000 / 12;
      const interestPaid = Math.round(debt.currentBalance * monthlyInterestRate);
      const principalPaid = Math.max(0, input.amount - interestPaid);
      const balanceAfter = Math.max(0, debt.currentBalance - principalPaid);

      // Record the payment
      await dbRoleAware.recordDebtPayment(ctx, {
        debtId: input.debtId,
        userId: ctx.user.numericId,
        amount: input.amount,
        paymentDate: new Date(input.paymentDate),
        paymentType: input.paymentType,
        balanceAfter,
        principalPaid,
        interestPaid,
        notes: input.notes,
      });

      // Check for milestones
      await checkAndAwardMilestones(ctx, ctx.user.numericId, input.debtId, debt, balanceAfter);

      // Generate coaching message
      const coachingMessage = await generateCoachingMessage(
        ctx.user.numericId,
        "payment_logged",
        {
          debtName: debt.debtName,
          amount: input.amount,
          balanceAfter,
          paymentType: input.paymentType,
        }
      );

      await dbRoleAware.saveCoachingSession(ctx, {
        userId: ctx.user.numericId,
        sessionType: "payment_logged",
        message: coachingMessage,
        sentiment: "encouraging",
        relatedDebtId: input.debtId,
      });

      return {
        success: true,
        message: "Payment recorded successfully",
        balanceAfter,
        principalPaid,
        interestPaid,
        coachingMessage,
      };
    }),

  /**
   * Get payment history for a debt
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        debtId: z.number().int().positive(),
        limit: z.number().int().positive().optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const payments = await dbRoleAware.getDebtPaymentHistory(ctx, input.debtId);
      return payments;
    }),

  /**
   * Get all payments across all debts
   */
  getAllPayments: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().optional().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const payments = await dbRoleAware.getAllUserPayments(ctx, ctx.user.numericId);
      return payments;
    }),

  /**
   * Calculate debt elimination strategy (snowball vs avalanche)
   */
  calculateStrategy: protectedProcedure
    .input(
      z.object({
        strategyType: z.enum(["snowball", "avalanche"]),
        monthlyExtraPayment: z.number().int().nonnegative(), // In cents
      })
    )
    .mutation(async ({ ctx, input }) => {
      const debts = await dbRoleAware.getUserDebts(ctx, ctx.user.numericId, false);

      if (debts.length === 0) {
        throw new Error("No active debts to calculate strategy");
      }

      // Sort debts based on strategy
      let sortedDebts;
      if (input.strategyType === "snowball") {
        // Smallest balance first
        sortedDebts = [...debts].sort((a, b) => a.currentBalance - b.currentBalance);
      } else {
        // Highest interest rate first
        sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
      }

      // Calculate payoff timeline
      const payoffOrder = sortedDebts.map((d) => d.id);
      let totalInterestPaid = 0;
      let monthsToPayoff = 0;
      let remainingDebts = sortedDebts.map((d) => ({
        ...d,
        balance: d.currentBalance,
      }));

      // Simulate monthly payments
      while (remainingDebts.some((d) => d.balance > 0)) {
        monthsToPayoff++;
        let extraPaymentRemaining = input.monthlyExtraPayment;

        // Apply minimum payments to all debts
        remainingDebts = remainingDebts.map((debt) => {
          if (debt.balance <= 0) return debt;

          const monthlyInterestRate = debt.interestRate / 10000 / 12;
          const interestCharge = Math.round(debt.balance * monthlyInterestRate);
          totalInterestPaid += interestCharge;

          const principalPaid = Math.min(
            debt.minimumPayment - interestCharge,
            debt.balance
          );
          return {
            ...debt,
            balance: Math.max(0, debt.balance - principalPaid),
          };
        });

        // Apply extra payment to first debt in order
        for (let i = 0; i < remainingDebts.length && extraPaymentRemaining > 0; i++) {
          if (remainingDebts[i].balance > 0) {
            const paymentAmount = Math.min(
              extraPaymentRemaining,
              remainingDebts[i].balance
            );
            remainingDebts[i].balance -= paymentAmount;
            extraPaymentRemaining -= paymentAmount;
          }
        }

        // Safety check to prevent infinite loop
        if (monthsToPayoff > 600) {
          // 50 years
          throw new Error("Payoff calculation exceeded reasonable timeframe");
        }
      }

      // Calculate projected payoff date
      const projectedPayoffDate = new Date();
      projectedPayoffDate.setMonth(projectedPayoffDate.getMonth() + monthsToPayoff);

      // Calculate interest saved compared to minimum payments only
      const minimumOnlyInterest = await calculateMinimumOnlyInterest(debts);
      const totalInterestSaved = minimumOnlyInterest - totalInterestPaid;

      // Save strategy
      await dbRoleAware.saveDebtStrategy(ctx, {
        userId: ctx.user.numericId,
        strategyType: input.strategyType,
        monthlyExtraPayment: input.monthlyExtraPayment,
        projectedPayoffDate,
        totalInterestPaid,
        totalInterestSaved,
        monthsToPayoff,
        payoffOrder: JSON.stringify(payoffOrder),
      });

      return {
        strategyType: input.strategyType,
        monthlyExtraPayment: input.monthlyExtraPayment,
        projectedPayoffDate,
        totalInterestPaid,
        totalInterestSaved,
        monthsToPayoff,
        payoffOrder,
      };
    }),

  /**
   * Get latest calculated strategy
   */
  getStrategy: protectedProcedure
    .input(
      z.object({
        strategyType: z.enum(["snowball", "avalanche"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const strategy = await dbRoleAware.getLatestStrategy(ctx, ctx.user.numericId);
      if (!strategy) {
        return null;
      }

      return {
        ...strategy,
        payoffOrder: JSON.parse(strategy.payoffOrder as string),
      };
    }),

  /**
   * Get user's milestones
   */
  getMilestones: protectedProcedure
    .input(
      z.object({
        debtId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const milestones = await dbRoleAware.getUserMilestones(ctx, ctx.user.numericId);
      return milestones;
    }),

  /**
   * Get recent coaching messages
   */
  getCoachingMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const sessions = await dbRoleAware.getRecentCoachingSessions(ctx, ctx.user.numericId, input.limit);
      return sessions;
    }),

  /**
   * Get motivational coaching message
   */
  getMotivation: protectedProcedure.mutation(async ({ ctx }) => {
    const summary = await dbRoleAware.getDebtSummary(ctx, ctx.user.numericId);
    const recentPayments = await dbRoleAware.getAllUserPayments(ctx, ctx.user.numericId, 5);

    const coachingMessage = await generateCoachingMessage(
      ctx.user.numericId,
      "motivation",
      {
        summary,
        recentPayments,
      }
    );

    await dbRoleAware.saveCoachingSession(ctx, {
      userId: ctx.user.numericId,
      sessionType: "motivation",
      message: coachingMessage,
      sentiment: "motivational",
    });

    return { message: coachingMessage };
  }),

  /**
   * Get debt summary statistics
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const summary = await dbRoleAware.getDebtSummary(ctx, ctx.user.numericId);
    return summary;
  }),

  /**
   * Save budget snapshot
   */
  saveBudget: protectedProcedure
    .input(
      z.object({
        monthYear: z.string().regex(/^\d{4}-\d{2}$/), // Format: "2025-01"
        totalIncome: z.number().int().nonnegative(),
        totalExpenses: z.number().int().nonnegative(),
        totalDebtPayments: z.number().int().nonnegative(),
        extraPaymentBudget: z.number().int().nonnegative(),
        actualExtraPayments: z.number().int().nonnegative(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await dbRoleAware.saveBudgetSnapshot(ctx, {
        userId: ctx.user.numericId,
        ...input,
      });

      return { success: true, message: "Budget snapshot saved" };
    }),

  /**
   * Get budget snapshots
   */
  getBudgets: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().optional().default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const snapshots = await dbRoleAware.getBudgetSnapshots(ctx, ctx.user.numericId, input.limit);
      return snapshots;
    }),
});

/**
 * Helper: Generate AI coaching message based on context
 */
async function generateCoachingMessage(
  userId: number,
  sessionType: string,
  context: any
): Promise<string> {
  const systemPrompt = `You are SASS-E, a supportive and encouraging financial coach helping users eliminate debt. 
Your tone should be warm, motivational, and psychologically aware. Acknowledge both the mathematical and emotional aspects of debt elimination.
Keep messages concise (2-3 sentences), actionable, and celebrate progress.`;

  let userPrompt = "";

  switch (sessionType) {
    case "welcome":
      userPrompt = `User just added their first debt: ${context.debtName} with balance $${(context.balance / 100).toFixed(2)}. Welcome them to their debt-free journey.`;
      break;
    case "payment_logged":
      userPrompt = `User just made a ${context.paymentType} payment of $${(context.amount / 100).toFixed(2)} toward ${context.debtName}. New balance: $${(context.balanceAfter / 100).toFixed(2)}. Encourage them.`;
      break;
    case "motivation":
      userPrompt = `Provide general motivation. User has ${context.summary.totalDebts} active debts totaling $${(context.summary.totalBalance / 100).toFixed(2)}. They've paid off ${context.summary.debtsPaidOff} debts and made ${context.recentPayments.length} recent payments.`;
      break;
    case "milestone_celebration":
      userPrompt = `Celebrate this milestone: ${context.milestoneTitle}. ${context.milestoneDescription}`;
      break;
    default:
      userPrompt = "Provide encouraging words about debt elimination journey.";
  }

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === 'string' ? content : "Keep up the great work on your debt-free journey!";
  } catch (error) {
    console.error("[DebtCoach] Failed to generate coaching message:", error);
    return "Every payment brings you closer to financial freedom. Keep going!";
  }
}

/**
 * Helper: Check and award milestones
 */
async function checkAndAwardMilestones(
  ctx: any,
  userId: number,
  debtId: number,
  debt: any,
  newBalance: number
) {
  const percentPaid =
    ((debt.originalBalance - newBalance) / debt.originalBalance) * 100;

  const milestones = await dbRoleAware.getUserMilestones(ctx, userId);
  const achievedTypes = new Set(milestones.map((m) => m.milestoneType));

  // Check percentage milestones
  if (percentPaid >= 25 && !achievedTypes.has("25_percent_paid")) {
    await dbRoleAware.saveDebtMilestone(ctx, {
      userId,
      debtId,
      milestoneType: "25_percent_paid",
      title: "Quarter Way There!",
      description: `You've paid off 25% of ${debt.debtName}`,
    });
  }

  if (percentPaid >= 50 && !achievedTypes.has("50_percent_paid")) {
    await dbRoleAware.saveDebtMilestone(ctx, {
      userId,
      debtId,
      milestoneType: "50_percent_paid",
      title: "Halfway to Freedom!",
      description: `You've paid off 50% of ${debt.debtName}`,
    });
  }

  if (percentPaid >= 75 && !achievedTypes.has("75_percent_paid")) {
    await dbRoleAware.saveDebtMilestone(ctx, {
      userId,
      debtId,
      milestoneType: "75_percent_paid",
      title: "Almost There!",
      description: `You've paid off 75% of ${debt.debtName}`,
    });
  }

  // Check if debt is paid off
  if (newBalance === 0 && !achievedTypes.has("debt_paid_off")) {
    await dbRoleAware.saveDebtMilestone(ctx, {
      userId,
      debtId,
      milestoneType: "debt_paid_off",
      title: "Debt Eliminated!",
      description: `You've completely paid off ${debt.debtName}!`,
    });
  }
}

/**
 * Helper: Calculate total interest if only making minimum payments
 */
async function calculateMinimumOnlyInterest(debts: any[]): Promise<number> {
  let totalInterest = 0;
  let remainingDebts = debts.map((d) => ({
    ...d,
    balance: d.currentBalance,
  }));

  let months = 0;
  while (remainingDebts.some((d) => d.balance > 0) && months < 600) {
    months++;

    remainingDebts = remainingDebts.map((debt) => {
      if (debt.balance <= 0) return debt;

      const monthlyInterestRate = debt.interestRate / 10000 / 12;
      const interestCharge = Math.round(debt.balance * monthlyInterestRate);
      totalInterest += interestCharge;

      const principalPaid = Math.min(
        debt.minimumPayment - interestCharge,
        debt.balance
      );
      return {
        ...debt,
        balance: Math.max(0, debt.balance - principalPaid),
      };
    });
  }

  return totalInterest;
}
