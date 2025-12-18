// Test if routes can be loaded without errors
console.log('Testing route loading...\n');

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

try {
  console.log('Loading menu routes...');
  const menuRoutes = require('./routes/menu');
  console.log('✅ Menu routes loaded successfully');
} catch (error) {
  console.log('❌ Menu routes failed:', error.message);
}

console.log('\nTesting controller loading...\n');

try {
  console.log('Loading categories controller...');
  const categoriesController = require('./controllers/categoriesController');
  console.log('✅ Categories controller loaded successfully');
} catch (error) {
  console.log('❌ Categories controller failed:', error.message);
}

try {
  console.log('Loading vouchers controller...');
  const vouchersController = require('./controllers/vouchersController');
  console.log('✅ Vouchers controller loaded successfully');
} catch (error) {
  console.log('❌ Vouchers controller failed:', error.message);
}

try {
  console.log('Loading rewards controller...');
  const rewardsController = require('./controllers/rewardsController');
  console.log('✅ Rewards controller loaded successfully');
} catch (error) {
  console.log('❌ Rewards controller failed:', error.message);
}

console.log('\nAll tests completed!');