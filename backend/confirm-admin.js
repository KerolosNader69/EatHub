require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

// Use service key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function confirmAdmin() {
  console.log('Checking admin user status...\n');

  const adminEmail = 'admin@eathub.com';

  try {
    // List all users (requires service key)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      console.log('\n⚠️  Note: This requires the service role key.');
      console.log('Make sure SUPABASE_SERVICE_KEY is set in your .env file.');
      return;
    }

    const adminUser = users.find(u => u.email === adminEmail);

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('Run: node backend/create-admin.js');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('   Email:', adminUser.email);
    console.log('   ID:', adminUser.id);
    console.log('   Email Confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');
    console.log('   Created:', adminUser.created_at);

    // If email is not confirmed, confirm it
    if (!adminUser.email_confirmed_at) {
      console.log('\n📧 Confirming email...');
      
      const { data, error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { email_confirm: true }
      );

      if (error) {
        console.error('❌ Error confirming email:', error.message);
        return;
      }

      console.log('✅ Email confirmed successfully!');
    }

    console.log('\n✅ Admin user is ready to use!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@eathub.com');
    console.log('Password: admin123456');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

confirmAdmin();
