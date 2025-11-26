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

// Get the backend URL based on environment
const getBackendUrl = () => {
  // Determine if we're in development or production
  const isDevelopment = () => {
    // Check if we're running on localhost
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('localhost:') ||
           window.location.port.startsWith('300') ||  // This will match 3000, 3001, 3002, etc.
           window.location.port === '5173';
  };
  
  // For production, use your Render backend URL
  // For development, use localhost:5000
  return isDevelopment() 
    ? 'http://localhost:5000' 
    : 'https://pixelwallsbackend.onrender.com';  // Use your Render backend URL
};

export const paymentService = {
  // Create order by calling backend API
  createOrder: async (params: CreateOrderParams): Promise<OrderResponse> => {
    const backendUrl = getBackendUrl();
    
    console.log('=== PAYMENT SERVICE DEBUG INFO ===');
    console.log('Backend URL:', backendUrl);
    console.log('Request params:', params);
    console.log('Window location:', window.location.href);
    console.log('Hostname:', window.location.hostname);
    console.log('Port:', window.location.port);
    
    // Log the plan ID being requested
    if (params.planId) {
      console.log('Requesting plan ID:', params.planId);
    }
    
    try {
      console.log('Making request to backend URL:', backendUrl);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${backendUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create order. Status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to create order: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Order creation response:', data);
      
      // Log the amount being returned from backend
      if (data.amount) {
        console.log('Amount received from backend in paise:', data.amount);
        console.log('Amount received from backend in rupees:', data.amount / 100);
      }
      
      return data;
    } catch (error) {
      console.error('=== NETWORK ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
      
      // More detailed error information
      if (error instanceof TypeError) {
        console.error('This is a network error - likely backend is unreachable');
        console.error('Possible causes:');
        console.error('1. Backend server is not running');
        console.error('2. Network connectivity issues');
        console.error('3. Firewall blocking the connection');
        console.error('4. CORS configuration issues');
        console.error('5. SSL/TLS protocol issues');
        console.error('6. DNS resolution problems');
      }
      
      // Handle timeout specifically
      if (error.name === 'AbortError') {
        throw new Error('Connection timeout - the server is not responding. Please check if the backend server is running.');
      }
      
      // Handle the "unknown or uninstrumented protocol" error specifically
      if (error.message && error.message.includes('protocol')) {
        console.error('Protocol error detected. This could be due to:');
        console.error('- SSL/TLS certificate issues');
        console.error('- Protocol mismatch between client and server');
        console.error('- Network configuration problems');
        console.error('- Proxy or firewall interference');
        
        // Try with http instead of https if we're using https
        const currentUrl = getBackendUrl();
        if (currentUrl.startsWith('https://')) {
          const httpUrl = currentUrl.replace('https://', 'http://');
          console.log('Trying with HTTP instead of HTTPS:', httpUrl);
          // Note: We won't actually retry here, but we log the suggestion
        }
      }
      
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
    console.log('INITIATING PAYMENT WITH OPTIONS:', JSON.stringify(options, null, 2));
    console.log('RAZORPAY AMOUNT IN PAISE:', options.amount);
    console.log('RAZORPAY AMOUNT IN RUPEES:', options.amount / 100);
    console.log('RAZORPAY CURRENCY:', options.currency);
    console.log('RAZORPAY ORDER ID:', options.order_id);
    console.log('RAZORPAY DESCRIPTION:', options.description);
    
    // Validate required fields
    if (!options.key) {
      throw new Error('Razorpay key is missing');
    }
    if (!options.amount) {
      throw new Error('Payment amount is missing');
    }
    if (!options.order_id) {
      throw new Error('Order ID is missing');
    }
    
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
            console.log('User ID from payment options:', userId);
            
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
          console.log('User ID from failed payment:', userId);
          
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