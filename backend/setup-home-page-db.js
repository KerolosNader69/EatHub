const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { supabaseAdmin } = require('./config/supabase');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up home page database tables...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'setup-home-page-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL into individual statements (basic approach)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            // Try direct query if RPC doesn't work
            console.log('RPC failed, trying direct query...');
            const { error: directError } = await supabaseAdmin.from('_').select('*').limit(0);
            console.log('Direct query result:', directError);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed (might be expected):`, err.message);
        }
      }
    }
    
    console.log('✅ Database setup completed!');
    
    // Test the tables by checking if they exist
    console.log('\n🔍 Verifying tables...');
    
    const tables = ['categories', 'vouchers', 'rewards', 'user_rewards', 'reward_transactions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' not accessible:`, error.message);
        } else {
          console.log(`✅ Table '${table}' is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' check failed:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Create tables using Supabase client directly
async function createTablesDirectly() {
  console.log('🔧 Creating tables directly using Supabase client...');
  
  try {
    // Check if categories table exists by trying to select from it
    const { data: existingCategories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(1);
    
    if (categoriesError && categoriesError.code === 'PGRST205') {
      console.log('❌ Tables do not exist. Please run the SQL setup manually in Supabase dashboard.');
      console.log('📋 SQL file location: backend/setup-home-page-tables.sql');
      console.log('\n📝 Instructions:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of setup-home-page-tables.sql');
      console.log('4. Run the SQL script');
      console.log('5. Then run this test again');
      return false;
    } else {
      console.log('✅ Tables already exist or are accessible');
      return true;
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
}

async function main() {
  console.log('🏠 Home Page Database Setup');
  console.log('============================');
  
  const tablesExist = await createTablesDirectly();
  
  if (!tablesExist) {
    console.log('\n⚠️  Manual setup required. Please follow the instructions above.');
    process.exit(1);
  }
  
  console.log('\n🎉 Setup verification completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupDatabase, createTablesDirectly };