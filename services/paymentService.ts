// Payment service for handling Razorpay integration

interface CreateOrderParams {
  planId: string;
}

interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  plan: {
    id: string;
    name: string;
    description: string;
  };
}

interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentService = {
  // Create order by calling backend API
  createOrder: async (params: CreateOrderParams): Promise<OrderResponse> => {
    const response = await fetch('http://localhost:5000/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    
    return response.json();
  },
  
  // Verify payment by calling backend API
  verifyPayment: async (params: VerifyPaymentParams): Promise<{ success: boolean }> => {
    const response = await fetch('http://localhost:5000/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }
    
    return response.json();
  },
  
  // Initialize Razorpay checkout
  initiatePayment: async (options: any): Promise<boolean> => {
    // Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }
    
    return new Promise((resolve) => {
      const rzp = new (window as any).Razorpay({
        ...options,
        handler: function (response: any) {
          resolve(true);
        }
      });
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        resolve(false);
      });
      
      rzp.open();
    });
  }
};