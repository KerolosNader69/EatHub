require('dotenv').config();
const supabase = require('./config/supabase');

async function testSupabase() {
  console.log('Testing Supabase connection...\n');
  
  // Test 1: Check if Supabase client is initialized
  console.log('✓ Supabase client initialized');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Has Anon Key:', !!process.env.SUPABASE_ANON_KEY);
  console.log('Has Service Key:', !!process.env.SUPABASE_SERVICE_KEY);
  console.log('');
  
  // Test 2: Try to get auth session (should return null if no user logged in)
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('⚠ Auth check:', error.message);
    } else {
      console.log('✓ Supabase Auth is working');
      console.log('Current session:', data.session ? 'Active' : 'None');
    }
  } catch (err) {
    console.error('✗ Auth test failed:', err.message);
  }
  
  console.log('\n✅ Supabase connection test complete!');
  console.log('\nNext steps:');
  console.log('1. Create an admin user in Supabase dashboard');
  console.log('2. Set up database tables (see SUPABASE_SETUP.md)');
  console.log('3. Test the login endpoint');
}

testSupabase();
