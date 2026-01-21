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

// ==================== New Features Demo Data ====================

export const DEMO_SPENDING_TRENDS = {
  monthlyData: [
    { month: "Jul", total: 350000, categories: { Housing: 150000, Food: 55000, Transport: 38000, Entertainment: 28000, Shopping: 22000, Other: 57000 } },
    { month: "Aug", total: 365000, categories: { Housing: 150000, Food: 58000, Transport: 42000, Entertainment: 32000, Shopping: 25000, Other: 58000 } },
    { month: "Sep", total: 340000, categories: { Housing: 150000, Food: 52000, Transport: 35000, Entertainment: 25000, Shopping: 20000, Other: 58000 } },
    { month: "Oct", total: 375000, categories: { Housing: 150000, Food: 62000, Transport: 45000, Entertainment: 35000, Shopping: 28000, Other: 55000 } },
    { month: "Nov", total: 360000, categories: { Housing: 150000, Food: 56000, Transport: 40000, Entertainment: 30000, Shopping: 24000, Other: 60000 } },
    { month: "Dec", total: 380000, categories: { Housing: 150000, Food: 60000, Transport: 40000, Entertainment: 35000, Shopping: 30000, Other: 65000 } },
  ],
  insights: {
    trend: "increasing" as const,
    percentageChange: 8.6,
    highestCategory: "Housing",
    savingsOpportunity: "Entertainment spending increased 25% - consider streaming service consolidation",
  },
};

export const DEMO_BUDGET_TEMPLATES = [
  {
    id: 1,
    name: "50/30/20 Rule",
    description: "50% needs, 30% wants, 20% savings - balanced approach for most people",
    allocations: [
      { category: "Housing", percentage: 30, type: "needs" },
      { category: "Transportation", percentage: 10, type: "needs" },
      { category: "Food & Dining", percentage: 10, type: "needs" },
      { category: "Entertainment", percentage: 15, type: "wants" },
      { category: "Shopping", percentage: 10, type: "wants" },
      { category: "Savings", percentage: 20, type: "savings" },
      { category: "Other", percentage: 5, type: "needs" },
    ],
  },
  {
    id: 2,
    name: "Zero-Based Budget",
    description: "Every dollar has a job - assign all income to specific categories",
    allocations: [
      { category: "Housing", percentage: 28 },
      { category: "Transportation", percentage: 12 },
      { category: "Food & Dining", percentage: 15 },
      { category: "Utilities", percentage: 8 },
      { category: "Debt Payments", percentage: 15 },
      { category: "Savings", percentage: 12 },
      { category: "Entertainment", percentage: 6 },
      { category: "Healthcare", percentage: 4 },
    ],
  },
  {
    id: 3,
    name: "Envelope System",
    description: "Cash-based budgeting with fixed amounts per category",
    allocations: [
      { category: "Housing", amount: 150000 },
      { category: "Food & Dining", amount: 60000 },
      { category: "Transportation", amount: 40000 },
      { category: "Entertainment", amount: 30000 },
      { category: "Shopping", amount: 25000 },
      { category: "Emergency Fund", amount: 50000 },
    ],
  },
];

export const DEMO_BUDGET_ALERTS = [
  {
    id: 1,
    type: "warning" as const,
    category: "Food & Dining",
    message: "You've spent 85% of your Food & Dining budget ($51 of $60)",
    threshold: 85,
    isRead: false,
    createdAt: new Date("2024-12-12"),
  },
  {
    id: 2,
    type: "exceeded" as const,
    category: "Entertainment",
    message: "Entertainment budget exceeded by $5 (spent $35 of $30 limit)",
    threshold: 100,
    isRead: false,
    createdAt: new Date("2024-12-10"),
  },
  {
    id: 3,
    type: "info" as const,
    category: "Transportation",
    message: "Great job! You're on track with Transportation spending ($40 of $40)",
    threshold: 100,
    isRead: true,
    createdAt: new Date("2024-12-08"),
  },
];

export const DEMO_AI_INSIGHTS = [
  {
    id: 1,
    type: "savings_opportunity" as const,
    title: "Subscription Consolidation",
    insight: "You're spending $47/month on 4 streaming services. Consider keeping Netflix and Disney+ only to save $23/month ($276/year). Or try rotating subscriptions seasonally!",
    potentialSavings: 27600,
    confidence: 92,
    actionable: true,
  },
  {
    id: 2,
    type: "spending_pattern" as const,
    title: "Weekend Dining Spike",
    insight: "Your restaurant spending jumps 3x on weekends. Meal prepping Sunday dinners could save $120/month while still enjoying Friday date nights.",
    potentialSavings: 12000,
    confidence: 88,
    actionable: true,
  },
  {
    id: 3,
    type: "goal_acceleration" as const,
    title: "Emergency Fund Boost",
    insight: "You're $600 away from your next milestone! Redirecting your entertainment overspend for 2 months would get you there by February. Your future self will thank you!",
    potentialSavings: 0,
    confidence: 95,
    actionable: true,
  },
  {
    id: 4,
    type: "anomaly" as const,
    title: "Unusual Gas Spending",
    insight: "Gas expenses are 40% higher than usual this month. If this continues, consider carpooling or reviewing your commute route for efficiency.",
    potentialSavings: 0,
    confidence: 75,
    actionable: false,
  },
];

export const DEMO_RECURRING_TRANSACTIONS = [
  {
    id: 1,
    merchantName: "Netflix",
    amount: 1599,
    frequency: "monthly" as const,
    nextDate: new Date("2025-01-15"),
    category: "Entertainment",
    confidence: 98,
    isActive: true,
  },
  {
    id: 2,
    merchantName: "Spotify Premium",
    amount: 1099,
    frequency: "monthly" as const,
    nextDate: new Date("2025-01-08"),
    category: "Entertainment",
    confidence: 95,
    isActive: true,
  },
  {
    id: 3,
    merchantName: "Electric Company",
    amount: 12000,
    frequency: "monthly" as const,
    nextDate: new Date("2025-01-05"),
    category: "Utilities",
    confidence: 92,
    isActive: true,
  },
  {
    id: 4,
    merchantName: "Gym Membership",
    amount: 4500,
    frequency: "monthly" as const,
    nextDate: new Date("2025-01-01"),
    category: "Healthcare",
    confidence: 97,
    isActive: true,
  },
  {
    id: 5,
    merchantName: "Car Insurance",
    amount: 15000,
    frequency: "monthly" as const,
    nextDate: new Date("2025-01-20"),
    category: "Transportation",
    confidence: 99,
    isActive: true,
  },
];

export const DEMO_GOAL_PREDICTIONS = {
  emergencyFund: {
    goalId: 1,
    currentProgress: 40,
    estimatedCompletionDate: new Date("2025-10-15"),
    onTrack: true,
    monthlyContribution: 50000,
    motivationalMessage: "You're absolutely crushing it! At this pace, you'll hit your emergency fund goal 2.5 months early. That's the power of consistency!",
    nextMilestone: 50,
    daysUntilMilestone: 45,
  },
  vacationFund: {
    goalId: 2,
    currentProgress: 60,
    estimatedCompletionDate: new Date("2025-05-20"),
    onTrack: true,
    monthlyContribution: 30000,
    motivationalMessage: "Europe is calling! You're 60% there and ahead of schedule. Keep this momentum and you might even upgrade to business class!",
    nextMilestone: 75,
    daysUntilMilestone: 60,
  },
};

export const DEMO_RECEIPT_EXAMPLES = [
  {
    id: 1,
    merchant: "Whole Foods",
    amount: 8750,
    date: new Date("2024-12-13"),
    category: "Food & Dining",
    confidence: 94,
    items: [
      { name: "Organic Bananas", amount: 450 },
      { name: "Almond Milk", amount: 599 },
      { name: "Chicken Breast", amount: 1299 },
      { name: "Mixed Greens", amount: 399 },
    ],
    tax: 750,
    total: 8750,
  },
  {
    id: 2,
    merchant: "Shell Gas Station",
    amount: 5200,
    date: new Date("2024-12-12"),
    category: "Transportation",
    confidence: 98,
    items: [{ name: "Unleaded Gas", amount: 5200 }],
    tax: 0,
    total: 5200,
  },
];

export const DEMO_SHARED_BUDGETS = [
  {
    id: 1,
    name: "Family Budget",
    description: "Shared household expenses",
    members: [
      { id: 1, name: "You", role: "owner" as const, avatar: "👤" },
      { id: 2, name: "Partner", role: "editor" as const, avatar: "👥" },
    ],
    totalSpending: 280000,
    yourShare: 140000,
    categories: ["Housing", "Utilities", "Food & Dining"],
    lastActivity: new Date("2024-12-13"),
  },
  {
    id: 2,
    name: "Roommate Expenses",
    description: "Apartment shared costs",
    members: [
      { id: 1, name: "You", role: "owner" as const, avatar: "👤" },
      { id: 3, name: "Alex", role: "editor" as const, avatar: "🧑" },
      { id: 4, name: "Sam", role: "viewer" as const, avatar: "👨" },
    ],
    totalSpending: 180000,
    yourShare: 60000,
    categories: ["Housing", "Utilities"],
    lastActivity: new Date("2024-12-10"),
  },
];

export const DEMO_SPLIT_EXPENSES = [
  {
    id: 1,
    description: "Rent - December",
    totalAmount: 150000,
    splits: [
      { userId: 1, name: "You", amount: 75000, isPaid: true },
      { userId: 2, name: "Partner", amount: 75000, isPaid: true },
    ],
    category: "Housing",
    date: new Date("2024-12-01"),
  },
  {
    id: 2,
    description: "Grocery Shopping",
    totalAmount: 12000,
    splits: [
      { userId: 1, name: "You", amount: 4000, isPaid: true },
      { userId: 3, name: "Alex", amount: 4000, isPaid: false },
      { userId: 4, name: "Sam", amount: 4000, isPaid: true },
    ],
    category: "Food & Dining",
    date: new Date("2024-12-10"),
  },
];

/**
 * Sample data for Learning Hub demo page
 * Realistic learning sessions and content for showcasing features
 */

export const DEMO_LEARNING_SESSIONS = [
  {
    id: 1,
    topic: "Quantum Physics",
    question: "How does quantum entanglement work?",
    explanation: "Quantum entanglement is a phenomenon where two or more particles become correlated in such a way that the quantum state of each particle cannot be described independently. When particles are entangled, measuring the state of one particle instantaneously affects the state of the other, regardless of the distance between them. This doesn't violate the speed of light because no information is transmitted - the correlation exists from the moment of entanglement.",
    confidence: 95,
    verificationStatus: "verified" as const,
    sources: [
      { title: "Stanford Encyclopedia of Philosophy - Quantum Entanglement", url: "https://plato.stanford.edu/entries/qt-entangle/" },
      { title: "Nature Physics - Quantum entanglement", url: "https://www.nature.com/subjects/quantum-entanglement" },
    ],
    createdAt: new Date("2024-12-15T10:30:00"),
  },
  {
    id: 2,
    topic: "World War II",
    question: "What were the main causes of World War II?",
    explanation: "The main causes of World War II included: (1) The Treaty of Versailles imposed harsh penalties on Germany after WWI, creating economic hardship and resentment; (2) The rise of fascism and totalitarian regimes in Germany, Italy, and Japan; (3) The failure of the League of Nations to prevent aggression; (4) Economic depression in the 1930s that destabilized governments; (5) Appeasement policies by Western powers that emboldened aggressive expansion.",
    confidence: 92,
    verificationStatus: "verified" as const,
    sources: [
      { title: "History.com - Causes of World War II", url: "https://www.history.com/topics/world-war-ii/world-war-ii-history" },
      { title: "Britannica - World War II", url: "https://www.britannica.com/event/World-War-II" },
    ],
    createdAt: new Date("2024-12-14T14:20:00"),
  },
  {
    id: 3,
    topic: "Machine Learning",
    question: "What is the difference between supervised and unsupervised learning?",
    explanation: "Supervised learning uses labeled training data where the correct output is known, allowing the model to learn the mapping between inputs and outputs (e.g., classification, regression). Unsupervised learning works with unlabeled data to discover hidden patterns or structures without predefined categories (e.g., clustering, dimensionality reduction). The key difference is whether the training data includes the 'answers' the model should learn.",
    confidence: 97,
    verificationStatus: "verified" as const,
    sources: [
      { title: "MIT - Introduction to Machine Learning", url: "https://ocw.mit.edu/courses/machine-learning/" },
      { title: "Google AI - Machine Learning Crash Course", url: "https://developers.google.com/machine-learning" },
    ],
    createdAt: new Date("2024-12-13T09:15:00"),
  },
];

export const DEMO_STUDY_GUIDE = {
  topic: "Quantum Entanglement",
  keyPoints: [
    "Quantum entanglement creates correlations between particles that persist regardless of distance",
    "Measuring one entangled particle instantaneously affects its partner",
    "No information travels faster than light - the correlation exists from entanglement",
    "Einstein called it 'spooky action at a distance' but it's now experimentally verified",
    "Entanglement is the basis for quantum computing and quantum cryptography",
  ],
  definitions: [
    { term: "Quantum State", definition: "The complete description of a quantum system's properties" },
    { term: "Superposition", definition: "A quantum system existing in multiple states simultaneously until measured" },
    { term: "Wave Function Collapse", definition: "The process where a quantum system assumes a definite state upon measurement" },
  ],
  practiceQuestions: [
    "Explain why quantum entanglement doesn't violate the speed of light.",
    "How is quantum entanglement used in quantum computing?",
    "What is the difference between quantum entanglement and classical correlation?",
  ],
  studyTips: [
    "Start with understanding superposition before tackling entanglement",
    "Use visual diagrams to understand particle correlations",
    "Practice explaining concepts in simple terms to reinforce understanding",
  ],
};

export const DEMO_QUIZ = {
  topic: "Machine Learning Basics",
  questions: [
    {
      id: 1,
      question: "Which type of learning uses labeled training data?",
      options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Transfer Learning"],
      correctAnswer: 0,
      explanation: "Supervised learning uses labeled data where the correct output is known, allowing the model to learn from examples.",
    },
    {
      id: 2,
      question: "What is the main goal of unsupervised learning?",
      options: ["Predict future values", "Discover hidden patterns", "Classify data into categories", "Optimize rewards"],
      correctAnswer: 1,
      explanation: "Unsupervised learning aims to discover hidden patterns and structures in unlabeled data without predefined categories.",
    },
    {
      id: 3,
      question: "Which algorithm is commonly used for classification tasks?",
      options: ["K-means clustering", "Decision Trees", "PCA", "Autoencoders"],
      correctAnswer: 1,
      explanation: "Decision Trees are supervised learning algorithms commonly used for classification tasks by creating decision rules.",
    },
    {
      id: 4,
      question: "What does overfitting mean in machine learning?",
      options: [
        "Model performs well on all data",
        "Model is too simple",
        "Model memorizes training data but fails on new data",
        "Model has too few parameters",
      ],
      correctAnswer: 2,
      explanation: "Overfitting occurs when a model learns the training data too well, including noise, and fails to generalize to new data.",
    },
  ],
  passingScore: 3,
};

export const DEMO_LEARNING_CATEGORIES = [
  { id: 1, name: "Sciences", icon: "🔬", topics: ["Physics", "Chemistry", "Biology"], color: "blue" },
  { id: 2, name: "Mathematics", icon: "📐", topics: ["Algebra", "Calculus", "Statistics"], color: "purple" },
  { id: 3, name: "Humanities", icon: "📚", topics: ["History", "Literature", "Philosophy"], color: "green" },
  { id: 4, name: "Technology", icon: "💻", topics: ["Programming", "AI", "Cybersecurity"], color: "cyan" },
  { id: 5, name: "Business", icon: "💼", topics: ["Economics", "Marketing", "Finance"], color: "yellow" },
  { id: 6, name: "Creative Arts", icon: "🎨", topics: ["Music", "Design", "Photography"], color: "pink" },
];

export const DEMO_LEARNING_STATS = {
  totalSessions: 47,
  topicsExplored: 23,
  quizzesPassed: 15,
  averageConfidence: 94,
  studyStreak: 12,
  favoriteCategory: "Technology",
};
