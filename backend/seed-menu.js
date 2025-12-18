require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

// Use service key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

const sampleMenuItems = [
  {
    name: 'Classic Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
    price: 12.99,
    category: 'beef_burgers',
    ingredients: ['Beef', 'Lettuce', 'Tomato', 'Onion', 'Special Sauce', 'Bun'],
    portion_size: 'Serves 1',
    available: true
  },
  {
    name: 'Crispy Chicken Burger',
    description: 'Crispy chicken breast with lettuce, mayo, and pickles',
    price: 11.99,
    category: 'chicken_burgers',
    ingredients: ['Chicken Breast', 'Lettuce', 'Mayo', 'Pickles', 'Bun'],
    portion_size: 'Serves 1',
    available: true
  },
  {
    name: 'Family Box Deal',
    description: '2 Burgers, 2 Fries, 2 Drinks - Perfect for sharing',
    price: 24.99,
    category: 'box_deals',
    ingredients: ['Burgers', 'Fries', 'Drinks'],
    portion_size: 'Serves 2',
    available: true
  },
  {
    name: 'Crispy Fries',
    description: 'Golden crispy potato fries with seasoning',
    price: 4.99,
    category: 'potatoes',
    ingredients: ['Potatoes', 'Salt', 'Seasoning'],
    portion_size: 'Regular',
    available: true
  },
  {
    name: 'Tonight Special Deal',
    description: 'Burger + Fries + Drink at special night price',
    price: 15.99,
    category: 'deals_night',
    ingredients: ['Burger', 'Fries', 'Drink'],
    portion_size: 'Serves 1',
    available: true
  },
  {
    name: 'Fresh Cola',
    description: 'Ice-cold cola with a refreshing taste',
    price: 2.99,
    category: 'drinks',
    ingredients: ['Cola', 'Ice'],
    portion_size: '16 oz',
    available: true
  }
];

async function seedMenu() {
  console.log('Seeding menu items...\n');

  try {
    // Check if menu items already exist
    const { data: existingItems, error: checkError } = await supabase
      .from('menu_items')
      .select('id');

    if (checkError) throw checkError;

    if (existingItems && existingItems.length > 0) {
      console.log(`⚠️  Found ${existingItems.length} existing menu items.`);
      console.log('Skipping seed to avoid duplicates.');
      console.log('Delete existing items first if you want to reseed.');
      return;
    }

    // Insert sample menu items
    const { data, error } = await supabase
      .from('menu_items')
      .insert(sampleMenuItems)
      .select();

    if (error) throw error;

    console.log(`✅ Successfully added ${data.length} menu items!\n`);
    
    data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - $${item.price}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Available: ${item.available ? 'Yes' : 'No'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error seeding menu:', error.message);
  }
}

seedMenu();
