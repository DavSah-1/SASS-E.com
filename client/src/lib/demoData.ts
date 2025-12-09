/**
 * Sample data for Money Hub demo page
 * Realistic financial profile for showcasing features
 */

export const DEMO_DEBTS = [
  {
    id: 1,
    userId: 0,
    name: "Chase Credit Card",
    type: "credit_card" as const,
    originalBalance: 10000,
    currentBalance: 8000,
    interestRate: 18.99,
    minimumPayment: 200,
    dueDay: 15,
    status: "active" as const,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: 2,
    userId: 0,
    name: "Honda Civic Loan",
    type: "auto_loan" as const,
    originalBalance: 18000,
    currentBalance: 12000,
    interestRate: 5.49,
    minimumPayment: 350,
    dueDay: 5,
    status: "active" as const,
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: 3,
    userId: 0,
    name: "Student Loan",
    type: "student_loan" as const,
    originalBalance: 8000,
    currentBalance: 5000,
    interestRate: 4.25,
    minimumPayment: 150,
    dueDay: 20,
    status: "active" as const,
    createdAt: new Date("2022-09-01"),
    updatedAt: new Date("2024-12-01"),
  },
];

export const DEMO_PAYMENTS = [
  { id: 1, debtId: 1, amount: 30000, paymentDate: new Date("2024-11-15"), paymentType: "extra" as const, note: "Bonus payment" },
  { id: 2, debtId: 1, amount: 20000, paymentDate: new Date("2024-10-15"), paymentType: "minimum" as const, note: null },
  { id: 3, debtId: 2, amount: 35000, paymentDate: new Date("2024-11-05"), paymentType: "minimum" as const, note: null },
  { id: 4, debtId: 2, amount: 35000, paymentDate: new Date("2024-10-05"), paymentType: "minimum" as const, note: null },
  { id: 5, debtId: 3, amount: 15000, paymentDate: new Date("2024-11-20"), paymentType: "minimum" as const, note: null },
  { id: 6, debtId: 3, amount: 20000, paymentDate: new Date("2024-10-20"), paymentType: "extra" as const, note: "Extra payment" },
];

export const DEMO_BUDGET_CATEGORIES = [
  { id: 1, userId: 0, name: "Salary", type: "income" as const, monthlyLimit: 500000, color: "#10b981", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, userId: 0, name: "Freelance", type: "income" as const, monthlyLimit: 0, color: "#3b82f6", createdAt: new Date(), updatedAt: new Date() },
  { id: 3, userId: 0, name: "Housing", type: "expense" as const, monthlyLimit: 150000, color: "#ef4444", createdAt: new Date(), updatedAt: new Date() },
  { id: 4, userId: 0, name: "Transportation", type: "expense" as const, monthlyLimit: 40000, color: "#f59e0b", createdAt: new Date(), updatedAt: new Date() },
  { id: 5, userId: 0, name: "Food & Dining", type: "expense" as const, monthlyLimit: 60000, color: "#8b5cf6", createdAt: new Date(), updatedAt: new Date() },
  { id: 6, userId: 0, name: "Utilities", type: "expense" as const, monthlyLimit: 20000, color: "#06b6d4", createdAt: new Date(), updatedAt: new Date() },
  { id: 7, userId: 0, name: "Entertainment", type: "expense" as const, monthlyLimit: 30000, color: "#ec4899", createdAt: new Date(), updatedAt: new Date() },
  { id: 8, userId: 0, name: "Healthcare", type: "expense" as const, monthlyLimit: 15000, color: "#14b8a6", createdAt: new Date(), updatedAt: new Date() },
  { id: 9, userId: 0, name: "Shopping", type: "expense" as const, monthlyLimit: 25000, color: "#f97316", createdAt: new Date(), updatedAt: new Date() },
  { id: 10, userId: 0, name: "Debt Payments", type: "expense" as const, monthlyLimit: 70000, color: "#6366f1", createdAt: new Date(), updatedAt: new Date() },
];

export const DEMO_TRANSACTIONS = [
  { id: 1, userId: 0, categoryId: 1, amount: 500000, date: new Date("2024-12-01"), description: "Monthly salary", type: "income" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, userId: 0, categoryId: 3, amount: 150000, date: new Date("2024-12-01"), description: "Rent payment", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, userId: 0, categoryId: 4, amount: 8000, date: new Date("2024-12-03"), description: "Gas", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, userId: 0, categoryId: 5, amount: 4500, date: new Date("2024-12-04"), description: "Grocery shopping", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, userId: 0, categoryId: 5, amount: 3200, date: new Date("2024-12-05"), description: "Restaurant dinner", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, userId: 0, categoryId: 6, amount: 12000, date: new Date("2024-12-05"), description: "Electric bill", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 7, userId: 0, categoryId: 6, amount: 8000, date: new Date("2024-12-06"), description: "Internet bill", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 8, userId: 0, categoryId: 7, amount: 1500, date: new Date("2024-12-07"), description: "Movie tickets", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 9, userId: 0, categoryId: 10, amount: 70000, date: new Date("2024-12-10"), description: "Debt payments", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
  { id: 10, userId: 0, categoryId: 9, amount: 8000, date: new Date("2024-12-11"), description: "Clothing", type: "expense" as const, createdAt: new Date(), updatedAt: new Date() },
];

export const DEMO_GOALS = [
  {
    id: 1,
    userId: 0,
    name: "Emergency Fund",
    type: "savings" as const,
    targetAmount: 1000000, // $10,000
    currentAmount: 400000, // $4,000 (40%)
    targetDate: new Date("2025-12-31"),
    status: "active" as const,
    priority: 1,
    description: "Build 6-month emergency fund",
    color: "#10b981",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: 2,
    userId: 0,
    name: "Vacation Fund",
    type: "purchase" as const,
    targetAmount: 300000, // $3,000
    currentAmount: 180000, // $1,800 (60%)
    targetDate: new Date("2025-06-01"),
    status: "active" as const,
    priority: 2,
    description: "Summer vacation to Europe",
    color: "#3b82f6",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-12-01"),
  },
];

export const DEMO_MILESTONES = [
  { id: 1, goalId: 1, milestonePercentage: 25, achievedDate: new Date("2024-06-15"), celebrationShown: true, createdAt: new Date(), updatedAt: new Date() },
];

export const DEMO_COACHING_MESSAGE = {
  title: "Great Progress on Your Financial Journey! 🎯",
  message: "You're crushing it! Your debt-to-income ratio is healthy at 50%, and you're making consistent extra payments. I see you paid an extra $300 on your credit card last month—that's the spirit! At this rate, you'll be debt-free in 24 months. Keep that momentum going, and consider the debt avalanche method to save $450 in interest. Your emergency fund is 40% complete—you're building a solid safety net. Remember: every dollar you save today is freedom you buy for tomorrow!",
  sentiment: "positive" as const,
};

export const DEMO_MONTHLY_SUMMARY = {
  totalIncome: 500000, // $5,000
  totalExpenses: 380000, // $3,800
  totalDebtPayments: 70000, // $700
  netCashFlow: 120000, // $1,200
  savingsRate: 24, // 24%
  budgetHealth: "good" as const,
};

export const DEMO_DEBT_SUMMARY = {
  totalDebt: 2500000, // $25,000
  totalPaid: 1300000, // $13,000 (from original balances)
  debtsPaidOff: 0,
  averageInterestRate: 9.58,
  monthlyMinimum: 70000, // $700
  projectedPayoffDate: new Date("2026-12-31"),
  debtFreeMonths: 24,
};

export const DEMO_STRATEGY_COMPARISON = {
  snowball: {
    strategyType: "snowball" as const,
    projectedPayoffDate: new Date("2027-01-31"),
    totalInterest: 285000, // $2,850
    monthsToPayoff: 25,
  },
  avalanche: {
    strategyType: "avalanche" as const,
    projectedPayoffDate: new Date("2026-12-31"),
    totalInterest: 240000, // $2,400
    monthsToPayoff: 24,
  },
};
