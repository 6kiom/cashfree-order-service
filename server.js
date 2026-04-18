const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Your Cashfree Credentials from Environment Variables
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = "https://api.cashfree.com/pg/orders";

// Function to generate Order ID → 6K-1001
function generateOrderId(shopifyOrderNumber) {
  return `6K-${shopifyOrderNumber}`;
}

// API Endpoint - Shopify will call this
app.post('/create-order', async (req, res) => {
  try {
    const { shopifyOrderNumber, amount, customerPhone, customerId } = req.body;

    // Generate custom Order ID
    const orderId = generateOrderId(shopifyOrderNumber);

    // Call Cashfree API
    const response = await fetch(CASHFREE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: parseFloat(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: String(customerId),
          customer_phone: customerPhone
        }
      })
    });

    const data = await response.json();

    // Check if order created successfully
    if (data.order_id) {
      res.json({
        success: true,
        order_id: orderId,
        payment_session_id: data.payment_session_id,
        data
      });
    } else {
      res.status(400).json({
        success: false,
        error: data
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
