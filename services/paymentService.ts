// Payment service for handling Razorpay integration

interface CreateOrderParams {
  planId: string;
  userId?: string; // Make userId optional to maintain backward compatibility
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

// Determine if we're in development or production
const isDevelopment = () => {
  // Check if we're running on localhost
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.startsWith('localhost:') ||
         window.location.port === '3001' ||
         window.location.port === '3000' ||
         window.location.port === '5173';
};

// Get the backend URL based on environment
const getBackendUrl = () => {
  return isDevelopment() 
    ? 'http://localhost:5000' 
    : 'https://pixelwallsbackend.onrender.com';
};

export const paymentService = {
  // Create order by calling backend API
  createOrder: async (params: CreateOrderParams): Promise<OrderResponse> => {
    const backendUrl = getBackendUrl();

    console.log('Making request to backend URL:', backendUrl);
    console.log('Request params:', params);

    try {
      const response = await fetch(`${backendUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create order. Status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to create order: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Order creation response:', data);
      return data;
    } catch (error) {
      console.error('Network error during order creation:', error);
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Verify payment by calling backend API
  verifyPayment: async (params: VerifyPaymentParams): Promise<{ success: boolean }> => {
    const backendUrl = getBackendUrl();

    console.log('Verifying payment with backend URL:', backendUrl);
    console.log('Verification params:', params);

    try {
      const response = await fetch(`${backendUrl}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      console.log('Verification response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to verify payment. Status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to verify payment: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Verification response:', data);
      return data;
    } catch (error) {
      console.error('Network error during payment verification:', error);
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Fetch payment history from backend
  fetchPaymentHistory: async (): Promise<any[]> => {
    const backendUrl = getBackendUrl();
    
    try {
      console.log('Fetching payment history from:', `${backendUrl}/payment-history`);
      
      const response = await fetch(`${backendUrl}/payment-history`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('Payment history response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch payment history. Status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to fetch payment history: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Payment history response:', data);
      return data;
    } catch (error) {
      console.error('Network error during payment history fetch:', error);
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Initialize Razorpay checkout
  initiatePayment: async (options: any, backendUrl: string): Promise<boolean> => {
    console.log('Initializing payment with options:', options);
    console.log('Backend URL for verification:', backendUrl);
    
    // Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }
    
    return new Promise((resolve) => {
      const rzp = new (window as any).Razorpay({
        ...options,
        handler: async function (response: any) {
          try {
            console.log('Payment response received:', response);
            
            // Extract user_id from notes if available
            const userId = options.notes?.user_id;
            
            // Send payment details to backend for verification
            const verificationResponse = await fetch(`${backendUrl}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: userId // Include userId in verification
              })
            });
            
            const verificationResult = await verificationResponse.json();
            console.log('Verification result:', verificationResult);
            
            if (verificationResult.success) {
              resolve(true);
            } else {
              console.error('Payment verification failed:', verificationResult.error);
              resolve(false);
            }
          } catch (error) {
            console.error('Error during payment verification:', error);
            resolve(false);
          }
        }
      });
      
      rzp.on('payment.failed', async function (response: any) {
        console.error('Payment failed:', response.error);
        
        try {
          // Extract user_id from error metadata if available
          const userId = response.error.metadata?.user_id;
          
          // Send failed payment details to backend to update payment history
          const backendUrl = getBackendUrl();
          await fetch(`${backendUrl}/payment-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.error.metadata.order_id,
              error: response.error,
              userId: userId // Include userId in failed payment notification
            })
          });
        } catch (error) {
          console.error('Error updating failed payment status:', error);
        }
        
        resolve(false);
      });
      
      rzp.open();
    });
  }
};