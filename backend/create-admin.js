require('dotenv').config({ path: __dirname + '/.env' });
const supabase = require('./config/supabase');

async function createAdminUser() {
  console.log('Creating admin user in Supabase...\n');

  const adminEmail = 'admin@eathub.com';
  const adminPassword = 'admin123456'; // Change this to a secure password

  try {
    // Sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          username: 'admin'
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Admin user already exists!');
        console.log('\nLogin credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        return;
      }
      throw error;
    }

    console.log('✅ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\nUser ID:', data.user?.id);
    
    if (data.user?.identities?.length === 0) {
      console.log('\n⚠️  Note: Email confirmation may be required.');
      console.log('Check your Supabase dashboard to confirm the user or disable email confirmation.');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

createAdminUser();
