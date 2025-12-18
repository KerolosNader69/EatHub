const dotenv = require('dotenv');
dotenv.config();

const { supabaseAdmin } = require('./config/supabase');

async function createTables() {
  console.log('🚀 Creating home page tables programmatically...');
  
  try {
    // First, let's check what tables exist
    console.log('📋 Checking existing tables...');
    
    // Try to query existing tables to see what's available
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .limit(1);
    
    if (!menuError) {
      console.log('✅ menu_items table exists');
      
      // Check if the new columns exist
      const { data: menuWithFeatures, error: featureError } = await supabaseAdmin
        .from('menu_items')
        .select('is_featured, featured_order')
        .limit(1);
      
      if (featureError) {
        console.log('⚠️  Featured columns do not exist in menu_items');
      } else {
        console.log('✅ Featured columns exist in menu_items');
      }
    }
    
    // Since we can't create tables directly, let's create sample data
    // and insert it into existing tables or create a workaround
    
    console.log('\n🔧 Creating sample categories data...');
    
    // For now, let's create a simple categories data structure
    // We'll store categories as a JSON configuration that can be used by the frontend
    const categoriesData = [
      {
        id: '1',
        name: 'food',
        display_name: 'Food',
        icon: '🍽️',
        background_color: '#FFE5E5',
        is_active: true,
        sort_order: 1
      },
      {
        id: '2',
        name: 'groceries',
        display_name: 'Groceries',
        icon: '🛒',
        background_color: '#E5F5E5',
        is_active: true,
        sort_order: 2
      },
      {
        id: '3',
        name: 'health-beauty',
        display_name: 'Health & Beauty',
        icon: '💄',
        background_color: '#E5E5FF',
        is_active: true,
        sort_order: 3
      },
      {
        id: '4',
        name: 'gift-donate',
        display_name: 'Gift & Donate',
        icon: '🎁',
        background_color: '#FFE5F5',
        is_active: true,
        sort_order: 4
      },
      {
        id: '5',
        name: 'store',
        display_name: 'Store',
        icon: '🏪',
        background_color: '#F5F5E5',
        is_active: true,
        sort_order: 5
      }
    ];
    
    // Save categories to a JSON file for now
    const fs = require('fs');
    const path = require('path');
    
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'categories.json'),
      JSON.stringify(categoriesData, null, 2)
    );
    
    console.log('✅ Categories data created');
    
    // Create sample vouchers data
    const vouchersData = [
      {
        id: '1',
        code: 'WELCOME10',
        title: 'Welcome Discount',
        description: 'Get 10% off your first order',
        discount_type: 'percentage',
        discount_value: 10.00,
        minimum_order: 25.00,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        usage_limit: null,
        used_count: 0
      },
      {
        id: '2',
        code: 'SAVE5',
        title: 'Save $5',
        description: 'Save $5 on orders over $30',
        discount_type: 'fixed',
        discount_value: 5.00,
        minimum_order: 30.00,
        expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        usage_limit: 100,
        used_count: 0
      },
      {
        id: '3',
        code: 'FREESHIP',
        title: 'Free Delivery',
        description: 'Free delivery on orders over $20',
        discount_type: 'fixed',
        discount_value: 3.99,
        minimum_order: 20.00,
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        usage_limit: 50,
        used_count: 0
      }
    ];
    
    fs.writeFileSync(
      path.join(dataDir, 'vouchers.json'),
      JSON.stringify(vouchersData, null, 2)
    );
    
    console.log('✅ Vouchers data created');
    
    // Create sample rewards data
    const rewardsData = [
      {
        id: '1',
        title: '$5 Off Next Order',
        description: 'Get $5 off your next order',
        points_cost: 500,
        reward_type: 'discount',
        reward_value: 5.00,
        menu_item_id: null,
        is_active: true
      },
      {
        id: '2',
        title: '$10 Off Next Order',
        description: 'Get $10 off your next order',
        points_cost: 1000,
        reward_type: 'discount',
        reward_value: 10.00,
        menu_item_id: null,
        is_active: true
      },
      {
        id: '3',
        title: 'Free Delivery',
        description: 'Free delivery on your next order',
        points_cost: 300,
        reward_type: 'discount',
        reward_value: 3.99,
        menu_item_id: null,
        is_active: true
      }
    ];
    
    fs.writeFileSync(
      path.join(dataDir, 'rewards.json'),
      JSON.stringify(rewardsData, null, 2)
    );
    
    console.log('✅ Rewards data created');
    
    // Create user rewards storage
    const userRewardsData = {};
    
    fs.writeFileSync(
      path.join(dataDir, 'user-rewards.json'),
      JSON.stringify(userRewardsData, null, 2)
    );
    
    console.log('✅ User rewards storage created');
    
    // Create reward transactions storage
    const transactionsData = [];
    
    fs.writeFileSync(
      path.join(dataDir, 'reward-transactions.json'),
      JSON.stringify(transactionsData, null, 2)
    );
    
    console.log('✅ Reward transactions storage created');
    
    console.log('\n🎉 All data files created successfully!');
    console.log('📁 Data stored in: backend/data/');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createTables().catch(console.error);
}

module.exports = { createTables };