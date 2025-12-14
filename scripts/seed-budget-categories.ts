import { drizzle } from "drizzle-orm/mysql2";
import { budgetCategories } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const defaultCategories = [
  // Income categories
  { name: "Salary", type: "income" as const, color: "#10b981", icon: "💰", isDefault: 1, sortOrder: 1 },
  { name: "Freelance", type: "income" as const, color: "#3b82f6", icon: "💼", isDefault: 1, sortOrder: 2 },
  { name: "Investments", type: "income" as const, color: "#8b5cf6", icon: "📈", isDefault: 1, sortOrder: 3 },
  { name: "Other Income", type: "income" as const, color: "#06b6d4", icon: "💵", isDefault: 1, sortOrder: 4 },
  
  // Expense categories
  { name: "Groceries", type: "expense" as const, color: "#ef4444", icon: "🛒", isDefault: 1, sortOrder: 5, monthlyLimit: 50000 }, // $500
  { name: "Utilities", type: "expense" as const, color: "#f59e0b", icon: "⚡", isDefault: 1, sortOrder: 6, monthlyLimit: 20000 }, // $200
  { name: "Entertainment", type: "expense" as const, color: "#ec4899", icon: "🎬", isDefault: 1, sortOrder: 7, monthlyLimit: 15000 }, // $150
  { name: "Transport", type: "expense" as const, color: "#6366f1", icon: "🚗", isDefault: 1, sortOrder: 8, monthlyLimit: 30000 }, // $300
  { name: "Dining Out", type: "expense" as const, color: "#f97316", icon: "🍽️", isDefault: 1, sortOrder: 9, monthlyLimit: 20000 }, // $200
  { name: "Shopping", type: "expense" as const, color: "#a855f7", icon: "🛍️", isDefault: 1, sortOrder: 10, monthlyLimit: 25000 }, // $250
  { name: "Healthcare", type: "expense" as const, color: "#14b8a6", icon: "🏥", isDefault: 1, sortOrder: 11, monthlyLimit: 15000 }, // $150
  { name: "Education", type: "expense" as const, color: "#0ea5e9", icon: "📚", isDefault: 1, sortOrder: 12, monthlyLimit: 10000 }, // $100
  { name: "Housing", type: "expense" as const, color: "#dc2626", icon: "🏠", isDefault: 1, sortOrder: 13, monthlyLimit: 150000 }, // $1500
  { name: "Insurance", type: "expense" as const, color: "#7c3aed", icon: "🛡️", isDefault: 1, sortOrder: 14, monthlyLimit: 20000 }, // $200
  { name: "Subscriptions", type: "expense" as const, color: "#db2777", icon: "📱", isDefault: 1, sortOrder: 15, monthlyLimit: 5000 }, // $50
  { name: "Fitness", type: "expense" as const, color: "#10b981", icon: "💪", isDefault: 1, sortOrder: 16, monthlyLimit: 10000 }, // $100
  { name: "Travel", type: "expense" as const, color: "#0891b2", icon: "✈️", isDefault: 1, sortOrder: 17, monthlyLimit: 50000 }, // $500
  { name: "Gifts", type: "expense" as const, color: "#f43f5e", icon: "🎁", isDefault: 1, sortOrder: 18, monthlyLimit: 10000 }, // $100
  { name: "Personal Care", type: "expense" as const, color: "#ec4899", icon: "💅", isDefault: 1, sortOrder: 19, monthlyLimit: 8000 }, // $80
  { name: "Other Expenses", type: "expense" as const, color: "#64748b", icon: "📝", isDefault: 1, sortOrder: 20, monthlyLimit: 10000 }, // $100
];

async function seedCategories() {
  console.log("Seeding default budget categories...");
  
  for (const category of defaultCategories) {
    try {
      await db.insert(budgetCategories).values({
        userId: 1, // Admin user
        ...category,
      });
      console.log(`✓ Added category: ${category.icon} ${category.name}`);
    } catch (error) {
      console.log(`⚠ Category ${category.name} may already exist, skipping...`);
    }
  }
  
  console.log("\n✅ Budget categories seeded successfully!");
  process.exit(0);
}

seedCategories().catch((error) => {
  console.error("Error seeding categories:", error);
  process.exit(1);
});
