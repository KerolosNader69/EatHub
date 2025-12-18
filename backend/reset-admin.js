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

async function resetAdmin() {
  console.log('Resetting admin user...\n');

  const adminEmail = 'admin@eathub.com';
  const newPassword = 'admin123456';

  try {
    // List all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    const adminUser = users.find(u => u.email === adminEmail);

    if (adminUser) {
      console.log('Found existing admin user. Updating password...');
      
      // Update user password
      const { data, error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { 
          password: newPassword,
          email_confirm: true
        }
      );

      if (error) {
        console.error('❌ Error updating user:', error.message);
        return;
      }

      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('Admin user not found. Creating new admin...');
      
      // Create new admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          username: 'admin'
        }
      });

      if (error) {
        console.error('❌ Error creating user:', error.message);
        return;
      }

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n✅ Admin credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', newPassword);
    console.log('\nYou can now login to the admin panel!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetAdmin();
