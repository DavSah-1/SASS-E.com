import { getSupabaseDb, supabaseUsers } from "./supabaseDb.ts";

async function checkSupabaseUsers() {
  console.log("🔄 Connecting to Supabase database...");
  
  const db = await getSupabaseDb();
  if (!db) {
    console.error("❌ Failed to connect to Supabase database");
    process.exit(1);
  }

  console.log("✅ Connected to Supabase database");
  console.log("\n🔍 Checking for users in Supabase database...\n");

  try {
    const users = await db
      .select({
        id: supabaseUsers.id,
        email: supabaseUsers.email,
        role: supabaseUsers.role,
        subscriptionTier: supabaseUsers.subscriptionTier,
        createdAt: supabaseUsers.createdAt,
      })
      .from(supabaseUsers)
      .orderBy(supabaseUsers.createdAt)
      .limit(10);

    if (users.length === 0) {
      console.log("📭 No users found in Supabase database");
    } else {
      console.log(`📊 Found ${users.length} user(s) in Supabase database:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Tier: ${user.subscriptionTier}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log("");
      });
    }

    console.log("✅ Supabase database check complete!");
  } catch (error) {
    console.error("❌ Error querying Supabase database:", error);
    process.exit(1);
  }
}

checkSupabaseUsers();
