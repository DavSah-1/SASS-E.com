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

async function verifyUserEmail(email) {
  console.log(`🔄 Manually verifying email for: ${email}\n`);

  try {
    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`   Current status: ${user.email_confirmed_at ? "Verified" : "Unverified"}\n`);

    if (user.email_confirmed_at) {
      console.log("✅ Email already verified!");
      return;
    }

    // Manually update user to mark email as confirmed
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true,
      }
    );

    if (error) {
      console.error("❌ Error verifying email:", error);
      process.exit(1);
    }

    console.log("✅ Email verified successfully!");
    console.log(`   User ${email} can now sign in.\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("❌ Usage: node verify-user-email.mjs <email>");
  process.exit(1);
}

verifyUserEmail(email);
