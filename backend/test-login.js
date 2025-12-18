require('dotenv').config({ path: __dirname + '/.env' });
const supabase = require('./config/supabase');

async function testLogin() {
  console.log('Testing Supabase login...\n');

  const email = 'admin@eathub.com';
  const password = 'admin123456';

  try {
    console.log('Attempting to sign in with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Login error:', error);
      console.error('   Message:', error.message);
      console.error('   Status:', error.status);
      return;
    }

    console.log('✅ Login successful!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   Token:', data.session.access_token.substring(0, 30) + '...');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testLogin();
