require('dotenv').config();

// Test if routes can be loaded with environment variables
console.log('Testing route loading with environment variables...\n');

console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
console.log('');

try {
  console.log('Loading categories routes...');
  const categoriesRoutes = require('./routes/categories');
  console.log('✅ Categories routes loaded successfully');
} catch (error) {
  console.log('❌ Categories routes failed:', error.message);
}

try {
  console.log('Loading vouchers routes...');
  const vouchersRoutes = require('./routes/vouchers');
  console.log('✅ Vouchers routes loaded successfully');
} catch (error) {
  console.log('❌ Vouchers routes failed:', error.message);
}

try {
  console.log('Loading rewards routes...');
  const rewardsRoutes = require('./routes/rewards');
  console.log('✅ Rewards routes loaded successfully');
} catch (error) {
  console.log('❌ Rewards routes failed:', error.message);
}

console.log('\nAll tests completed!');