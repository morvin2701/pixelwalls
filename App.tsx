
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect } from 'react';
import { GeneratorControls } from './components/GeneratorControls';
import { ImageGrid } from './components/ImageGrid';
import { ImageModal } from './components/ImageModal';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { ApiKeyInputDialog } from './components/ApiKeyInputDialog';
import { PremiumModal } from './components/PremiumModal';
import { LoginPage } from './components/LoginPage';
import { PaymentHistoryModal } from './components/PaymentHistoryModal';
import { Wallpaper, ViewMode, GenerationParams } from './types';
import { generateWallpaperImage } from './services/geminiService';
import { useApiKey } from './hooks/useApiKey';
import { paymentService } from './services/paymentService';
import { Sparkles, Heart, LayoutGrid, Compass, PlusCircle, Crown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Initial Placeholder Data
const INITIAL_WALLPAPERS: Wallpaper[] = [
  {
    id: 'init-1',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/flamingo-1-1.png',
    prompt: 'Artistic close-up of a flamingo with vibrant pink feathers against a dark background, studio lighting',
    resolution: '2K',
    aspectRatio: '1:1',
    createdAt: Date.now(),
    favorite: false
  },
  {
    id: 'init-2',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/floatingbubbles-9-16.png',
    prompt: 'Iridescent soap bubbles floating in a dark void, macro photography, reflection of neon lights',
    resolution: '4K',
    aspectRatio: '9:16',
    createdAt: Date.now() - 10000,
    favorite: true
  },
  {
    id: 'init-3',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/floatingstones-9-16.png',
    prompt: 'Surreal composition of floating smooth stones defying gravity, zen atmosphere, soft lighting',
    resolution: '4K',
    aspectRatio: '9:16',
    createdAt: Date.now() - 20000,
    favorite: false
  },
  {
    id: 'init-4',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/googleabstract-4k.png',
    prompt: 'Abstract geometric composition with vibrant primary colors, clean lines, modern digital art',
    resolution: '4K',
    aspectRatio: '16:9',
    createdAt: Date.now() - 30000,
    favorite: false
  },
  {
    id: 'init-5',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/yosemite-4k.png',
    prompt: 'Majestic photorealistic landscape of Yosemite Valley at sunset, golden hour, highly detailed 4k',
    resolution: '4K',
    aspectRatio: '16:9',
    createdAt: Date.now() - 40000,
    favorite: false
  },
  // Example of how to add local images from the assets folder:
  {
    id: 'init-6',
    url: '/assets/images/Beaches1.png',
    prompt: 'Minimalist aerial drone shot of white waves crashing onto a black sand beach, high contrast, clean lines, lone person walking, moody atmosphere. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-7',
    url: '/assets/images/Beaches2.png',
    prompt: 'A lone palm tree silhouette against a soft pastel sunset sky over the ocean, pink, orange, and soft blue gradients, calm water, dreamy vibe. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true // or true
  },

  {
    id: 'init-8',
    url: '/assets/images/Driedplants.png',
    prompt: 'A sweeping landscape of rolling hills covered in dried pampas grass at golden hour, warm mocha and cream color palette, soft light, gentle wind, cinematic composition. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-9',
    url: '/assets/images/Leaf.png',
    prompt: 'Macro photography of a fern leaf covered in morning dew, deep sage green and warm brown tones, soft diffused forest light, shallow depth of field, organic texture, 8k resolution. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-10',
    url: '/assets/images/Leaf2.png',
    prompt: 'A vertical shot looking up through a canopy of ancient trees in a misty forest, sun rays filtering through fog, moody atmosphere, cinematic grading. --ar 9:',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-11',
    url: '/assets/images/LordShiva1.png',
    prompt: '“Traditional Indian painting style of Lord Shiva, soft watercolor texture, Mount Kailash in background, Nandi beside him, peaceful divine expression, warm tones, highly detailed, spiritual artwork, 16:9 aspect ratio, 8K.”',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-12',
    url: '/assets/images/LordShiva2.png',
    prompt: '“Lord Shiva sitting in deep meditation on Kailash mountain, glowing blue aura, trishul beside him, flowing ash-covered hair, crescent moon shining, Himalaya background with dramatic clouds, ultra-realistic style, 16:9 aspect ratio, 8K resolution, divine lighting, peaceful but powerful atmosphere, cinematic look.”',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-13',
    url: '/assets/images/Dubai-1.png',
    prompt: 'A vertical drone shot looking down at the Burj Khalifa tower cutting through the clouds at sunrise, golden light reflecting off the glass facade, futuristic city below, high detail. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-14',
    url: '/assets/images/Dubai-2.png',
    prompt: 'Street-level view looking up at towering modern skyscrapers in Dubai Marina, reflections in a puddle, "blue hour" evening light with city lights turning on, cyberpunk vibe. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false // or true
  },

  {
    id: 'init-15',
    url: '/assets/images/Dubai-3.png',
    prompt: 'A wide skyline view of Downtown Dubai from across the water at sunset, Burj Khalifa and other towers silhouetted against an orange and purple sky, cinematic, 8k. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true // or true
  },

  {
    id: 'init-16',
    url: '/assets/images/Forest.png',
    prompt: 'A vertical shot looking up through a canopy of ancient trees in a misty forest, sun rays filtering through fog, moody atmosphere, cinematic grading. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true // or true
  },

  {
    id: 'init-17',
    url: '/assets/images/LordShiva3.png',
    prompt: '“Traditional Indian painting style of Lord Shiva, soft watercolor texture, Mount Kailash in background, Nandi beside him, peaceful divine expression, warm tones, highly detailed, spiritual artwork, 16:9 aspect ratio, 8K.”',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true // or true
  },


];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>(''); // Add username state
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewMode>('gallery');
  const [mobileTab, setMobileTab] = useState<'create' | 'explore'>('create');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(INITIAL_WALLPAPERS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [currentUserPlan, setCurrentUserPlan] = useState<'base' | 'basic' | 'pro'>('base'); // Track current plan
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showApiKeyInputDialog, setShowApiKeyInputDialog] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue, requestApiKey } = useApiKey(geminiApiKey);
  
  // Load user plan and payment history from localStorage on mount
  useEffect(() => {
    // Load current user plan from localStorage
    const savedPlan = localStorage.getItem('currentUserPlan');
    if (savedPlan && (savedPlan === 'base' || savedPlan === 'basic' || savedPlan === 'pro')) {
      setCurrentUserPlan(savedPlan);
      setIsPremium(savedPlan !== 'base');
    }
    
    // Load username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
    
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
    }
  }, []);
  
  // Fetch user's plan from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetchUserPlan(userId);
      }
    }
  }, [isAuthenticated]);

  // Fetch payment history when payment history tab is active or when showPaymentHistory changes
  useEffect(() => {
    if ((activeTab === 'paymentHistory' || showPaymentHistory) && isAuthenticated) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetchUserPaymentHistory(userId);
      }
    }
  }, [activeTab, showPaymentHistory, isAuthenticated]);
  
  const fetchUserPlan = async (userId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/user-plan/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch user plan: ${response.status}`);
        // Fall back to localStorage plan
        const savedPlan = localStorage.getItem('currentUserPlan');
        if (savedPlan && (savedPlan === 'basic' || savedPlan === 'pro')) {
          setCurrentUserPlan(savedPlan);
          setIsPremium(true);
        }
        return;
      }
      
      const data = await response.json();
      console.log('User plan data:', data);
      
      // Update local state with user's plan
      if (data.currentPlan) {
        const planId = data.currentPlan.planId;
        if (planId === 'basic' || planId === 'pro') {
          setCurrentUserPlan(planId);
          setIsPremium(true);
          // Save to localStorage for persistence
          localStorage.setItem('currentUserPlan', planId);
        }
      } else {
        // No active plan, set to base
        setCurrentUserPlan('base');
        setIsPremium(false);
        localStorage.setItem('currentUserPlan', 'base');
      }
    } catch (error) {
      console.error('Failed to fetch user plan:', error);
      // Fall back to localStorage plan
      const savedPlan = localStorage.getItem('currentUserPlan');
      if (savedPlan && (savedPlan === 'basic' || savedPlan === 'pro')) {
        setCurrentUserPlan(savedPlan);
        setIsPremium(true);
      }
    }
  };
  
  const fetchUserPaymentHistory = async (userId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/user-payment-history/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Even if response is not ok, we'll handle it gracefully
      if (!response.ok) {
        console.error(`Failed to fetch user payment history: ${response.status}`);
        setPaymentHistory([]);
        return;
      }
      
      const data = await response.json();
      console.log('User payment history:', data);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('Payment history data is not an array:', data);
        setPaymentHistory([]);
        return;
      }
      
      // Transform the data to match what the PaymentHistory component expects
      const transformedData = data.map((payment: any) => ({
        id: payment.id || payment.razorpay_payment_id || `payment-${Date.now()}`,
        planName: payment.planName || payment.planId || 'Unknown Plan',
        amount: payment.amount || 0,
        currency: payment.currency || 'INR',
        status: payment.status || 'Pending',
        date: payment.verifiedAt || payment.createdAt || new Date().toISOString(),
        transactionId: payment.razorpay_payment_id || payment.id
      }));
      
      console.log('Transformed payment history:', transformedData);
      setPaymentHistory(transformedData);
    } catch (error) {
      console.error('Failed to fetch user payment history:', error);
      setError('Failed to load payment history. Please try again.');
      // Set empty array to avoid undefined errors
      setPaymentHistory([]);
    }
  };
  
  // Helper function to get backend URL
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
    
    // For production, use your server's IP address
    // For development, use localhost:5000
    return isDevelopment() 
      ? 'http://localhost:5000' 
      : 'http://45.120.139.237:1433';  // Use your server's IP and port
  };
  
  const handleApiKeyInputConfirm = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    localStorage.setItem('geminiApiKey', apiKey);
    setShowApiKeyInputDialog(false);
  };
  
  const handleApiKeyInputCancel = () => {
    setShowApiKeyInputDialog(false);
  };
  
  const handleLogin = (username: string, password: string) => {
    // Validate credentials
    console.log('Login attempt:', { username, password });
    
    // Check if username is 'abc' (case insensitive) and password is '123'
    if (username.toLowerCase() === 'abc' && password === '123') {
      setIsAuthenticated(true);
      setUsername(username); // Set username
      // Save username to localStorage
      localStorage.setItem('username', username);
      // Set a fixed userId for database operations
      localStorage.setItem('userId', 'user_abc_123');
      // Don't set API key here - it will be set when needed
    } else {
      // In a real app, you would show an error message
      alert('Invalid credentials. Please use username "abc" and password "123".');
    }
  };

  const handleLogout = () => {
    // Clear authentication state
    setIsAuthenticated(false);
    setUsername('');
    setGeminiApiKey(null);
    // Clear stored data
    localStorage.removeItem('username');
    localStorage.removeItem('geminiApiKey');
    localStorage.removeItem('currentUserPlan');
    // Reset plan to base
    setCurrentUserPlan('base');
    setIsPremium(false);
    // Clear wallpapers
    setWallpapers(INITIAL_WALLPAPERS);
    localStorage.removeItem('pixelWalls');
  };

  const handleGenerate = async (params: GenerationParams) => {
    // Check if user is on Base Version plan (no generation allowed)
    if (currentUserPlan === 'base') {
      alert('Wallpaper generation is not available on the Base Version plan. Please upgrade to Basic Premium or Pro Premium to generate wallpapers.');
      return;
    }

    // 1. Validate API Key existence before attempting anything
    const hasKey = await validateApiKey();
    if (!hasKey) {
      // If no API key, show our custom input dialog
      setShowApiKeyInputDialog(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setActiveTab('gallery'); 
    setMobileTab('explore'); // Automatically switch to explore view on mobile to see results
    
    try {
      // We now expect enhancedPrompt in the response
      const { imageBase64, mimeType, enhancedPrompt } = await generateWallpaperImage(params, geminiApiKey || undefined);
      
      const newWallpaper: Wallpaper = {
        id: crypto.randomUUID(),
        url: `data:${mimeType};base64,${imageBase64}`,
        prompt: enhancedPrompt, // Use the detailed prompt generated by Gemini Flash
        resolution: params.resolution,
        aspectRatio: params.aspectRatio,
        createdAt: Date.now(),
        favorite: false,
      };

      // Artificial delay to let the skeleton animation play a bit longer for better feel
      await new Promise(resolve => setTimeout(resolve, 500));

      setWallpapers((prev) => [newWallpaper, ...prev]);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || String(err);
      
      // 2. Check for server-side errors indicating missing access/billing
      if (
        errorMessage.includes('Requested entity was not found') || 
        errorMessage.includes('API_KEY_INVALID') ||
        errorMessage.includes('API key not valid') ||
        errorMessage.toLowerCase().includes('permission denied')
      ) {
         // Re-trigger dialog if the key was rejected by the backend
         setShowApiKeyInputDialog(true);
         // Stop here, do not show the generic error toast
         return; 
      }

      setError(errorMessage || 'Failed to generate wallpaper. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = useCallback((id: string) => {
    setWallpapers(prev => prev.map(wp => 
      wp.id === id ? { ...wp, favorite: !wp.favorite } : wp
    ));
    if (selectedWallpaper && selectedWallpaper.id === id) {
        setSelectedWallpaper(prev => prev ? {...prev, favorite: !prev.favorite} : null);
    }
  }, [selectedWallpaper]);

  const handlePurchase = async (planId: string) => {
    console.log('handlePurchase called with planId:', planId);
    
    // Handle the free base plan
    if (planId === 'base') {
      // For the free plan, we just close the modal and show a message
      setShowPremiumModal(false);
      setCurrentUserPlan('base');
      setIsPremium(false);
      // Save to localStorage
      localStorage.setItem('currentUserPlan', 'base');
      alert('You are currently using the Base Version. Upgrade to a premium plan to unlock more features!');
      return;
    }

    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('User not properly authenticated. Please log in again.');
        return;
      }
      
      console.log('Creating order for user:', userId);
      // Create order through backend, passing the userId
      const orderData = await paymentService.createOrder({ planId, userId: userId });
      
      console.log('Order data received from backend:', orderData);
      
      // Prepare Razorpay options with explicit hardcoded values
      const razorpayOptions = {
        key: 'rzp_test_RkFCO2cOtggjtn',
        amount: planId === 'pro' ? 100000 : 30000, // ₹1000 for pro, ₹300 for basic
        currency: 'INR',
        name: 'PixelWalls',
        description: planId === 'pro' 
          ? 'Pro Premium - Unlock all premium features - monthly subscription (₹1000)' 
          : 'Basic Premium - Unlock premium wallpapers - monthly subscription (₹300)',
        order_id: orderData.orderId,
        prefill: {
          name: username,
          email: '',
          contact: ''
        },
        notes: {
          plan_id: planId,
          user_id: userId,
          plan_name: planId === 'pro' ? 'Pro Premium' : 'Basic Premium',
          amount_inr: planId === 'pro' ? '1000' : '300'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment dialog closed by user');
            // Refresh payment history even if user closes the dialog
            fetchUserPaymentHistory(userId);
          }
        }
      };
      
      console.log('FINAL RAZORPAY OPTIONS BEING SENT:', JSON.stringify(razorpayOptions, null, 2));
      console.log('AMOUNT IN PAISE:', razorpayOptions.amount);
      console.log('AMOUNT IN RUPEES:', razorpayOptions.amount / 100);
      
      // Initialize payment
      const paymentSuccess = await paymentService.initiatePayment(razorpayOptions, getBackendUrl());
      
      if (paymentSuccess) {
        setIsPremium(true);
        setShowPremiumModal(false);
        // Set the current user plan based on what they purchased
        setCurrentUserPlan(planId as 'basic' | 'pro');
        // Save to localStorage for persistence across page refreshes
        localStorage.setItem('currentUserPlan', planId);
        // Refresh user's plan and payment history to show the new transaction
        fetchUserPlan(userId);
        fetchUserPaymentHistory(userId);
        alert(`Thank you for purchasing the ${orderData.plan.name} plan! Enjoy your premium features.`);
      } else {
        alert('Payment was not successful. Please try again.');
        // Refresh payment history to show the failed transaction
        fetchUserPaymentHistory(userId);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      // Refresh payment history to show the failed transaction
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetchUserPaymentHistory(userId);
      }
    }
  };

  const displayedWallpapers = activeTab === 'favorites' 
    ? wallpapers.filter(w => w.favorite) 
    : wallpapers;

  return (
    <>
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="fixed inset-0 flex bg-zinc-950 font-sans text-gray-100 selection:bg-purple-500/30 overflow-hidden">
          
          {/* API Key Dialog Overlay */}
          <AnimatePresence>
            {showApiKeyDialog && (
              <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
            )}
          </AnimatePresence>
          
          {/* Custom API Key Input Dialog */}
          <AnimatePresence>
            {showApiKeyInputDialog && (
              <ApiKeyInputDialog 
                onConfirm={handleApiKeyInputConfirm}
                onCancel={handleApiKeyInputCancel}
              />
            )}
          </AnimatePresence>
          
          {/* Premium Modal */}
          <AnimatePresence>
            {showPremiumModal && (
              <PremiumModal 
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                onPurchase={handlePurchase}
                currentUserPlan={currentUserPlan}
              />
            )}
          </AnimatePresence>
          
          {/* Payment History Modal */}
          <AnimatePresence>
            {showPaymentHistory && (
              <PaymentHistoryModal 
                payments={paymentHistory} 
                onClose={() => setShowPaymentHistory(false)} 
              />
            )}
          </AnimatePresence>

          {/* Atmospheric Background Gradient (Global) */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[150px]" 
            />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} 
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px]" 
            />
          </div>

          {/* LEFT PANEL: Command Center */}
          <aside className={`
            ${mobileTab === 'create' ? 'flex' : 'hidden'} md:flex
            w-full md:w-[420px] flex-shrink-0 flex-col 
            border-r border-white/5 bg-zinc-900/40 backdrop-blur-xl 
            z-20 relative shadow-2xl
            pb-[80px] md:pb-0
          `}>
            {/* Logo Header */}
            <div className="h-20 px-6 flex items-center border-b border-white/5 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] mr-3">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">
                  Pixel<span className="text-white/40">Walls</span>
                </span>
              </div>
              <button 
                onClick={() => setShowPremiumModal(true)}
                className="ml-auto flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-amber-500/30"
              >
                <Crown size={16} />
                {isPremium ? 'Premium' : 'Go Premium'}
              </button>
            </div>

            {/* Controls */}
            <div className="flex-1 overflow-hidden">
              <GeneratorControls onGenerate={handleGenerate} isGenerating={isGenerating} currentUserPlan={currentUserPlan} />
            </div>
          </aside>

          {/* RIGHT PANEL: Gallery Feed */}
          <main className={`
            ${mobileTab === 'explore' ? 'flex' : 'hidden'} md:flex
            flex-1 relative flex-col z-10 w-full max-w-full overflow-x-hidden
          `}>
            
            {/* Floating Header */}
            <div className="h-20 px-4 md:px-8 flex items-center justify-between shrink-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-transparent z-20">
              <div className="flex items-center gap-4">
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60"
                  >
                    {activeTab === 'gallery' ? 'Explore' : activeTab === 'favorites' ? 'Favorites' : 'Payment History'}
                  </motion.h2>
                </AnimatePresence>
                
                <div className="hidden md:block">
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div 
                        initial={{ width: 0, opacity: 0, scale: 0.9 }}
                        animate={{ width: 'auto', opacity: 1, scale: 1 }}
                        exit={{ width: 0, opacity: 0, scale: 0.9 }}
                        className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 overflow-hidden"
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-purple-400 whitespace-nowrap">Creating masterpiece...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-white/10 backdrop-blur-sm relative">
                  {/* Sliding Tab Background */}
                  <motion.div 
                    className="absolute top-1 bottom-1 rounded-lg bg-zinc-700 shadow-sm z-0"
                    layoutId="tab-background"
                    initial={false}
                    animate={{
                      left: activeTab === 'gallery' ? 4 : activeTab === 'favorites' ? '33%' : '66%',
                      width: activeTab === 'gallery' ? 'calc(33% - 6px)' : 'calc(33% - 4px)',
                      x: activeTab === 'favorites' ? 2 : activeTab === 'paymentHistory' ? 4 : 0
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />

                  <button 
                    onClick={() => setActiveTab('gallery')}
                    className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'gallery' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:inline">Gallery</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'favorites' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:inline">Favorites</span>
                  </button>
                  <button 
                    onClick={() => setShowPaymentHistory(true)}
                    className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showPaymentHistory ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span className="text-sm font-medium hidden md:inline">Payments</span>
                  </button>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Error Toast */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-24 left-8 right-8 mx-auto max-w-md bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg flex items-center justify-center z-30"
                >
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="ml-4 text-red-200 hover:text-white underline text-sm">Dismiss</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid Area */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar p-4 md:p-8 pt-0 pb-[100px] md:pb-0">
              <ImageGrid 
                wallpapers={displayedWallpapers} 
                onSelect={setSelectedWallpaper} 
                onToggleFavorite={toggleFavorite}
                isGenerating={isGenerating}
              />
            </div>
          </main>

          {/* MOBILE NAVIGATION BAR */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-between px-4 pb-4 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setMobileTab('create')}
              className="flex flex-col items-center justify-center w-1/3 h-full space-y-1.5 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'create' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500'}`}>
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium ${mobileTab === 'create' ? 'text-purple-400' : 'text-zinc-500'}`}>Create</span>
            </button>
            
            <button 
              onClick={() => setMobileTab('explore')}
              className="flex flex-col items-center justify-center w-1/3 h-full space-y-1.5 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'explore' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500'}`}>
                <Compass className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium ${mobileTab === 'explore' ? 'text-purple-400' : 'text-zinc-500'}`}>Explore</span>
            </button>
            
            <button 
              onClick={() => setShowPaymentHistory(true)}
              className="flex flex-col items-center justify-center w-1/3 h-full space-y-1.5 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${showPaymentHistory ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span className={`text-[10px] font-medium ${showPaymentHistory ? 'text-purple-400' : 'text-zinc-500'}`}>Payments</span>
            </button>
          </nav>

          {/* Modal */}
          <AnimatePresence>
            {selectedWallpaper && (
              <ImageModal 
                key="modal"
                wallpaper={selectedWallpaper} 
                onClose={() => setSelectedWallpaper(null)}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default App;
