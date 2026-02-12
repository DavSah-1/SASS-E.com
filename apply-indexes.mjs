import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

const indexes = [
  // Users table indexes
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
  'CREATE INDEX IF NOT EXISTS idx_users_subscriptionTier ON users(subscriptionTier)',
  'CREATE INDEX IF NOT EXISTS idx_users_subscriptionStatus ON users(subscriptionStatus)',
  
  // Conversations table indexes
  'CREATE INDEX IF NOT EXISTS idx_conversations_userId ON conversations(userId)',
  'CREATE INDEX IF NOT EXISTS idx_conversations_createdAt ON conversations(createdAt)',
  'CREATE INDEX IF NOT EXISTS idx_conversations_userId_createdAt ON conversations(userId, createdAt)',
  
  // IoT Devices table indexes
  'CREATE INDEX IF NOT EXISTS idx_iot_devices_userId ON iot_devices(userId)',
  'CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status)',
  'CREATE INDEX IF NOT EXISTS idx_iot_devices_userId_status ON iot_devices(userId, status)',
  
  // IoT Command History table indexes
  'CREATE INDEX IF NOT EXISTS idx_iot_command_history_userId ON iot_command_history(userId)',
  'CREATE INDEX IF NOT EXISTS idx_iot_command_history_deviceId ON iot_command_history(deviceId)',
  'CREATE INDEX IF NOT EXISTS idx_iot_command_history_executedAt ON iot_command_history(executedAt)',
  'CREATE INDEX IF NOT EXISTS idx_iot_command_history_userId_deviceId ON iot_command_history(userId, deviceId)',
  
  // Quiz Attempts table indexes
  'CREATE INDEX IF NOT EXISTS idx_quiz_attempts_userId ON quiz_attempts(userId)',
  'CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quizId ON quiz_attempts(quizId)',
  'CREATE INDEX IF NOT EXISTS idx_quiz_attempts_createdAt ON quiz_attempts(createdAt)',
  'CREATE INDEX IF NOT EXISTS idx_quiz_attempts_userId_quizId ON quiz_attempts(userId, quizId)',
  
  // Budget Transactions table indexes
  'CREATE INDEX IF NOT EXISTS idx_budget_transactions_userId ON budget_transactions(userId)',
  'CREATE INDEX IF NOT EXISTS idx_budget_transactions_categoryId ON budget_transactions(categoryId)',
  'CREATE INDEX IF NOT EXISTS idx_budget_transactions_transactionDate ON budget_transactions(transactionDate)',
  'CREATE INDEX IF NOT EXISTS idx_budget_transactions_userId_date ON budget_transactions(userId, transactionDate)',
  
  // Financial Goals table indexes
  'CREATE INDEX IF NOT EXISTS idx_financial_goals_userId ON financial_goals(userId)',
  'CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status)',
  'CREATE INDEX IF NOT EXISTS idx_financial_goals_targetDate ON financial_goals(targetDate)',
  'CREATE INDEX IF NOT EXISTS idx_financial_goals_userId_status ON financial_goals(userId, status)',
];

async function applyIndexes() {
  console.log('Connecting to Manus database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('Applying indexes...');
  let successCount = 0;
  let errorCount = 0;
  
  for (const sql of indexes) {
    try {
      await connection.execute(sql);
      const indexName = sql.match(/idx_\w+/)[0];
      console.log(`✓ Created index: ${indexName}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error creating index: ${error.message}`);
      errorCount++;
    }
  }
  
  await connection.end();
  console.log(`\nCompleted: ${successCount} indexes created, ${errorCount} errors`);
}

applyIndexes().catch(console.error);
