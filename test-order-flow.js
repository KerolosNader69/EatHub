const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testOrderFlow() {
  console.log('🧪 Testing Complete Order Flow\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Get menu items
    console.log('\n1️⃣  Getting menu items...');
    const menuResponse = await axios.get(`${API_URL}/menu`);
    const menuItems = menuResponse.data.data;
    
    if (menuItems.length === 0) {
      console.log('❌ No menu items available');
      return;
    }

    const firstItem = menuItems[0];
    console.log('✅ Menu items retrieved');
    console.log('   Using item:', firstItem.name);
    console.log('   Price:', `$${firstItem.price}`);

    // Step 2: Create order
    console.log('\n2️⃣  Creating order...');
    const orderData = {
      items: [
        {
          itemId: firstItem.id,
          quantity: 2
        }
      ],
      customerInfo: {
        name: 'Test Customer',
        phone: '1234567890',
        address: '123 Test Street, Test City'
      },
      specialInstructions: 'Test order for flow verification'
    };

    const createResponse = await axios.post(`${API_URL}/orders`, orderData);
    const orderResult = createResponse.data.data;

    console.log('✅ Order created successfully');
    console.log('   Order Number:', orderResult.orderNumber);
    console.log('   Estimated Delivery:', orderResult.estimatedDelivery);

    // Check order structure
    if (orderResult.order) {
      console.log('\n📦 Order Details:');
      console.log('   Customer:', orderResult.order.customer_name);
      console.log('   Total Amount:', `$${orderResult.order.total_amount}`);
      console.log('   Status:', orderResult.order.status);
      console.log('   Items:', orderResult.order.order_items?.length || 0);
    }

    // Step 3: Fetch order status
    console.log('\n3️⃣  Fetching order status...');
    const statusResponse = await axios.get(`${API_URL}/orders/${orderResult.orderNumber}`);
    const orderStatus = statusResponse.data.data;

    console.log('✅ Order status retrieved');
    console.log('   Order Number:', orderStatus.order_number);
    console.log('   Customer Name:', orderStatus.customer_name);
    console.log('   Customer Phone:', orderStatus.customer_phone);
    console.log('   Customer Address:', orderStatus.customer_address);
    console.log('   Status:', orderStatus.status);
    console.log('   Total Amount:', `$${orderStatus.total_amount}`);
    console.log('   Order Items:', orderStatus.order_items?.length || 0);

    // Step 4: Verify data structure
    console.log('\n4️⃣  Verifying data structure...');
    
    const checks = {
      'Order number exists': !!orderStatus.order_number,
      'Customer name exists': !!orderStatus.customer_name,
      'Customer phone exists': !!orderStatus.customer_phone,
      'Customer address exists': !!orderStatus.customer_address,
      'Total amount is number': typeof orderStatus.total_amount === 'number',
      'Total amount > 0': parseFloat(orderStatus.total_amount) > 0,
      'Order items exist': Array.isArray(orderStatus.order_items),
      'Order items not empty': orderStatus.order_items?.length > 0,
      'Status is valid': ['received', 'preparing', 'out_for_delivery', 'delivered'].includes(orderStatus.status)
    };

    let allPassed = true;
    for (const [check, passed] of Object.entries(checks)) {
      if (passed) {
        console.log(`   ✅ ${check}`);
      } else {
        console.log(`   ❌ ${check}`);
        allPassed = false;
      }
    }

    // Step 5: Verify total calculation
    console.log('\n5️⃣  Verifying total calculation...');
    const expectedTotal = firstItem.price * 2;
    const actualTotal = parseFloat(orderStatus.total_amount);
    
    console.log('   Expected Total:', `$${expectedTotal.toFixed(2)}`);
    console.log('   Actual Total:', `$${actualTotal.toFixed(2)}`);
    
    if (Math.abs(expectedTotal - actualTotal) < 0.01) {
      console.log('   ✅ Total calculation is correct');
    } else {
      console.log('   ❌ Total calculation is incorrect');
      allPassed = false;
    }

    // Step 6: Verify order items
    console.log('\n6️⃣  Verifying order items...');
    if (orderStatus.order_items && orderStatus.order_items.length > 0) {
      const item = orderStatus.order_items[0];
      console.log('   Item Name:', item.name);
      console.log('   Item Price:', `$${item.price}`);
      console.log('   Item Quantity:', item.quantity);
      
      if (item.name && item.price && item.quantity) {
        console.log('   ✅ Order items have all required fields');
      } else {
        console.log('   ❌ Order items missing required fields');
        allPassed = false;
      }
    } else {
      console.log('   ❌ No order items found');
      allPassed = false;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('✅ ALL ORDER FLOW TESTS PASSED!');
      console.log('='.repeat(60));
      console.log('\n📋 Summary:');
      console.log('   ✅ Order creation working');
      console.log('   ✅ Order status retrieval working');
      console.log('   ✅ Data structure correct');
      console.log('   ✅ Total calculation correct');
      console.log('   ✅ Order items complete');
      console.log('\n🎉 Order flow is working perfectly!');
      console.log('\n💡 Frontend should now:');
      console.log('   - Display correct total in checkout');
      console.log('   - Show order details in confirmation');
      console.log('   - Track order status without errors');
    } else {
      console.log('⚠️  SOME CHECKS FAILED');
      console.log('='.repeat(60));
      console.log('\n📋 Please review the failed checks above.');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

testOrderFlow();
