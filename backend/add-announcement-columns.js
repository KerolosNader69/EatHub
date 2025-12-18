/**
 * Script to add announcement columns to menu_items table
 * Run this once to enable the promo banner feature
 */

const { supabaseAdmin } = require('./config/supabase');

async function addAnnouncementColumns() {
  console.log('Adding announcement columns to menu_items table...\n');

  try {
    // Check if columns already exist by trying to query them
    const { data: testData, error: testError } = await supabaseAdmin
      .from('menu_items')
      .select('is_announcement')
      .limit(1);

    if (!testError) {
      console.log('✓ Announcement columns already exist!');
      return;
    }

    console.log('Columns do not exist, adding them via SQL...');
    
    // Add columns using raw SQL
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE menu_items 
        ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS announcement_title TEXT,
        ADD COLUMN IF NOT EXISTS announcement_subtitle TEXT,
        ADD COLUMN IF NOT EXISTS announcement_price DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS announcement_priority INTEGER DEFAULT 999,
        ADD COLUMN IF NOT EXISTS announcement_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS announcement_image TEXT;
      `
    });

    if (alterError) {
      console.log('Note: RPC method not available. Please run this SQL manually in Supabase:');
      console.log(`
-- Add announcement columns to menu_items table
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS announcement_title TEXT,
ADD COLUMN IF NOT EXISTS announcement_subtitle TEXT,
ADD COLUMN IF NOT EXISTS announcement_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS announcement_priority INTEGER DEFAULT 999,
ADD COLUMN IF NOT EXISTS announcement_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS announcement_image TEXT;
      `);
      return;
    }

    console.log('✓ Announcement columns added successfully!');

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log(`
-- Add announcement columns to menu_items table
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS announcement_title TEXT,
ADD COLUMN IF NOT EXISTS announcement_subtitle TEXT,
ADD COLUMN IF NOT EXISTS announcement_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS announcement_priority INTEGER DEFAULT 999,
ADD COLUMN IF NOT EXISTS announcement_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS announcement_image TEXT;
    `);
  }
}

addAnnouncementColumns();
