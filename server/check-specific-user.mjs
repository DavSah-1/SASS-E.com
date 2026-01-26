import { getSupabaseDb, supabaseUsers } from "./supabaseDb.ts";
import { eq } from "drizzle-orm";

async function checkSpecificUser() {
  const userId = "1a552d63-04e3-4768-8229-ca11f66521fb"; // davsah27940@gmail.com
  
  console.log(`🔄 Checking for user ${userId} in Supabase database...\n`);
  
  const db = await getSupabaseDb();
  if (!db) {
    console.error("❌ Failed to connect to Supabase database");
    process.exit(1);
  }

  try {
    const user = await db
      .select()
      .from(supabaseUsers)
      .where(eq(supabaseUsers.id, userId))
      .limit(1);

    if (user.length === 0) {
      console.log("❌ User NOT found in Supabase users table");
      console.log("   This means the user hasn't made any authenticated API calls yet.");
      console.log("   The user record will be created automatically on first API request.\n");
    } else {
      console.log("✅ User FOUND in Supabase users table:");
      console.log(`   Email: ${user[0].email}`);
      console.log(`   Role: ${user[0].role}`);
      console.log(`   Tier: ${user[0].subscriptionTier}`);
      console.log(`   Created: ${user[0].createdAt}`);
      console.log(`   Last Sign In: ${user[0].lastSignedIn}\n`);
    }

    // Also check all users
    const allUsers = await db.select().from(supabaseUsers);
    console.log(`📊 Total users in Supabase users table: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log("\nAll users:");
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} (${u.id})`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkSpecificUser();
