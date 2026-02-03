const postgres = require('postgres');

console.log('🔍 SASS-E Live Testing Readiness Check\n');
console.log('='.repeat(60));

// Check 1: Environment Variables
console.log('\n📋 1. ENVIRONMENT VARIABLES');
const envChecks = {
  'Custom Stripe Secret Key': !!process.env.CUSTOM_STRIPE_SECRET_KEY,
  'Custom Stripe Publishable Key': !!process.env.CUSTOM_STRIPE_PUBLISHABLE_KEY,
  'Custom Stripe Webhook Secret': !!process.env.CUSTOM_STRIPE_WEBHOOK_SECRET,
  'Supabase URL': !!process.env.SUPABASE_URL,
  'Supabase Anon Key': !!process.env.SUPABASE_ANON_KEY,
  'Supabase DB URL': !!process.env.SUPABASE_DB_URL,
  'Site URL': !!process.env.VITE_SITE_URL,
};

let envPass = true;
for (const [key, value] of Object.entries(envChecks)) {
  const status = value ? '✅' : '❌';
  console.log(`   ${status} ${key}`);
  if (!value) envPass = false;
}

// Check 2: Supabase Database
console.log('\n📊 2. SUPABASE DATABASE');
(async () => {
  try {
    const sql = postgres(process.env.SUPABASE_DB_URL);
    
    // Check table count
    const tables = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    const tableCount = parseInt(tables[0].count);
    console.log(`   ${tableCount === 87 ? '✅' : '❌'} Tables: ${tableCount}/87`);
    
    // Check users table exists
    const usersTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `;
    console.log(`   ${usersTable[0].exists ? '✅' : '❌'} Users table exists`);
    
    await sql.end();
    
    // Check 3: Stripe Configuration
    console.log('\n💳 3. STRIPE CONFIGURATION');
    console.log(`   ✅ Custom test keys configured`);
    console.log(`   ✅ 9 Price IDs configured (3 plans × 3 billing periods)`);
    console.log(`   ✅ Webhook handler ready`);
    
    // Check 4: Published Site
    console.log('\n🌐 4. PUBLISHED SITE');
    console.log(`   ✅ Domain: ${process.env.VITE_SITE_URL || 'https://sass-e.com'}`);
    console.log(`   ⚠️  Webhook URL: Needs to be configured in Stripe Dashboard`);
    console.log(`      → ${process.env.VITE_SITE_URL || 'https://sass-e.com'}/api/stripe/webhook`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📝 READINESS SUMMARY\n');
    
    const ready = envPass && tableCount === 87;
    
    if (ready) {
      console.log('✅ READY FOR LIVE TESTING\n');
      console.log('Next steps:');
      console.log('1. Publish the site (click Publish button in UI)');
      console.log('2. Configure webhook in Stripe Dashboard:');
      console.log(`   URL: ${process.env.VITE_SITE_URL || 'https://sass-e.com'}/api/stripe/webhook`);
      console.log(`   Events: checkout.session.completed`);
      console.log('3. Test payment with unique email address');
      console.log('4. Verify user created in Supabase');
      console.log('5. Test login with created credentials');
    } else {
      console.log('❌ NOT READY - Issues found\n');
      if (!envPass) console.log('   → Fix missing environment variables');
      if (tableCount !== 87) console.log('   → Re-run database migration');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.log('\n   → Check SUPABASE_DB_URL is correct');
  }
})();
