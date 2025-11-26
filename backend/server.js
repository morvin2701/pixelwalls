const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sql = require('mssql');

// Load environment variables
dotenv.config();

console.log('Environment variables check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 5000);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// SQL Server configuration - SIMPLIFIED VERSION
const sqlConfig = {
  user: 'sa',
  password: 'datacare@123',
  server: '45.120.139.237',
  port: 1433,
  database: 'PixelWalls',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,  // 30 second connection timeout
    requestTimeout: 30000   // 30 second request timeout
  }
};

// Global database connection pool
let dbPool = null;

// Function to initialize database connection
async function initializeDatabase() {
  try {
    console.log('Attempting to connect to SQL Server...');
    dbPool = await sql.connect(sqlConfig);
    console.log('Connected to SQL Server successfully');
    
    // Test the connection
    const result = await dbPool.request().query('SELECT 1 as test');
    console.log('Database connection test successful:', result.recordset);
    return true;
  } catch (error) {
    console.error('Failed to connect to SQL Server:', error);
    return false;
  }
}

// Sample premium plans
const premiumPlans = {
  basic: {
    id: 'basic',
    name: 'Basic Premium',
    description: 'Unlock premium wallpapers - monthly subscription',
    amount: 30000, // Amount in paise (₹300)
    currency: 'INR'
  },
  pro: {
    id: 'pro',
    name: 'Pro Premium',
    description: 'Unlock all premium features - monthly subscription',
    amount: 100000, // Amount in paise (₹1000)
    currency: 'INR'
  }
};

console.log('Premium plans configuration:', JSON.stringify(premiumPlans, null, 2));

// HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    databaseConnected: !!dbPool
  });
});

// DATABASE TEST ENDPOINT
app.get('/test-db', async (req, res) => {
  try {
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Test users table
    const usersResult = await dbPool.request().query('SELECT COUNT(*) as count FROM users');
    const paymentsResult = await dbPool.request().query('SELECT COUNT(*) as count FROM payment_history');
    
    res.json({ 
      status: 'Database connection successful',
      usersCount: usersResult.recordset[0].count,
      paymentsCount: paymentsResult.recordset[0].count
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed',
      details: error.message
    });
  }
});

// LOGIN ENDPOINT
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if credentials match the specific requirement
    if (username.toLowerCase() !== 'abc' || password !== '123') {
      return res.status(401).json({ error: 'Invalid credentials. Please use username "abc" and password "123".' });
    }
    
    // For the specific user "abc", we'll use a fixed user ID
    const userId = 'user_abc_123';
    
    // Ensure user exists in database
    if (dbPool) {
      try {
        // Check if user exists
        const checkResult = await dbPool.request()
          .input('user_id', sql.NVarChar, userId)
          .query('SELECT id FROM users WHERE id = @user_id');
        
        // If user doesn't exist, create the user
        if (checkResult.recordset.length === 0) {
          await dbPool.request()
            .input('id', sql.NVarChar, userId)
            .input('username', sql.NVarChar, 'abc')
            .input('created_at', sql.DateTime2, new Date())
            .query('INSERT INTO users (id, username, created_at) VALUES (@id, @username, @created_at)');
          
          console.log('User "abc" created in database');
        }
      } catch (dbError) {
        console.error('Database error during user check/create:', dbError);
      }
    }
    
    res.json({ 
      success: true, 
      userId: userId,
      username: 'abc',
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// CREATE ORDER ENDPOINT
app.post('/create-order', async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { planId, userId } = req.body;
    
    // Validate inputs
    if (!planId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters: planId and userId' });
    }
    
    // Validate plan
    const plan = premiumPlans[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    console.log('Creating order for plan:', plan.name);
    
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Create Razorpay order
    const options = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    console.log('Razorpay order options:', JSON.stringify(options, null, 2));
    
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', JSON.stringify(order, null, 2));
    
    // SAVE TO DATABASE - THIS IS THE CRITICAL PART
    if (dbPool) {
      try {
        console.log('=== SAVING TO DATABASE ===');
        
        // Ensure user exists
        try {
          const userCheck = await dbPool.request()
            .input('user_id', sql.NVarChar, userId)
            .query('SELECT id FROM users WHERE id = @user_id');
          
          if (userCheck.recordset.length === 0) {
            await dbPool.request()
              .input('id', sql.NVarChar, userId)
              .input('username', sql.NVarChar, userId)
              .input('created_at', sql.DateTime2, new Date())
              .query('INSERT INTO users (id, username, created_at) VALUES (@id, @username, @created_at)');
            console.log('User created in database');
          }
        } catch (userError) {
          console.error('Error checking/creating user:', userError);
        }
        
        // Insert payment history
        const insertResult = await dbPool.request()
          .input('id', sql.NVarChar, order.id)
          .input('user_id', sql.NVarChar, userId)
          .input('plan_id', sql.NVarChar, plan.id)
          .input('plan_name', sql.NVarChar, plan.name)
          .input('amount', sql.Int, plan.amount)
          .input('currency', sql.NVarChar, plan.currency)
          .input('status', sql.NVarChar, 'Pending')
          .input('razorpay_order_id', sql.NVarChar, order.id)
          .input('created_at', sql.DateTime2, new Date())
          .query(`
            INSERT INTO payment_history 
            (id, user_id, plan_id, plan_name, amount, currency, status, razorpay_order_id, created_at)
            VALUES 
            (@id, @user_id, @plan_id, @plan_name, @amount, @currency, @status, @razorpay_order_id, @created_at)
          `);
        
        console.log('Payment history saved to database. Rows affected:', insertResult.rowsAffected);
      } catch (dbError) {
        console.error('CRITICAL ERROR: Failed to save payment history to database:', dbError);
        // We'll still return success to the frontend but log the database error
      }
    } else {
      console.log('WARNING: Database not connected, skipping save');
    }
    
    // Return response to frontend
    res.json({
      orderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        currency: plan.currency
      }
    });
    
    console.log('=== ORDER RESPONSE SENT ===');
  } catch (error) {
    console.error('CRITICAL ERROR creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.message 
    });
  }
});

// VERIFY PAYMENT ENDPOINT
app.post('/verify-payment', async (req, res) => {
  try {
    console.log('=== VERIFY PAYMENT REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
    
    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    // Verify payment signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    if (digest !== razorpay_signature) {
      console.log('Invalid signature');
      
      // Update payment status to Rejected
      if (dbPool) {
        try {
          await dbPool.request()
            .input('status', sql.NVarChar, 'Rejected')
            .input('verified_at', sql.DateTime2, new Date())
            .input('id', sql.NVarChar, razorpay_order_id)
            .query('UPDATE payment_history SET status = @status, verified_at = @verified_at WHERE id = @id');
          console.log('Payment status updated to Rejected');
        } catch (dbError) {
          console.error('Error updating payment status:', dbError);
        }
      }
      
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    
    console.log('Payment verification successful');
    
    // Update payment status to Received
    if (dbPool) {
      try {
        await dbPool.request()
          .input('status', sql.NVarChar, 'Received')
          .input('verified_at', sql.DateTime2, new Date())
          .input('razorpay_payment_id', sql.NVarChar, razorpay_payment_id)
          .input('razorpay_signature', sql.NVarChar, razorpay_signature)
          .input('id', sql.NVarChar, razorpay_order_id)
          .query(`
            UPDATE payment_history 
            SET status = @status, verified_at = @verified_at, 
                razorpay_payment_id = @razorpay_payment_id, razorpay_signature = @razorpay_signature
            WHERE id = @id
          `);
        console.log('Payment status updated to Received');
      } catch (dbError) {
        console.error('Error updating payment status:', dbError);
      }
    }
    
    res.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });
    
    console.log('=== VERIFICATION RESPONSE SENT ===');
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment', 
      details: error.message 
    });
  }
});

// GET USER PAYMENT HISTORY
app.get('/user-payment-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const result = await dbPool.request()
      .input('user_id', sql.NVarChar, userId)
      .query('SELECT * FROM payment_history WHERE user_id = @user_id ORDER BY created_at DESC');
    
    console.log(`Found ${result.recordset.length} payment records for user ${userId}`);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// START SERVER
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`=== SERVER STARTING ON PORT ${PORT} ===`);
  
  // Initialize database connection
  const dbConnected = await initializeDatabase();
  
  if (dbConnected) {
    console.log('=== DATABASE CONNECTION ESTABLISHED ===');
  } else {
    console.log('=== DATABASE CONNECTION FAILED - SERVER RUNNING WITHOUT DATABASE ===');
  }
  
  console.log('=== SERVER READY TO HANDLE REQUESTS ===');
});
