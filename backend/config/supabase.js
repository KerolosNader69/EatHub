const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('��� Checking environment variables:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Regular client for general operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key for privileged operations
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if no service key

if (!supabaseServiceKey) {
  console.error('⚠️ WARNING: SUPABASE_SERVICE_KEY is missing! Using anon key instead.');
}

// Export both clients
module.exports = supabase;
module.exports.supabaseAdmin = supabaseAdmin;
// Also support named exports for destructuring
module.exports.default = supabase;
