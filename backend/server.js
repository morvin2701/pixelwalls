const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');

// Load environment variables
dotenv.config();

// Add this to check if environment variables are loaded correctly
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

// SQL Server configuration
const sqlConfig = {
  user: 'sa',
  password: 'datacare@123',
  server: '45.120.139.237',
  port: 1433,
  database: 'PixelWalls',
  options: {
    encrypt: true, // Enable encryption for Azure SQL Database
    trustServerCertificate: true // Accept self-signed certificates
  }
};

// Connect to SQL Server
let pool;
sql.connect(sqlConfig).then(poolInstance => {
  console.log('Connected to SQL Server successfully');
  pool = poolInstance;
  
  // Test the connection by running a simple query
  return poolInstance.request().query('SELECT 1 as test');
}).then(result => {
  console.log('Database connection test successful:', result.recordset);
}).catch(err => {
  console.error('Error connecting to SQL Server:', err);
});

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

// Log the premium plans configuration
console.log('Premium plans configuration:', JSON.stringify(premiumPlans, null, 2));

// Route to create order
app.post('/create-order', async (req, res) => {
  try {
    console.log('Received create-order request:', JSON.stringify(req.body, null, 2));
    const { planId, userId } = req.body; // Extract userId from request
    
    // Validate inputs
    if (!planId || !userId) {
      console.error('Missing required parameters:', { planId, userId });
      return res.status(400).json({ error: 'Missing required parameters: planId and userId' });
    }
    
    // Validate plan
    const plan = premiumPlans[planId];
    if (!plan) {
      console.error('Invalid plan selected:', planId);
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    console.log('Creating order for plan:', JSON.stringify(plan, null, 2));
    console.log('Plan ID requested:', planId);
    console.log('Original plan amount in paise:', plan.amount);
    console.log('Original plan amount in rupees:', plan.amount / 100);
    
    // Force correct amounts for each plan - SAFEGUARD
    let correctedAmount = plan.amount;
    if (planId === 'pro') {
      correctedAmount = 100000; // ₹1000
      console.log('SAFEGUARD: Correcting Pro plan amount to 100000 paise (₹1000)');
    } else if (planId === 'basic') {
      correctedAmount = 30000; // ₹300
      console.log('SAFEGUARD: Correcting Basic plan amount to 30000 paise (₹300)');
    }
    
    // DOUBLE CHECK: Ensure the amount is correct
    if (planId === 'pro' && correctedAmount !== 100000) {
      console.error('CRITICAL ERROR: Pro plan amount is incorrect:', correctedAmount);
      correctedAmount = 100000; // Force correct amount
    }
    if (planId === 'basic' && correctedAmount !== 30000) {
      console.error('CRITICAL ERROR: Basic plan amount is incorrect:', correctedAmount);
      correctedAmount = 30000; // Force correct amount
    }
    
    console.log('FINAL CORRECTED AMOUNT IN PAISE:', correctedAmount);
    console.log('FINAL CORRECTED AMOUNT IN RUPEES:', correctedAmount / 100);
    
    // Create Razorpay order
    // Fix: Shorten the receipt ID to be under 40 characters
    const receiptId = `receipt_${Date.now()}`.substring(0, 40);
    
    const options = {
      amount: correctedAmount,
      currency: plan.currency,
      receipt: receiptId,
    };
    
    console.log('Razorpay order options:', JSON.stringify(options, null, 2));
    
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', JSON.stringify(order, null, 2));
    
    // Store order in payment history with user association
    if (pool) {
      try {
        console.log('Attempting to save payment history to database...');
        console.log('Database pool is available:', !!pool);
        
        // First, check if user exists, if not create the user
        let userExists = false;
        try {
          const userCheckRequest = pool.request();
          userCheckRequest.input('user_id', sql.NVarChar, userId);
          const userCheckResult = await userCheckRequest.query(`
            SELECT COUNT(*) as count FROM users WHERE id = @user_id
          `);
          userExists = userCheckResult.recordset[0].count > 0;
          console.log('User exists:', userExists);
        } catch (userCheckError) {
          console.error('Error checking if user exists:', userCheckError);
        }
        
        // If user doesn't exist, create the user
        if (!userExists) {
          try {
            console.log('Creating new user:', userId);
            const createUserRequest = pool.request();
            createUserRequest.input('id', sql.NVarChar, userId);
            createUserRequest.input('username', sql.NVarChar, userId);
            createUserRequest.input('created_at', sql.DateTime2, new Date());
            await createUserRequest.query(`
              INSERT INTO users (id, username, created_at)
              VALUES (@id, @username, @created_at)
            `);
            console.log('User created successfully');
          } catch (createUserError) {
            console.error('Error creating user:', createUserError);
            // Continue with payment even if user creation fails
          }
        }
        
        // Now insert the payment history
        const request = pool.request();
        request.input('id', sql.NVarChar, order.id);
        request.input('user_id', sql.NVarChar, userId);
        request.input('plan_id', sql.NVarChar, plan.id);
        request.input('plan_name', sql.NVarChar, plan.name);
        request.input('amount', sql.Int, correctedAmount);
        request.input('currency', sql.NVarChar, plan.currency);
        request.input('status', sql.NVarChar, 'Pending');
        request.input('razorpay_order_id', sql.NVarChar, order.id);
        request.input('created_at', sql.DateTime2, new Date());
        
        console.log('Executing database query with parameters:', {
          id: order.id,
          user_id: userId,
          plan_id: plan.id,
          plan_name: plan.name,
          amount: correctedAmount,
          currency: plan.currency,
          status: 'Pending',
          razorpay_order_id: order.id
        });
        
        const result = await request.query(`
          INSERT INTO payment_history 
          (id, user_id, plan_id, plan_name, amount, currency, status, razorpay_order_id, created_at)
          VALUES 
          (@id, @user_id, @plan_id, @plan_name, @amount, @currency, @status, @razorpay_order_id, @created_at)
        `);
        
        console.log('Payment history saved to database. Rows affected:', result.rowsAffected);
      } catch (dbError) {
        console.error('Error saving payment history to database:', dbError);
        console.error('Database error details:', {
          message: dbError.message,
          code: dbError.code,
          originalError: dbError.originalError
        });
        // Don't return error here, continue with the response
      }
    } else {
      console.log('Database pool is not available, skipping database save');
    }
    
    const response = {
      orderId: order.id,
      amount: correctedAmount,
      currency: plan.currency,
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        amount: correctedAmount,
        currency: plan.currency
      }
    };
    
    console.log('=== FINAL BACKEND RESPONSE ===');
    console.log('ORDER ID:', response.orderId);
    console.log('AMOUNT IN PAISE:', response.amount);
    console.log('AMOUNT IN RUPEES:', response.amount / 100);
    console.log('CURRENCY:', response.currency);
    console.log('PLAN ID:', response.plan.id);
    console.log('PLAN NAME:', response.plan.name);
    console.log('FULL RESPONSE:', JSON.stringify(response, null, 2));
    console.log('==============================');
    
    res.json(response);
  } catch (error) {
    console.error('Error creating order:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log the full error object
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.message,
      name: error.name
    });
  }
});

// Route to verify payment
app.post('/verify-payment', async (req, res) => {
  try {
    console.log('Received verify-payment request:', JSON.stringify(req.body, null, 2));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body; // Extract userId
    
    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Missing required parameters for payment verification');
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    // Verify payment signature
    console.log('Verifying signature with key secret:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    console.log('Signature verification:', {
      received: razorpay_signature,
      calculated: digest,
      match: digest === razorpay_signature
    });
    
    if (digest !== razorpay_signature) {
      console.error('Invalid signature');
      
      // Update payment history with rejected status
      if (pool) {
        try {
          console.log('Updating payment history with rejected status in database...');
          const request = pool.request();
          request.input('status', sql.NVarChar, 'Rejected');
          request.input('verified_at', sql.DateTime2, new Date());
          request.input('razorpay_payment_id', sql.NVarChar, razorpay_payment_id);
          request.input('razorpay_signature', sql.NVarChar, razorpay_signature);
          request.input('id', sql.NVarChar, razorpay_order_id);
          
          const result = await request.query(`
            UPDATE payment_history 
            SET status = @status, verified_at = @verified_at, 
                razorpay_payment_id = @razorpay_payment_id, razorpay_signature = @razorpay_signature
            WHERE id = @id
          `);
          
          console.log('Payment history updated with rejected status. Rows affected:', result.rowsAffected);
        } catch (dbError) {
          console.error('Error updating payment history in database:', dbError);
          console.error('Database error details:', {
            message: dbError.message,
            code: dbError.code,
            originalError: dbError.originalError
          });
          // Continue with response even if database update fails
        }
      }
      
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    
    // Signature is valid
    console.log('Payment verification successful');
    
    // Update payment history with received status
    if (pool) {
      try {
        console.log('Updating payment history with received status in database...');
        const request = pool.request();
        request.input('status', sql.NVarChar, 'Received');
        request.input('verified_at', sql.DateTime2, new Date());
        request.input('razorpay_payment_id', sql.NVarChar, razorpay_payment_id);
        request.input('razorpay_signature', sql.NVarChar, razorpay_signature);
        request.input('id', sql.NVarChar, razorpay_order_id);
        
        const result = await request.query(`
          UPDATE payment_history 
          SET status = @status, verified_at = @verified_at, 
              razorpay_payment_id = @razorpay_payment_id, razorpay_signature = @razorpay_signature
          WHERE id = @id
        `);
        
        console.log('Payment history updated with received status. Rows affected:', result.rowsAffected);
      } catch (dbError) {
        console.error('Error updating payment history in database:', dbError);
        console.error('Database error details:', {
          message: dbError.message,
          code: dbError.code,
          originalError: dbError.originalError
        });
        // Continue with response even if database update fails
      }
    }
    
    const response = {
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error verifying payment:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log the full error object
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment', 
      details: error.message,
      name: error.name
    });
  }
});

// Route to handle failed payments
app.post('/payment-failed', async (req, res) => {
  try {
    console.log('Received payment failed notification:', JSON.stringify(req.body, null, 2));
    const { razorpay_order_id, error, userId } = req.body; // Extract userId
    
    // Validate inputs
    if (!razorpay_order_id) {
      console.error('Missing required parameter: razorpay_order_id');
      return res.status(400).json({ success: false, error: 'Missing required parameter: razorpay_order_id' });
    }
    
    // Update payment history with rejected status
    if (pool) {
      try {
        console.log('Updating payment history with rejected status for failed payment in database...');
        const request = pool.request();
        request.input('status', sql.NVarChar, 'Rejected');
        request.input('verified_at', sql.DateTime2, new Date());
        request.input('id', sql.NVarChar, razorpay_order_id);
        
        const result = await request.query(`
          UPDATE payment_history 
          SET status = @status, verified_at = @verified_at
          WHERE id = @id
        `);
        
        console.log('Payment history updated with rejected status for failed payment. Rows affected:', result.rowsAffected);
      } catch (dbError) {
        console.error('Error updating payment history in database:', dbError);
        console.error('Database error details:', {
          message: dbError.message,
          code: dbError.code,
          originalError: dbError.originalError
        });
        // Continue with response even if database update fails
      }
    }
    
    console.log('Updated payment history for failed payment');
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling failed payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to handle failed payment', 
      details: error.message 
    });
  }
});

// Route to get user's payment history
app.get('/user-payment-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching payment history for user: ${userId}`);
    
    // Validate inputs
    if (!userId) {
      console.error('Missing required parameter: userId');
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    
    if (pool) {
      try {
        console.log('Fetching payment history from database...');
        const request = pool.request();
        request.input('user_id', sql.NVarChar, userId);
        
        const result = await request.query(`
          SELECT * FROM payment_history 
          WHERE user_id = @user_id 
          ORDER BY created_at DESC
        `);
        
        console.log('Payment history fetched from database. Rows returned:', result.recordset.length);
        console.log('Payment history data:', result.recordset);
        res.json(result.recordset);
      } catch (dbError) {
        console.error('Error fetching payment history from database:', dbError);
        console.error('Database error details:', {
          message: dbError.message,
          code: dbError.code,
          originalError: dbError.originalError
        });
        // Return empty array instead of error to prevent frontend crashes
        res.json([]);
      }
    } else {
      console.log('Database pool is not available, returning empty array');
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching user payment history:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
  }
});

// Route to register a new user
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (pool) {
      try {
        // Check if user already exists
        const checkRequest = pool.request();
        checkRequest.input('username', sql.NVarChar, username);
        const checkResult = await checkRequest.query(`
          SELECT COUNT(*) as count FROM users WHERE username = @username
        `);
        
        if (checkResult.recordset[0].count > 0) {
          return res.status(400).json({ error: 'User already exists' });
        }
        
        // Create new user
        const createUserRequest = pool.request();
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        createUserRequest.input('id', sql.NVarChar, userId);
        createUserRequest.input('username', sql.NVarChar, username);
        createUserRequest.input('created_at', sql.DateTime2, new Date());
        
        await createUserRequest.query(`
          INSERT INTO users (id, username, created_at)
          VALUES (@id, @username, @created_at)
        `);
        
        console.log('User registered successfully:', username);
        res.json({ 
          success: true, 
          userId: userId,
          username: username,
          message: 'User registered successfully'
        });
      } catch (dbError) {
        console.error('Database error during registration:', dbError);
        res.status(500).json({ error: 'Failed to register user' });
      }
    } else {
      res.status(500).json({ error: 'Database connection not available' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Route to login a user
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
    
    if (pool) {
      try {
        // Check if user exists
        const checkRequest = pool.request();
        checkRequest.input('user_id', sql.NVarChar, userId);
        const checkResult = await checkRequest.query(`
          SELECT id, username FROM users WHERE id = @user_id
        `);
        
        if (checkResult.recordset.length === 0) {
          // User doesn't exist, create the user
          const createUserRequest = pool.request();
          createUserRequest.input('id', sql.NVarChar, userId);
          createUserRequest.input('username', sql.NVarChar, 'abc');
          createUserRequest.input('created_at', sql.DateTime2, new Date());
          
          await createUserRequest.query(`
            INSERT INTO users (id, username, created_at)
            VALUES (@id, @username, @created_at)
          `);
          
          console.log('User "abc" created in database');
        }
        
        console.log('User "abc" logged in successfully');
        res.json({ 
          success: true, 
          userId: userId,
          username: 'abc',
          message: 'Login successful'
        });
      } catch (dbError) {
        console.error('Database error during login:', dbError);
        // Still allow login even if database operation fails
        res.json({ 
          success: true, 
          userId: userId,
          username: 'abc',
          message: 'Login successful'
        });
      }
    } else {
      // Fallback if database is not available
      console.log('Database not available, using fallback login');
      res.json({ 
        success: true, 
        userId: userId,
        username: 'abc',
        message: 'Login successful'
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    // Still allow login even if there's an error
    res.json({ 
      success: true, 
      userId: 'user_abc_123',
      username: 'abc',
      message: 'Login successful'
    });
  }
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    console.log('Testing database connection...');
    
    // Test query to check if we can access the tables
    const result = await pool.request().query('SELECT TOP 5 * FROM payment_history ORDER BY created_at DESC');
    console.log('Database test query result:', result.recordset);
    
    res.json({ 
      status: 'Database connection successful',
      payment_history_sample: result.recordset
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed',
      details: error.message
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
