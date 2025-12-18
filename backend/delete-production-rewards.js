// Script to delete all rewards from Supabase production database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllRewards() {
  console.log('Connecting to Supabase...');
  console.log('URL:', supabaseUrl);
  
  try {
    // First, check what rewards exist
    const { data: existingRewards, error: fetchError } = await supabase
      .from('rewards')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching rewards:', fetchError);
      return;
    }
    
    console.log('Existing rewards:', existingRewards);
    
    if (!existingRewards || existingRewards.length === 0) {
      console.log('No rewards found in database');
      return;
    }
    
    // Delete all rewards
    const { error: deleteError } = await supabase
      .from('rewards')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround for delete all)
    
    if (deleteError) {
      console.error('Error deleting rewards:', deleteError);
      
      // Try alternative approach - delete by IDs
      console.log('Trying alternative delete approach...');
      for (const reward of existingRewards) {
        const { error } = await supabase
          .from('rewards')
          .delete()
          .eq('id', reward.id);
        
        if (error) {
          console.error(`Error deleting reward ${reward.id}:`, error);
        } else {
          console.log(`Deleted reward: ${reward.title}`);
        }
      }
    } else {
      console.log('All rewards deleted successfully!');
    }
    
    // Verify deletion
    const { data: remaining } = await supabase
      .from('rewards')
      .select('*');
    
    console.log('Remaining rewards:', remaining?.length || 0);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

deleteAllRewards();
