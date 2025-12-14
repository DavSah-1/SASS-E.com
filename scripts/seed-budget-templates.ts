import { getDb } from "../server/db";
import { budgetTemplates } from "../drizzle/schema";

/**
 * Seed budget templates into the database
 * Run with: pnpm tsx scripts/seed-budget-templates.ts
 */
async function seedBudgetTemplates() {
  console.log("🌱 Seeding budget templates...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  const templates = [
    {
      name: "50/30/20 Rule",
      description: "Allocate 50% of income to needs, 30% to wants, and 20% to savings/debt. A balanced approach recommended by financial experts for building wealth while enjoying life.",
      strategy: "50_30_20" as const,
      isSystemTemplate: 1,
      userId: null,
      allocations: JSON.stringify({
        needs: 50,
        wants: 30,
        savings: 20,
      }),
      categoryMappings: JSON.stringify({
        needs: ["Housing", "Transportation", "Food & Dining", "Utilities", "Healthcare"],
        wants: ["Entertainment", "Shopping", "Dining Out", "Hobbies"],
        savings: ["Savings", "Investments", "Emergency Fund", "Debt Payments"],
      }),
      icon: "📊",
      sortOrder: 1,
      usageCount: 0,
    },
    {
      name: "Zero-Based Budgeting",
      description: "Assign every dollar a job until your income minus expenses equals zero. This method ensures you're intentional with every dollar and nothing goes unaccounted for.",
      strategy: "zero_based" as const,
      isSystemTemplate: 1,
      userId: null,
      allocations: JSON.stringify({
        description: "Allocate 100% of income across all categories until balance is zero",
        method: "Every dollar must be assigned to a category",
      }),
      categoryMappings: JSON.stringify({
        priority_order: [
          "Housing",
          "Utilities",
          "Food & Dining",
          "Transportation",
          "Debt Payments",
          "Savings",
          "Healthcare",
          "Insurance",
          "Entertainment",
          "Shopping",
        ],
      }),
      icon: "💯",
      sortOrder: 2,
      usageCount: 0,
    },
    {
      name: "Envelope System",
      description: "Divide cash into envelopes for different spending categories. When an envelope is empty, you stop spending in that category. Digital version uses category limits as 'envelopes'.",
      strategy: "envelope" as const,
      isSystemTemplate: 1,
      userId: null,
      allocations: JSON.stringify({
        description: "Set strict limits for each spending category",
        method: "Stop spending when category limit is reached",
      }),
      categoryMappings: JSON.stringify({
        fixed_expenses: ["Housing", "Utilities", "Insurance", "Debt Payments"],
        variable_envelopes: [
          { category: "Groceries", suggested_percentage: 10 },
          { category: "Dining Out", suggested_percentage: 5 },
          { category: "Entertainment", suggested_percentage: 5 },
          { category: "Transportation", suggested_percentage: 8 },
          { category: "Shopping", suggested_percentage: 5 },
          { category: "Personal Care", suggested_percentage: 3 },
        ],
      }),
      icon: "✉️",
      sortOrder: 3,
      usageCount: 0,
    },
  ];

  try {
    // Check if templates already exist
    const existing = await db.select().from(budgetTemplates).where();
    
    if (existing.length > 0) {
      console.log("⚠️  Budget templates already exist. Skipping seed.");
      console.log(`   Found ${existing.length} existing templates`);
      process.exit(0);
    }

    // Insert templates
    for (const template of templates) {
      await db.insert(budgetTemplates).values(template);
      console.log(`✅ Created template: ${template.name}`);
    }

    console.log(`\n🎉 Successfully seeded ${templates.length} budget templates!`);
    console.log("\nTemplates created:");
    console.log("  1. 50/30/20 Rule - Balanced approach (50% needs, 30% wants, 20% savings)");
    console.log("  2. Zero-Based Budgeting - Every dollar assigned");
    console.log("  3. Envelope System - Strict category limits");

  } catch (error) {
    console.error("❌ Error seeding budget templates:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedBudgetTemplates();
