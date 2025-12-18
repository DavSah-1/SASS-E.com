/**
 * Money Hub Demo Data Script
 * Populates the database with comprehensive sample data for all Money Hub features
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import { 
  users, 
  debts, 
  debtPayments, 
  sharedBudgets, 
  sharedBudgetMembers, 
  sharedBudgetCategories, 
  sharedBudgetTransactions 
} from '../drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('🚀 Starting Money Hub demo data population...\n');

// Get the owner user ID (should be user ID 1)
const [ownerUser] = await db.select().from(users).limit(1);
if (!ownerUser) {
  console.error('❌ No users found in database. Please ensure at least one user exists.');
  process.exit(1);
}

const userId = ownerUser.id;
console.log(`✅ Found user: ${ownerUser.name} (ID: ${userId})\n`);

// Clear existing Money Hub data for this user
console.log('🧹 Clearing existing Money Hub data...');
await db.delete(debtPayments).where(eq(debtPayments.userId, userId));
await db.delete(debts).where(eq(debts.userId, userId));
await db.delete(sharedBudgetTransactions);
await db.delete(sharedBudgetMembers);
await db.delete(sharedBudgets).where(eq(sharedBudgets.ownerId, userId));
console.log('✅ Cleared existing data\n');

// 1. Create Debts
console.log('💳 Creating sample debts...');
const debtsData = [
  {
    userId,
    debtName: 'Chase Sapphire Credit Card',
    debtType: 'credit_card',
    originalBalance: 580000, // $5,800
    currentBalance: 450000, // $4,500
    interestRate: 1899, // 18.99%
    minimumPayment: 12500, // $125
    dueDay: 15,
    status: 'active',
    notes: 'Travel rewards card - pay off before trip',
  },
  {
    userId,
    debtName: 'Federal Student Loan',
    debtType: 'student_loan',
    originalBalance: 2500000, // $25,000
    currentBalance: 1875000, // $18,750
    interestRate: 450, // 4.50%
    minimumPayment: 28000, // $280
    dueDay: 10,
    status: 'active',
    notes: 'Standard repayment plan - 10 years remaining',
  },
  {
    userId,
    debtName: 'Toyota Camry Auto Loan',
    debtType: 'auto_loan',
    originalBalance: 2800000, // $28,000
    currentBalance: 1540000, // $15,400
    interestRate: 349, // 3.49%
    minimumPayment: 52000, // $520
    dueDay: 20,
    status: 'active',
    notes: '2023 model - 3 years remaining',
  },
  {
    userId,
    debtName: 'Personal Loan - Home Renovation',
    debtType: 'personal_loan',
    originalBalance: 1500000, // $15,000
    currentBalance: 980000, // $9,800
    interestRate: 799, // 7.99%
    minimumPayment: 35000, // $350
    dueDay: 25,
    status: 'active',
    notes: 'Kitchen remodel - fixed rate',
  },
];

const insertedDebts = [];
for (const debt of debtsData) {
  const [result] = await db.insert(debts).values(debt);
  insertedDebts.push({ ...debt, id: result.insertId });
  console.log(`  ✓ Created: ${debt.debtName}`);
}
console.log(`✅ Created ${insertedDebts.length} debts\n`);

// 2. Create Debt Payments
console.log('💰 Creating sample debt payments...');
const paymentsData = [];
const now = new Date();

// Credit Card payments (last 3 months)
let ccBalance = insertedDebts[0].currentBalance;
for (let i = 0; i < 3; i++) {
  const paymentDate = new Date(now);
  paymentDate.setMonth(paymentDate.getMonth() - i);
  const amount = 15000 + Math.floor(Math.random() * 10000); // $150-$250
  const interestPaid = Math.floor(ccBalance * 0.0158); // ~18.99% APR monthly
  const principalPaid = amount - interestPaid;
  ccBalance += principalPaid; // Going backwards in time
  paymentsData.push({
    debtId: insertedDebts[0].id,
    userId,
    amount,
    paymentDate,
    paymentType: 'extra',
    balanceAfter: ccBalance - principalPaid,
    principalPaid,
    interestPaid,
    notes: `Monthly payment ${i === 0 ? '(current)' : `(${i} month${i > 1 ? 's' : ''} ago)`}`,
  });
}

// Student Loan payments (last 6 months)
let slBalance = insertedDebts[1].currentBalance;
for (let i = 0; i < 6; i++) {
  const paymentDate = new Date(now);
  paymentDate.setMonth(paymentDate.getMonth() - i);
  const amount = 28000; // $280
  const interestPaid = Math.floor(slBalance * 0.00375); // 4.5% APR monthly
  const principalPaid = amount - interestPaid;
  slBalance += principalPaid;
  paymentsData.push({
    debtId: insertedDebts[1].id,
    userId,
    amount,
    paymentDate,
    paymentType: 'automatic',
    balanceAfter: slBalance - principalPaid,
    principalPaid,
    interestPaid,
    notes: `Auto-payment ${i === 0 ? '(current)' : ''}`,
  });
}

// Auto Loan payments (last 4 months)
let alBalance = insertedDebts[2].currentBalance;
for (let i = 0; i < 4; i++) {
  const paymentDate = new Date(now);
  paymentDate.setMonth(paymentDate.getMonth() - i);
  const amount = 52000; // $520
  const interestPaid = Math.floor(alBalance * 0.00291); // 3.49% APR monthly
  const principalPaid = amount - interestPaid;
  alBalance += principalPaid;
  paymentsData.push({
    debtId: insertedDebts[2].id,
    userId,
    amount,
    paymentDate,
    paymentType: 'automatic',
    balanceAfter: alBalance - principalPaid,
    principalPaid,
    interestPaid,
    notes: 'Monthly car payment',
  });
}

// Personal Loan payments (last 5 months)
let plBalance = insertedDebts[3].currentBalance;
for (let i = 0; i < 5; i++) {
  const paymentDate = new Date(now);
  paymentDate.setMonth(paymentDate.getMonth() - i);
  const amount = 35000 + (i === 1 ? 15000 : 0); // Extra payment 1 month ago
  const interestPaid = Math.floor(plBalance * 0.00666); // 7.99% APR monthly
  const principalPaid = amount - interestPaid;
  plBalance += principalPaid;
  paymentsData.push({
    debtId: insertedDebts[3].id,
    userId,
    amount,
    paymentDate,
    paymentType: i === 1 ? 'lump_sum' : 'extra',
    balanceAfter: plBalance - principalPaid,
    principalPaid,
    interestPaid,
    notes: i === 1 ? 'Extra payment from bonus!' : 'Regular payment',
  });
}

for (const payment of paymentsData) {
  await db.insert(debtPayments).values(payment);
}
console.log(`✅ Created ${paymentsData.length} debt payments\n`);

// 3. Create Shared Budgets
console.log('📊 Creating sample shared budgets...');

// Family Budget
const [familyBudgetResult] = await db.insert(sharedBudgets).values({
  name: 'Family Monthly Budget',
  description: 'Household expenses and savings goals',
  ownerId: userId,
  status: 'active',
  currency: 'USD',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
});
const familyBudgetId = familyBudgetResult.insertId;
console.log('  ✓ Created: Family Monthly Budget');

// Vacation Fund
const [vacationBudgetResult] = await db.insert(sharedBudgets).values({
  name: 'Summer Vacation Fund',
  description: 'Saving for 2-week Europe trip',
  ownerId: userId,
  status: 'active',
  currency: 'USD',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-07-01'),
});
const vacationBudgetId = vacationBudgetResult.insertId;
console.log('  ✓ Created: Summer Vacation Fund');

console.log('✅ Created 2 shared budgets\n');

// 4. Add Budget Members
console.log('👥 Adding budget members...');
await db.insert(sharedBudgetMembers).values([
  {
    sharedBudgetId: familyBudgetId,
    userId,
    role: 'owner',
    invitedBy: userId,
  },
  {
    sharedBudgetId: vacationBudgetId,
    userId,
    role: 'owner',
    invitedBy: userId,
  },
]);
console.log('✅ Added budget members\n');

// 5. Create Budget Categories
console.log('🏷️  Creating budget categories...');
const categories = [
  // Family Budget Categories
  { sharedBudgetId: familyBudgetId, name: 'Groceries', monthlyLimit: 80000, color: '#10b981', icon: '🛒', createdBy: userId },
  { sharedBudgetId: familyBudgetId, name: 'Utilities', monthlyLimit: 25000, color: '#3b82f6', icon: '⚡', createdBy: userId },
  { sharedBudgetId: familyBudgetId, name: 'Transportation', monthlyLimit: 30000, color: '#f59e0b', icon: '🚗', createdBy: userId },
  { sharedBudgetId: familyBudgetId, name: 'Entertainment', monthlyLimit: 20000, color: '#8b5cf6', icon: '🎬', createdBy: userId },
  { sharedBudgetId: familyBudgetId, name: 'Dining Out', monthlyLimit: 35000, color: '#ef4444', icon: '🍽️', createdBy: userId },
  { sharedBudgetId: familyBudgetId, name: 'Healthcare', monthlyLimit: 15000, color: '#ec4899', icon: '🏥', createdBy: userId },
  
  // Vacation Fund Categories
  { sharedBudgetId: vacationBudgetId, name: 'Flights', monthlyLimit: 150000, color: '#06b6d4', icon: '✈️', createdBy: userId },
  { sharedBudgetId: vacationBudgetId, name: 'Accommodation', monthlyLimit: 200000, color: '#8b5cf6', icon: '🏨', createdBy: userId },
  { sharedBudgetId: vacationBudgetId, name: 'Activities', monthlyLimit: 100000, color: '#10b981', icon: '🎭', createdBy: userId },
  { sharedBudgetId: vacationBudgetId, name: 'Food & Dining', monthlyLimit: 80000, color: '#f59e0b', icon: '🍕', createdBy: userId },
];

const insertedCategories = [];
for (const category of categories) {
  const [result] = await db.insert(sharedBudgetCategories).values(category);
  insertedCategories.push({ ...category, id: result.insertId });
  console.log(`  ✓ Created: ${category.name}`);
}
console.log(`✅ Created ${insertedCategories.length} budget categories\n`);

// 6. Create Budget Transactions
console.log('💸 Creating sample budget transactions...');
const transactions = [];

// Family Budget Transactions (current month)
const familyCategories = insertedCategories.filter(c => c.sharedBudgetId === familyBudgetId);
transactions.push(
  // Groceries
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[0].id, userId, amount: 12500, description: 'Whole Foods weekly shop', transactionDate: new Date('2025-12-05'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[0].id, userId, amount: 8900, description: 'Trader Joe\'s', transactionDate: new Date('2025-12-10'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[0].id, userId, amount: 15200, description: 'Costco bulk purchase', transactionDate: new Date('2025-12-15'), type: 'expense' },
  
  // Utilities
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[1].id, userId, amount: 12000, description: 'Electric bill', transactionDate: new Date('2025-12-01'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[1].id, userId, amount: 6500, description: 'Water bill', transactionDate: new Date('2025-12-01'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[1].id, userId, amount: 5000, description: 'Internet', transactionDate: new Date('2025-12-01'), type: 'expense' },
  
  // Transportation
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[2].id, userId, amount: 6500, description: 'Gas - Shell', transactionDate: new Date('2025-12-03'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[2].id, userId, amount: 7200, description: 'Gas - Chevron', transactionDate: new Date('2025-12-12'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[2].id, userId, amount: 2500, description: 'Parking downtown', transactionDate: new Date('2025-12-08'), type: 'expense' },
  
  // Entertainment
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[3].id, userId, amount: 5000, description: 'Movie tickets', transactionDate: new Date('2025-12-07'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[3].id, userId, amount: 1499, description: 'Netflix subscription', transactionDate: new Date('2025-12-01'), type: 'expense' },
  
  // Dining Out
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[4].id, userId, amount: 8500, description: 'Italian restaurant', transactionDate: new Date('2025-12-06'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[4].id, userId, amount: 4200, description: 'Chipotle lunch', transactionDate: new Date('2025-12-11'), type: 'expense' },
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[4].id, userId, amount: 12000, description: 'Birthday dinner', transactionDate: new Date('2025-12-14'), type: 'expense' },
  
  // Healthcare
  { sharedBudgetId: familyBudgetId, categoryId: familyCategories[5].id, userId, amount: 3500, description: 'Pharmacy - prescriptions', transactionDate: new Date('2025-12-04'), type: 'expense' },
);

// Vacation Fund Transactions
const vacationCategories = insertedCategories.filter(c => c.sharedBudgetId === vacationBudgetId);
transactions.push(
  // Flights
  { sharedBudgetId: vacationBudgetId, categoryId: vacationCategories[0].id, userId, amount: 120000, description: 'Round-trip tickets to Paris', transactionDate: new Date('2025-12-01'), type: 'expense' },
  
  // Accommodation
  { sharedBudgetId: vacationBudgetId, categoryId: vacationCategories[1].id, userId, amount: 180000, description: 'Hotel booking - 14 nights', transactionDate: new Date('2025-12-05'), type: 'expense' },
  
  // Activities
  { sharedBudgetId: vacationBudgetId, categoryId: vacationCategories[2].id, userId, amount: 15000, description: 'Eiffel Tower tickets', transactionDate: new Date('2025-12-10'), type: 'expense' },
  { sharedBudgetId: vacationBudgetId, categoryId: vacationCategories[2].id, userId, amount: 12000, description: 'Louvre Museum tickets', transactionDate: new Date('2025-12-10'), type: 'expense' },
  
  // Savings contributions
  { sharedBudgetId: vacationBudgetId, categoryId: vacationCategories[3].id, userId, amount: 50000, description: 'Monthly savings contribution', transactionDate: new Date('2025-12-01'), type: 'income' },
);

for (const transaction of transactions) {
  await db.insert(sharedBudgetTransactions).values(transaction);
}
console.log(`✅ Created ${transactions.length} budget transactions\n`);

// Summary
console.log('═══════════════════════════════════════════════════');
console.log('✨ Money Hub Demo Data Population Complete! ✨');
console.log('═══════════════════════════════════════════════════');
console.log(`
📊 Summary:
  • ${insertedDebts.length} Debts created
  • ${paymentsData.length} Debt payments recorded
  • 2 Shared budgets created
  • ${insertedCategories.length} Budget categories created
  • ${transactions.length} Budget transactions recorded

💡 Features Populated:
  ✓ Debt Coach - Multiple debt types with payment history
  ✓ Budget Tracker - Family and vacation budgets
  ✓ Shared Budgets - Categories and transactions
  ✓ Payment History - 3-6 months of payments per debt

🚀 Ready to explore Money Hub features!
`);

await connection.end();
