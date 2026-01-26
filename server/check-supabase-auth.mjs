import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkSupabaseAuth() {
  console.log("🔍 SUPABASE AUTHENTICATION DIAGNOSTIC REPORT\n");
  console.log("=" .repeat(60));
  
  try {
    // 1. List all users in Supabase Auth
    console.log("\n📊 STEP 1: Checking Supabase Auth Users");
    console.log("-".repeat(60));
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching auth users:", error);
      process.exit(1);
    }

    if (!data || data.users.length === 0) {
      console.log("📭 No users found in Supabase Auth");
    } else {
      console.log(`✅ Found ${data.users.length} user(s) in Supabase Auth:\n`);
      data.users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email Confirmed: ${user.email_confirmed_at ? "✅ Yes (" + user.email_confirmed_at + ")" : "❌ No (pending verification)"}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at || "Never"}`);
        console.log(`   Phone: ${user.phone || "None"}`);
        console.log(`   Provider: ${user.app_metadata?.provider || "email"}`);
        console.log("");
      });
    }

    // 2. Check most recent user
    if (data && data.users.length > 0) {
      const recentUser = data.users.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];
      
      console.log("\n📌 MOST RECENT USER:");
      console.log("-".repeat(60));
      console.log(`Email: ${recentUser.email}`);
      console.log(`Status: ${recentUser.email_confirmed_at ? "Verified" : "Awaiting email verification"}`);
      console.log(`Can Sign In: ${recentUser.email_confirmed_at ? "✅ Yes" : "❌ No (must verify email first)"}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Diagnostic check complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkSupabaseAuth();
