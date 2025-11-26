const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

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
    description: 'Unlock premium wallpapers',
    amount: 29900, // Amount in paise (₹299)
    currency: 'INR'
  },
  pro: {
    id: 'pro',
    name: 'Pro Premium',
    description: 'Unlock all premium features',
    amount: 59900, // Amount in paise (₹599)
    currency: 'INR'
  }
};

// Route to create order
app.post('/create-order', async (req, res) => {
  try {
    console.log('Received create-order request:', req.body);
    const { planId } = req.body;
    
    // Validate plan
    const plan = premiumPlans[planId];
    if (!plan) {
      console.error('Invalid plan selected:', planId);
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    console.log('Creating order for plan:', plan);
    
    // Create Razorpay order
    const options = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: `receipt_${uuidv4()}`,
    };
    
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order);
    
    res.json({
      orderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      plan: plan
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Route to verify payment
app.post('/verify-payment', async (req, res) => {
  try {
    console.log('Received verify-payment request:', req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify payment signature
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
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    
    // Signature is valid
    console.log('Payment verification successful');
    res.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Failed to verify payment', details: error.message });
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