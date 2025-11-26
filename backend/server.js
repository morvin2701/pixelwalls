const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

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

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow requests from localhost and your Vercel deployment
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://pixelwalls-wzsz.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// File path for payment history
const PAYMENT_HISTORY_FILE = path.join(__dirname, 'payment-history.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Load payment history from file or initialize empty array
let paymentHistory;
try {
  if (fs.existsSync(PAYMENT_HISTORY_FILE)) {
    const data = fs.readFileSync(PAYMENT_HISTORY_FILE, 'utf8');
    paymentHistory = JSON.parse(data);
    console.log('Loaded payment history from file:', paymentHistory.length, 'records');
  } else {
    paymentHistory = [];
    // Save empty array to create the file
    savePaymentHistory();
  }
} catch (error) {
  console.error('Error loading payment history from file:', error);
  paymentHistory = [];
}

// Load users from file or initialize empty object
let users;
try {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    console.log('Loaded users from file:', Object.keys(users).length, 'users');
  } else {
    users = {};
    // Save empty object to create the file
    saveUsers();
  }
} catch (error) {
  console.error('Error loading users from file:', error);
  users = {};
}

// Save payment history to file
const savePaymentHistory = () => {
  try {
    fs.writeFileSync(PAYMENT_HISTORY_FILE, JSON.stringify(paymentHistory, null, 2));
    console.log('Payment history saved to file');
  } catch (error) {
    console.error('Error saving payment history to file:', error);
  }
};

// Save users to file
const saveUsers = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('Users saved to file');
  } catch (error) {
    console.error('Error saving users to file:', error);
  }
};

// Initialize Razorpay instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('Razorpay initialized successfully');
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
  process.exit(1);
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

// Log the premium plans configuration
console.log('Premium plans configuration:', JSON.stringify(premiumPlans, null, 2));

// In-memory storage for payment history (in a real app, this would be a database)

// Route to create order
app.post('/create-order', async (req, res) => {
  try {
    console.log('Received create-order request:', JSON.stringify(req.body, null, 2));
    const { planId, userId } = req.body; // Extract userId from request
    
    // Validate plan
    const plan = premiumPlans[planId];
    if (!plan) {
      console.error('Invalid plan selected:', planId);
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    console.log('Creating order for plan:', JSON.stringify(plan, null, 2));
    console.log('Plan ID requested:', planId);
    console.log('Plan amount in paise:', plan.amount);
    console.log('Plan amount in rupees:', plan.amount / 100);
    
    // Create Razorpay order
    // Fix: Shorten the receipt ID to be under 40 characters
    const receiptId = `receipt_${Date.now()}`.substring(0, 40);
    
    const options = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: receiptId,
    };
    
    console.log('Razorpay order options:', JSON.stringify(options, null, 2));
    
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', JSON.stringify(order, null, 2));
    
    // Store order in payment history with user association
    const orderRecord = {
      id: order.id,
      userId: userId, // Associate with user
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      receipt: receiptId
    };
    
    console.log('Creating order record with user ID:', orderRecord);
    
    paymentHistory.push(orderRecord);
    savePaymentHistory(); // Save to file
    console.log('Payment history updated:', JSON.stringify(paymentHistory, null, 2));
    
    const response = {
      orderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      plan: plan
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error creating order:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log the full error object
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Even if order creation fails, we should log this attempt in payment history
    const errorRecord = {
      id: `error_${Date.now()}`,
      status: 'Error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      createdAt: new Date().toISOString()
    };
    
    // Add userId to error record if available
    if (req.body && req.body.userId) {
      errorRecord.userId = req.body.userId;
    }
    
    paymentHistory.push(errorRecord);
    savePaymentHistory(); // Save to file
    
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
      const paymentRecord = paymentHistory.find(record => record.id === razorpay_order_id);
      if (paymentRecord) {
        paymentRecord.status = 'Rejected';
        paymentRecord.verifiedAt = new Date().toISOString();
        paymentRecord.razorpay_payment_id = razorpay_payment_id;
        paymentRecord.razorpay_signature = razorpay_signature;
        // Ensure userId is set if not already present
        if (!paymentRecord.userId && userId) {
          paymentRecord.userId = userId;
        }
        savePaymentHistory(); // Save to file
      } else {
        // If we can't find the record, create a new one for failed payments
        const newRecord = {
          id: razorpay_order_id,
          userId: userId, // Associate with user
          status: 'Rejected',
          verifiedAt: new Date().toISOString(),
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          createdAt: new Date().toISOString()
        };
        paymentHistory.push(newRecord);
        savePaymentHistory(); // Save to file
      }
      
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    
    // Signature is valid
    console.log('Payment verification successful');
    
    // Update payment history with received status
    const paymentRecord = paymentHistory.find(record => record.id === razorpay_order_id);
    if (paymentRecord) {
      paymentRecord.status = 'Received';
      paymentRecord.verifiedAt = new Date().toISOString();
      paymentRecord.razorpay_payment_id = razorpay_payment_id;
      paymentRecord.razorpay_signature = razorpay_signature;
      // Ensure userId is set if not already present
      if (!paymentRecord.userId && userId) {
        paymentRecord.userId = userId;
      }
      // Update user's plan in the users database
      if (userId && paymentRecord.planId) {
        console.log(`Updating user ${userId} with plan ${paymentRecord.planId}`);
        if (!users[userId]) {
          users[userId] = { plans: [] };
        }
        users[userId].plans.push({
          planId: paymentRecord.planId,
          planName: paymentRecord.planName,
          purchaseDate: new Date().toISOString(),
          status: 'active'
        });
        saveUsers(); // Save users to file
      }
      savePaymentHistory(); // Save to file
    } else {
      // If we can't find the record, create a new one for successful payments
      const newRecord = {
        id: razorpay_order_id,
        userId: userId, // Associate with user
        status: 'Received',
        verifiedAt: new Date().toISOString(),
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        createdAt: new Date().toISOString()
      };
      console.log('Creating new payment record with user ID:', newRecord);
      paymentHistory.push(newRecord);
      savePaymentHistory(); // Save to file
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
app.post('/payment-failed', (req, res) => {
  try {
    console.log('Received payment failed notification:', JSON.stringify(req.body, null, 2));
    const { razorpay_order_id, error, userId } = req.body; // Extract userId
    
    // Update payment history with rejected status
    const paymentRecord = paymentHistory.find(record => record.id === razorpay_order_id);
    if (paymentRecord) {
      paymentRecord.status = 'Rejected';
      paymentRecord.verifiedAt = new Date().toISOString();
      paymentRecord.error = error;
      // Ensure userId is set if not already present
      if (!paymentRecord.userId && userId) {
        paymentRecord.userId = userId;
      }
      savePaymentHistory(); // Save to file
    } else {
      // If we can't find the record, create a new one for failed payments
      const newRecord = {
        id: razorpay_order_id,
        userId: userId, // Associate with user
        status: 'Rejected',
        verifiedAt: new Date().toISOString(),
        error: error,
        createdAt: new Date().toISOString()
      };
      console.log('Creating new failed payment record with user ID:', newRecord);
      paymentHistory.push(newRecord);
      savePaymentHistory(); // Save to file
    }
    
    console.log('Updated payment history:', JSON.stringify(paymentHistory, null, 2));
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

// Route to get user's current plan
app.get('/user-plan/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching plan for user: ${userId}`);
    
    // Check if user exists in our database
    if (users[userId]) {
      // Get the user's active plans
      const activePlans = users[userId].plans.filter(plan => plan.status === 'active');
      
      // For simplicity, we'll return the most recent active plan
      // In a real app, you might want to handle multiple active plans differently
      const currentPlan = activePlans.length > 0 ? activePlans[activePlans.length - 1] : null;
      
      res.json({ 
        userId,
        currentPlan,
        plans: users[userId].plans
      });
    } else {
      // User not found, return base plan
      res.json({ 
        userId,
        currentPlan: null,
        plans: []
      });
    }
  } catch (error) {
    console.error('Error fetching user plan:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user plan', 
      details: error.message 
    });
  }
});

// Route to get payment history for a specific user
app.get('/user-payment-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching payment history for user: ${userId}`);
    console.log(`Available payment records:`, JSON.stringify(paymentHistory, null, 2));
    
    // Filter payment history for this user
    const userPaymentHistory = paymentHistory.filter(record => {
      // Log each record for debugging
      console.log(`Checking record:`, JSON.stringify(record, null, 2));
      console.log(`Record userId: ${record.userId}, Requested userId: ${userId}`);
      console.log(`Match: ${record.userId === userId}`);
      return record.userId === userId;
    });
    
    // Ensure we always return an array, even if empty
    const result = Array.isArray(userPaymentHistory) ? userPaymentHistory : [];
    
    console.log(`Found ${result.length} payment records for user ${userId}`);
    console.log(`Result:`, JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Error fetching user payment history:', error);
    // Always return an empty array in case of error to prevent frontend issues
    res.status(200).json([]);
  }
});

// Route to get payment history
app.get('/payment-history', (req, res) => {
  try {
    console.log('Received payment history request');
    console.log('Current payment history:', JSON.stringify(paymentHistory, null, 2));
    // Ensure we always return an array
    const result = Array.isArray(paymentHistory) ? paymentHistory : [];
    res.json(result);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    // Always return an empty array in case of error
    res.status(200).json([]);
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'PixelWalls Payment Backend is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});