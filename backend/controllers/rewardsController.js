const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

// Helper functions for JSON file operations
function readRewardsData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'rewards.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rewards data:', error);
    return [];
  }
}

function readUserRewardsData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'user-rewards.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user rewards data:', error);
    return {};
  }
}

function writeUserRewardsData(userRewards) {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'user-rewards.json');
    fs.writeFileSync(dataPath, JSON.stringify(userRewards, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing user rewards data:', error);
    return false;
  }
}

function readTransactionsData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'reward-transactions.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading transactions data:', error);
    return [];
  }
}

function writeTransactionsData(transactions) {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'reward-transactions.json');
    fs.writeFileSync(dataPath, JSON.stringify(transactions, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing transactions data:', error);
    return false;
  }
}

/**
 * @desc    Get user rewards status
 * @route   GET /api/rewards/status
 * @access  Public (but requires user context)
 */
const getRewardsStatus = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'guest';
    console.log('Getting rewards status for user:', userId);

    let userRewards = null;
    
    if (userId !== 'guest') {
      // Try to get from Supabase first
      try {
        const { data: supabaseRewards, error } = await supabase
          .from('user_rewards')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (!error && supabaseRewards) {
          userRewards = {
            user_id: supabaseRewards.user_id,
            current_points: supabaseRewards.current_points || 0,
            total_earned: supabaseRewards.total_earned || 0
          };
          console.log('Found user rewards in Supabase:', userRewards);
        }
      } catch (supabaseError) {
        console.log('Supabase rewards not found, checking JSON file');
      }
      
      // Fallback to JSON file if not in Supabase
      if (!userRewards) {
        const allUserRewards = readUserRewardsData();
        userRewards = allUserRewards[userId];

        if (!userRewards) {
          userRewards = {
            user_id: userId,
            current_points: 0,
            total_earned: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          allUserRewards[userId] = userRewards;
          writeUserRewardsData(allUserRewards);
        }
      }
    }

    // Get available rewards from Supabase first, then JSON file
    let availableRewards = [];
    try {
      const { data: supabaseRewardsData } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true);
      
      if (supabaseRewardsData && supabaseRewardsData.length > 0) {
        availableRewards = supabaseRewardsData.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          pointsCost: r.points_cost,
          rewardType: r.reward_type,
          rewardValue: r.reward_value
        }));
      }
    } catch (e) {
      // Fallback to JSON
      availableRewards = readRewardsData().filter(reward => reward.is_active);
    }

    // Transform response for frontend
    const responseData = {
      currentPoints: userRewards?.current_points || 0,
      totalEarned: userRewards?.total_earned || 0,
      availableRewards: availableRewards || [],
      isGuest: userId === 'guest',
      userId: userId
    };

    console.log('Returning rewards data:', responseData);

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching rewards status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch rewards status',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Redeem reward points
 * @route   POST /api/rewards/redeem
 * @access  Public (but requires user context)
 */
const redeemReward = async (req, res) => {
  try {
    const { rewardId, pointsToRedeem } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId || userId === 'guest') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User authentication required for reward redemption',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (!rewardId || !pointsToRedeem) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide rewardId and pointsToRedeem',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Get the reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();

    if (rewardError || !reward) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Reward not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Verify points match
    if (pointsToRedeem !== reward.points_cost) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Points to redeem do not match reward cost',
          code: 'POINTS_MISMATCH'
        }
      });
    }

    // Get user's current points
    const { data: userRewards, error: userError } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !userRewards) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User rewards not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Check if user has enough points
    if (userRewards.current_points < pointsToRedeem) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Insufficient points',
          code: 'INSUFFICIENT_POINTS'
        }
      });
    }

    // Start transaction: deduct points and create transaction record
    const newBalance = userRewards.current_points - pointsToRedeem;

    // Update user points
    const { data: updatedRewards, error: updateError } = await supabase
      .from('user_rewards')
      .update({
        current_points: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('reward_transactions')
      .insert([{
        user_id: userId,
        reward_id: rewardId,
        points_used: pointsToRedeem,
        transaction_type: 'redeem',
        description: `Redeemed: ${reward.title}`
      }])
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Note: In a production system, you'd want to rollback the points update here
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Reward redeemed successfully',
        newBalance: updatedRewards.current_points,
        reward: {
          id: reward.id,
          title: reward.title,
          description: reward.description,
          reward_type: reward.reward_type,
          reward_value: reward.reward_value
        },
        transaction: transaction
      }
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to redeem reward',
        code: 'REDEMPTION_ERROR'
      }
    });
  }
};

/**
 * @desc    Add points to user account (for earning points)
 * @route   POST /api/rewards/earn
 * @access  Public (but requires user context)
 */
const earnPoints = async (req, res) => {
  try {
    const { points, description } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId || userId === 'guest') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide valid points amount',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Get or create user rewards record from JSON file
    const allUserRewards = readUserRewardsData();
    let userRewards = allUserRewards[userId];

    if (!userRewards) {
      // Create new user rewards record
      userRewards = {
        user_id: userId,
        current_points: 0,
        total_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Update points
    const newCurrentPoints = userRewards.current_points + points;
    const newTotalEarned = userRewards.total_earned + points;

    userRewards.current_points = newCurrentPoints;
    userRewards.total_earned = newTotalEarned;
    userRewards.updated_at = new Date().toISOString();

    // Save updated user rewards
    allUserRewards[userId] = userRewards;
    writeUserRewardsData(allUserRewards);

    // Create transaction record
    const allTransactions = readTransactionsData();
    const transaction = {
      id: Date.now().toString(),
      user_id: userId,
      reward_id: null,
      points_used: points,
      transaction_type: 'earn',
      description: description || 'Points earned',
      created_at: new Date().toISOString()
    };

    allTransactions.push(transaction);
    writeTransactionsData(allTransactions);

    res.status(200).json({
      success: true,
      data: {
        message: 'Points earned successfully',
        pointsEarned: points,
        newBalance: userRewards.current_points,
        totalEarned: userRewards.total_earned,
        transaction: transaction
      }
    });
  } catch (error) {
    console.error('Error earning points:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to earn points',
        code: 'EARN_ERROR'
      }
    });
  }
};

/**
 * @desc    Get all rewards (Admin only)
 * @route   GET /api/rewards
 * @access  Private/Admin
 */
const getAllRewards = async (req, res) => {
  try {
    const { data: rewards, error } = await supabase
      .from('rewards')
      .select(`
        *,
        menu_items (
          name,
          price,
          image
        )
      `)
      .order('points_cost', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch rewards',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @desc    Create new reward (Admin only)
 * @route   POST /api/rewards
 * @access  Private/Admin
 */
const createReward = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      pointsCost, 
      rewardType, 
      rewardValue, 
      menuItemId 
    } = req.body;

    // Validate required fields
    if (!title || !pointsCost || !rewardType) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide title, pointsCost, and rewardType',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const rewardData = {
      title,
      description: description || '',
      points_cost: parseInt(pointsCost),
      reward_type: rewardType,
      reward_value: rewardValue ? parseFloat(rewardValue) : null,
      menu_item_id: menuItemId || null,
      is_active: true
    };

    const { data: reward, error } = await supabase
      .from('rewards')
      .insert([rewardData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: reward
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create reward',
        code: 'CREATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Update reward (Admin only)
 * @route   PUT /api/rewards/:id
 * @access  Private/Admin
 */
const updateReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      pointsCost, 
      rewardType, 
      rewardValue, 
      menuItemId,
      isActive 
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pointsCost !== undefined) updateData.points_cost = parseInt(pointsCost);
    if (rewardType !== undefined) updateData.reward_type = rewardType;
    if (rewardValue !== undefined) updateData.reward_value = rewardValue ? parseFloat(rewardValue) : null;
    if (menuItemId !== undefined) updateData.menu_item_id = menuItemId || null;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: reward, error } = await supabase
      .from('rewards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !reward) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Reward not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: reward
    });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update reward',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * @desc    Delete reward (Admin only)
 * @route   DELETE /api/rewards/:id
 * @access  Private/Admin
 */
const deleteReward = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete reward',
        code: 'DELETE_ERROR'
      }
    });
  }
};

module.exports = {
  getRewardsStatus,
  redeemReward,
  earnPoints,
  getAllRewards,
  createReward,
  updateReward,
  deleteReward
};