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

async function checkSupabaseAuthUsers() {
  console.log("🔄 Connecting to Supabase Auth...\n");

  try {
    // Use admin API to list users
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching auth users:", error);
      process.exit(1);
    }

    if (!data || data.users.length === 0) {
      console.log("📭 No users found in Supabase Auth");
    } else {
      console.log(`📊 Found ${data.users.length} user(s) in Supabase Auth:\n`);
      data.users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email Confirmed: ${user.email_confirmed_at ? "Yes" : "No (pending)"}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at || "Never"}`);
        console.log("");
      });
    }

    console.log("✅ Supabase Auth check complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkSupabaseAuthUsers();
