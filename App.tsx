
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect } from 'react';
import { GeneratorControls } from './components/GeneratorControls';
import { ImageGrid } from './components/ImageGrid';
import { ImageModal } from './components/ImageModal';
import { ImageEditor } from './components/ImageEditor';
import { UserProfile } from './components/UserProfile';
import { WallpaperOrganizer } from './components/WallpaperOrganizer';
import { WallpaperShare } from './components/WallpaperShare';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PremiumFeatures } from './components/PremiumFeatures';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { ApiKeyInputDialog } from './components/ApiKeyInputDialog';
import { PremiumModal } from './components/PremiumModal';
import { LoginPage } from './components/LoginPage';
import { PaymentHistoryModal } from './components/PaymentHistoryModal';
import MobileDrawerMenu from './components/MobileDrawerMenu';
import { Wallpaper, ViewMode, GenerationParams } from './types';
import { generateWallpaperImage } from './services/geminiService';
import { useApiKey } from './hooks/useApiKey';
import { paymentService } from './services/paymentService';
import { userService } from './services/userService';
import { indexedDBService } from './services/indexedDBService';
import { uploadImageToSupabase } from './services/imageStorageService';
import { getBackendUrl as getBackendUrlUtil } from './services/apiUtils';
import { fetchUserWallpapersFromSupabase, saveUserWallpaperToSupabase, updateUserWallpaperInSupabase, deleteUserWallpaperFromSupabase } from './services/userWallpapersService';
// Import the Supabase setup to ensure storage is configured
// import './services/supabaseSetup'; // Disabled to prevent initialization issues
import { Sparkles, Heart, LayoutGrid, Compass, PlusCircle, Crown, Filter, User, Tag, BarChart3 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Function to get backend URL
const getBackendUrl = () => {
  return getBackendUrlUtil();
};

// Initial Placeholder Data
// Log initial wallpapers for debugging
console.log('Initial wallpapers loaded');

const INITIAL_WALLPAPERS: Wallpaper[] = [
  {
    id: 'init-1',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/flamingo-1-1.png',
    prompt: 'Artistic close-up of a flamingo with vibrant pink feathers against a dark background, studio lighting',
    resolution: '2K',
    aspectRatio: '1:1',
    createdAt: Date.now(),
    favorite: false,
    category: 'animals'
  },
  {
    id: 'init-2',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/floatingbubbles-9-16.png',
    prompt: 'Iridescent soap bubbles floating in a dark void, macro photography, reflection of neon lights',
    resolution: '4K',
    aspectRatio: '9:16',
    createdAt: Date.now() - 10000,
    favorite: true,
    category: 'abstract'
  },
  {
    id: 'init-3',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/floatingstones-9-16.png',
    prompt: 'Surreal composition of floating smooth stones defying gravity, zen atmosphere, soft lighting',
    resolution: '4K',
    aspectRatio: '9:16',
    createdAt: Date.now() - 20000,
    favorite: false,
    category: 'abstract'
  },
  {
    id: 'init-4',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/googleabstract-4k.png',
    prompt: 'Abstract geometric composition with vibrant primary colors, clean lines, modern digital art',
    resolution: '4K',
    aspectRatio: '16:9',
    createdAt: Date.now() - 30000,
    favorite: false,
    category: 'abstract'
  },
  {
    id: 'init-5',
    url: 'https://storage.googleapis.com/sideprojects-asronline/wallpapers/yosemite-4k.png',
    prompt: 'Majestic photorealistic landscape of Yosemite Valley at sunset, golden hour, highly detailed 4k',
    resolution: '4K',
    aspectRatio: '16:9',
    createdAt: Date.now() - 40000,
    favorite: false,
    category: 'mountains'
  },
  // Example of how to add local images from the assets folder:
  {
    id: 'init-6',
    url: '/assets/images/Beaches1.png',
    prompt: 'Minimalist aerial drone shot of white waves crashing onto a black sand beach, high contrast, clean lines, lone person walking, moody atmosphere. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'beaches'
  },

  {
    id: 'init-7',
    url: '/assets/images/Beaches2.png',
    prompt: 'A lone palm tree silhouette against a soft pastel sunset sky over the ocean, pink, orange, and soft blue gradients, calm water, dreamy vibe. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true, // or true
    category: 'beaches'
  },

  {
    id: 'init-8',
    url: '/assets/images/Driedplants.png',
    prompt: 'A sweeping landscape of rolling hills covered in dried pampas grass at golden hour, warm mocha and cream color palette, soft light, gentle wind, cinematic composition. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'forest'
  },

  {
    id: 'init-9',
    url: '/assets/images/Leaf.png',
    prompt: 'Macro photography of a fern leaf covered in morning dew, deep sage green and warm brown tones, soft diffused forest light, shallow depth of field, organic texture, 8k resolution. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'forest'
  },

  {
    id: 'init-10',
    url: '/assets/images/Leaf2.png',
    prompt: 'A vertical shot looking up through a canopy of ancient trees in a misty forest, sun rays filtering through fog, moody atmosphere, cinematic grading. --ar 9:',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'forest'
  },

  {
    id: 'init-11',
    url: '/assets/images/LordShiva1.png',
    prompt: '“Traditional Indian painting style of Lord Shiva, soft watercolor texture, Mount Kailash in background, Nandi beside him, peaceful divine expression, warm tones, highly detailed, spiritual artwork, 16:9 aspect ratio, 8K.”',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'fantasy'
  },

  {
    id: 'init-12',
    url: '/assets/images/LordShiva2.png',
    prompt: '“Lord Shiva sitting in deep meditation on Kailash mountain, glowing blue aura, trishul beside him, flowing ash-covered hair, crescent moon shining, Himalaya background with dramatic clouds, ultra-realistic style, 16:9 aspect ratio, 8K resolution, divine lighting, peaceful but powerful atmosphere, cinematic look.”',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'fantasy'
  },

  {
    id: 'init-13',
    url: '/assets/images/Dubai-1.png',
    prompt: 'A vertical drone shot looking down at the Burj Khalifa tower cutting through the clouds at sunrise, golden light reflecting off the glass facade, futuristic city below, high detail. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'city'
  },

  {
    id: 'init-14',
    url: '/assets/images/Dubai-2.png',
    prompt: 'Street-level view looking up at towering modern skyscrapers in Dubai Marina, reflections in a puddle, "blue hour" evening light with city lights turning on, cyberpunk vibe. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: false, // or true
    category: 'city'
  },

  {
    id: 'init-15',
    url: '/assets/images/Dubai-3.png',
    prompt: 'A wide skyline view of Downtown Dubai from across the water at sunset, Burj Khalifa and other towers silhouetted against an orange and purple sky, cinematic, 8k. --ar 16:9',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true, // or true
    category: 'city'
  },

  {
    id: 'init-16',
    url: '/assets/images/Forest.png',
    prompt: 'A vertical shot looking up through a canopy of ancient trees in a misty forest, sun rays filtering through fog, moody atmosphere, cinematic grading. --ar 9:16',
    resolution: '4K',
    aspectRatio: '9:16', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true, // or true
    category: 'forest'
  },

  {
    id: 'init-17',
    url: '/assets/images/LordShiva3.png',
    prompt: '“Traditional Indian painting style of Lord Shiva, soft watercolor texture, Mount Kailash in background, Nandi beside him, peaceful divine expression, warm tones, highly detailed, spiritual artwork, 16:9 aspect ratio, 8K.”',
    resolution: '4K',
    aspectRatio: '16:9', // or '9:16' or '1:1'
    createdAt: Date.now(),
    favorite: true, // or true
    category: 'fantasy'
  },


];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>(''); // Add username state
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewMode>('gallery');
  const [mobileTab, setMobileTab] = useState<'create' | 'explore'>('explore');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(INITIAL_WALLPAPERS);
  
  // Debug wallpapers state changes
  useEffect(() => {
    console.log('Wallpapers state updated:', wallpapers.length, 'wallpapers');
    if (wallpapers.length > 0) {
      console.log('First wallpaper URL:', wallpapers[0].url);
    }
  }, [wallpapers]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [currentUserPlan, setCurrentUserPlan] = useState<'base' | 'basic' | 'pro'>('base'); // Track current plan
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showApiKeyInputDialog, setShowApiKeyInputDialog] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // Add category filter state
  const [showCategoryFilter, setShowCategoryFilter] = useState(false); // Add category filter dropdown state
  
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue, requestApiKey } = useApiKey(geminiApiKey);
  
  // Load user plan and payment history from localStorage on mount
  useEffect(() => {
    console.log('Initializing app state...');
    
    // Load current user plan from localStorage
    const savedPlan = localStorage.getItem('currentUserPlan');
    if (savedPlan && (savedPlan === 'base' || savedPlan === 'basic' || savedPlan === 'pro')) {
      setCurrentUserPlan(savedPlan);
      setIsPremium(savedPlan !== 'base');
      console.log('Loaded user plan:', savedPlan);
    }
    
    // Load username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      console.log('Loaded username:', savedUsername);
    }
    
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
      console.log('Loaded API key');
    }
    
    // Load user wallpapers - first check if user is authenticated
    const userId = localStorage.getItem('userId');
    const isAuthenticatedLocal = !!userId; // Check if userId exists
    
    if (isAuthenticatedLocal && userId) {
      console.log('User is authenticated, loading wallpapers for user:', userId);
      
      // First try IndexedDB
      let loadedWallpapers = null;
      if (indexedDBService.isIndexedDBSupported()) {
        try {
          console.log('IndexedDB is supported, attempting to load from IndexedDB');
          indexedDBService.loadUserWallpapers(userId)
            .then((indexedDBWallpapers) => {
              if (indexedDBWallpapers && indexedDBWallpapers.length > 0) {
                console.log('Loaded wallpapers from IndexedDB:', indexedDBWallpapers.length);
                setWallpapers(indexedDBWallpapers);
              } else {
                console.log('No wallpapers found in IndexedDB, trying localStorage');
                // If no IndexedDB wallpapers, try localStorage
                loadWallpapersFromLocalStorage(userId);
              }
            })
            .catch((error) => {
              console.error('Error loading from IndexedDB:', error);
              // Fallback to localStorage
              loadWallpapersFromLocalStorage(userId);
            });
        } catch (error) {
          console.error('Error attempting to load from IndexedDB:', error);
          // Fallback to localStorage
          loadWallpapersFromLocalStorage(userId);
        }
      } else {
        console.log('IndexedDB not supported, loading from localStorage');
        loadWallpapersFromLocalStorage(userId);
      }
    } else {
      console.log('No authenticated user found, using initial wallpapers');
      setWallpapers(INITIAL_WALLPAPERS);
    }
    
    // Function to load wallpapers from localStorage
    function loadWallpapersFromLocalStorage(userId: string) {
      const savedWallpapers = localStorage.getItem(`pixelWalls_${userId}`);
      if (savedWallpapers) {
        try {
          const parsedWallpapers = JSON.parse(savedWallpapers);
          console.log('Loaded wallpapers from localStorage:', parsedWallpapers.length);
          setWallpapers(parsedWallpapers);
          
          // If IndexedDB is supported and we loaded from localStorage, save to IndexedDB
          if (indexedDBService.isIndexedDBSupported() && parsedWallpapers.length > 0) {
            indexedDBService.saveUserWallpapers(userId, parsedWallpapers)
              .then(() => {
                console.log('Wallpapers saved to IndexedDB from localStorage');
              })
              .catch((error) => {
                console.error('Failed to save wallpapers to IndexedDB:', error);
              });
          }
        } catch (e) {
          console.error('Failed to parse saved wallpapers from localStorage:', e);
          console.log('Falling back to initial wallpapers');
          setWallpapers(INITIAL_WALLPAPERS);
        }
      } else {
        console.log('No saved wallpapers found in localStorage, using initial wallpapers');
        setWallpapers(INITIAL_WALLPAPERS);
      }
    }
  }, []);
  
  // Fetch user's plan from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetchUserPlan(userId);
        
        // Also ensure wallpapers are loaded when user authenticates
        // This handles cases where authentication state changes
        if (indexedDBService.isIndexedDBSupported()) {
          indexedDBService.loadUserWallpapers(userId)
            .then((indexedDBWallpapers) => {
              if (indexedDBWallpapers && indexedDBWallpapers.length > 0) {
                console.log('Reloaded wallpapers from IndexedDB after authentication:', indexedDBWallpapers.length);
                setWallpapers(indexedDBWallpapers);
              } else {
                // If no IndexedDB wallpapers, try localStorage
                const savedWallpapers = localStorage.getItem(`pixelWalls_${userId}`);
                if (savedWallpapers) {
                  try {
                    const parsedWallpapers = JSON.parse(savedWallpapers);
                    console.log('Reloaded wallpapers from localStorage after authentication:', parsedWallpapers.length);
                    setWallpapers(parsedWallpapers);
                  } catch (e) {
                    console.error('Failed to parse wallpapers from localStorage after authentication:', e);
                  }
                }
              }
            })
            .catch((error) => {
              console.error('Error loading wallpapers from IndexedDB after authentication:', error);
              // Fallback to localStorage
              const savedWallpapers = localStorage.getItem(`pixelWalls_${userId}`);
              if (savedWallpapers) {
                try {
                  const parsedWallpapers = JSON.parse(savedWallpapers);
                  console.log('Loaded wallpapers from localStorage after authentication:', parsedWallpapers.length);
                  setWallpapers(parsedWallpapers);
                } catch (e) {
                  console.error('Failed to parse wallpapers from localStorage after authentication:', e);
                }
              }
            });
        } else {
          // Fallback to localStorage if IndexedDB not supported
          const savedWallpapers = localStorage.getItem(`pixelWalls_${userId}`);
          if (savedWallpapers) {
            try {
              const parsedWallpapers = JSON.parse(savedWallpapers);
              console.log('Loaded wallpapers from localStorage after authentication:', parsedWallpapers.length);
              setWallpapers(parsedWallpapers);
            } catch (e) {
              console.error('Failed to parse wallpapers from localStorage after authentication:', e);
            }
          }
        }
      }
    }
  }, [isAuthenticated]);

  // Save wallpapers to local storage whenever they change
  useEffect(() => {
    console.log('Wallpapers changed, triggering save effect');
    console.log('isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      const userId = localStorage.getItem('userId');
      console.log('User ID from localStorage:', userId);
      
      if (userId) {
        // Save to IndexedDB for offline access
        if (indexedDBService.isIndexedDBSupported()) {
          console.log('IndexedDB is supported, saving wallpapers');
          
          // Save wallpapers to IndexedDB
          indexedDBService.saveUserWallpapers(userId, wallpapers)
            .then(() => {
              console.log('Wallpapers successfully saved to IndexedDB');
              
              // Also save to localStorage as backup
              try {
                localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(wallpapers));
                console.log('Wallpapers also saved to localStorage as backup');
              } catch (localStorageError) {
                console.error('Failed to save wallpapers to localStorage backup:', localStorageError);
              }
            })
            .catch((error) => {
              console.error('Failed to save wallpapers to IndexedDB:', error);
              
              // Fallback to localStorage if IndexedDB fails
              try {
                console.log('Falling back to localStorage');
                localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(wallpapers));
                console.log('Wallpapers saved to localStorage as fallback');
              } catch (localStorageError) {
                console.error('Failed to save wallpapers to localStorage fallback:', localStorageError);
              }
            });
        } else {
          console.log('IndexedDB not supported, falling back to localStorage');
          
          // Fallback to localStorage if IndexedDB is not supported
          try {
            localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(wallpapers));
            console.log('Wallpapers saved to localStorage');
          } catch (error) {
            console.error('Failed to save wallpapers to localStorage:', error);
          }
        }
      }
    }
  }, [wallpapers, isAuthenticated]);
  
  // Close category filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryFilter && event.target instanceof Element) {
        // Check if click is outside the filter dropdown
        const filterButton = document.querySelector('[title="Filter by category"]');
        const filterDropdown = document.querySelector('.absolute.right-0.top-12');
        
        if (filterButton && !filterButton.contains(event.target) && 
            filterDropdown && !filterDropdown.contains(event.target)) {
          setShowCategoryFilter(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryFilter]);
  
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
        planName: payment.plan_name || payment.planName || payment.planId || (payment.amount === 100000 ? 'Pro Premium' : payment.amount === 30000 ? 'Basic Premium' : 'Unknown Plan'),
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
  
  const getBackendUrl = () => {
    return getBackendUrlUtil();
  };
  
  const handleApiKeyInputConfirm = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    localStorage.setItem('geminiApiKey', apiKey);
    setShowApiKeyInputDialog(false);
  };
  
  const handleApiKeyInputCancel = () => {
    setShowApiKeyInputDialog(false);
  };
  
  const handleLogin = async (username: string, password: string) => {
    // Validate credentials using the userService
    console.log('Login attempt:', { username, password });
    
    try {
      const result = await userService.loginUser({ username, password });
      if (result.success && result.userId) {
        setIsAuthenticated(true);
        setUsername(username); // Set username
        // Save username and userId to localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('userId', result.userId);
        // Load user-specific wallpapers
        try {
          console.log('Attempting to load wallpapers for user:', result.userId);
          
          let loadedWallpapers = null;
          
          // First try Supabase
          try {
            console.log('Attempting to load wallpapers from Supabase');
            const supabaseWallpapers = await fetchUserWallpapersFromSupabase(result.userId);
            if (supabaseWallpapers && supabaseWallpapers.length > 0) {
              console.log('Found saved wallpapers in Supabase');
              console.log('Number of wallpapers loaded from Supabase:', supabaseWallpapers.length);
              setWallpapers(supabaseWallpapers);
              loadedWallpapers = supabaseWallpapers;
              
              // Save to IndexedDB for offline access
              if (indexedDBService.isIndexedDBSupported()) {
                try {
                  await indexedDBService.saveUserWallpapers(result.userId, supabaseWallpapers);
                  console.log('Wallpapers saved to IndexedDB from Supabase');
                } catch (saveError) {
                  console.error('Failed to save wallpapers to IndexedDB from Supabase:', saveError);
                }
              }
              
              // Save to localStorage for fallback
              try {
                localStorage.setItem(`pixelWalls_${result.userId}`, JSON.stringify(supabaseWallpapers));
                console.log('Wallpapers saved to localStorage from Supabase');
              } catch (localStorageError) {
                console.error('Failed to save wallpapers to localStorage from Supabase:', localStorageError);
              }
            } else {
              console.log('No saved wallpapers found in Supabase');
            }
          } catch (supabaseError) {
            console.error('Error loading from Supabase:', supabaseError);
          }
          
          // If no wallpapers loaded from Supabase, try IndexedDB
          if (!loadedWallpapers || loadedWallpapers.length === 0) {
            if (indexedDBService.isIndexedDBSupported()) {
              console.log('IndexedDB is supported, loading wallpapers from IndexedDB');
              try {
                loadedWallpapers = await indexedDBService.loadUserWallpapers(result.userId);
                if (loadedWallpapers && loadedWallpapers.length > 0) {
                  console.log('Found saved wallpapers in IndexedDB');
                  console.log('Number of wallpapers loaded from IndexedDB:', loadedWallpapers.length);
                  setWallpapers(loadedWallpapers);
                } else {
                  console.log('No saved wallpapers found in IndexedDB');
                }
              } catch (indexedDBError) {
                console.error('Error loading from IndexedDB:', indexedDBError);
              }
            }
          }
          
          // If no wallpapers loaded from IndexedDB, try localStorage
          if (!loadedWallpapers || loadedWallpapers.length === 0) {
            console.log('IndexedDB not supported or no data found, falling back to localStorage');
            const savedWallpapers = localStorage.getItem(`pixelWalls_${result.userId}`);
            if (savedWallpapers) {
              console.log('Found saved wallpapers in localStorage');
              try {
                const parsedWallpapers = JSON.parse(savedWallpapers);
                console.log('Parsed wallpapers from localStorage:', parsedWallpapers);
                console.log('Number of wallpapers loaded from localStorage:', parsedWallpapers.length);
                setWallpapers(parsedWallpapers);
                
                // If IndexedDB is supported, also save to IndexedDB for future use
                if (indexedDBService.isIndexedDBSupported() && parsedWallpapers.length > 0) {
                  try {
                    await indexedDBService.saveUserWallpapers(result.userId, parsedWallpapers);
                    console.log('Wallpapers saved to IndexedDB from localStorage');
                  } catch (saveError) {
                    console.error('Failed to save wallpapers to IndexedDB after loading from localStorage:', saveError);
                  }
                }
              } catch (e) {
                console.error('Failed to parse saved wallpapers:', e);
                // Fall back to initial wallpapers if parsing fails
                setWallpapers(INITIAL_WALLPAPERS);
              }
            } else {
              console.log('No saved wallpapers found in localStorage');
              // If no saved wallpapers, use initial wallpapers
              setWallpapers(INITIAL_WALLPAPERS);
            }
          }
        } catch (loadError) {
          console.error('Error loading wallpapers:', loadError);
          // Fall back to initial wallpapers if loading fails
          setWallpapers(INITIAL_WALLPAPERS);
        }
        // Don't set API key here - it will be set when needed
      } else {
        // Show error message
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Allow login to proceed even if backend is not available (demo mode)
      setIsAuthenticated(true);
      setUsername(username);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', 'demo-user-id');
      setWallpapers(INITIAL_WALLPAPERS);
      alert('Backend not available. Running in demo mode with sample wallpapers.');
    }
  };

  const handleLogout = () => {
    console.log('User logging out');
    // Clear authentication state
    setIsAuthenticated(false);
    setUsername('');
    setGeminiApiKey(null);
    // Clear stored data
    localStorage.removeItem('username');
    localStorage.removeItem('geminiApiKey');
    localStorage.removeItem('currentUserPlan');
    // Clear draft settings to ensure prompt field is empty after logout
    localStorage.removeItem('pixelwalls_draft_settings');
    // Clear prompt history if needed (optional)
    // localStorage.removeItem('pixelwalls_prompt_history');
    // Reset plan to base
    setCurrentUserPlan('base');
    setIsPremium(false);
    // Keep user wallpapers in state so they remain visible after logout
    // The wallpapers are already saved in localStorage and IndexedDB
    console.log('User logged out, keeping wallpapers in state');
    console.log('Logout completed');
  };

  const handleGenerate = async (params: GenerationParams, clearPrompt: () => void) => {
    // Check if user is on Base Version plan (no generation allowed)
    if (currentUserPlan === 'base') {
      alert('Wallpaper generation is not available on the Base Version plan. Please upgrade to Basic Premium or Pro Premium to generate wallpapers.');
      return;
    }

    // Check generation limit for Basic Premium users
    if (currentUserPlan === 'basic') {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const limitCheck = await paymentService.checkGenerationLimit(userId);
          if (limitCheck.limitExceeded) {
            alert(limitCheck.message || 'You have reached the limit of 10 images for the Basic Premium plan. Please upgrade to Pro Premium for unlimited generations.');
            return;
          }
        } catch (error) {
          console.error('Error checking generation limit:', error);
          // Continue with generation if there's an error checking the limit
        }
      }
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
      
      // Upload image to Supabase Storage (fallback to base64 if upload fails)
      // Save images in the 'placeholders/generated_images/' folder with PixelWalls naming
      // Get the next image number
      const existingWallpapers = wallpapers.filter(wp => wp.url.includes('PixelWalls_'));
      const nextNumber = existingWallpapers.length + 1;
      const fileName = `placeholders/generated_images/PixelWalls_${nextNumber.toString().padStart(2, '0')}.png`;
      const imageData = `data:${mimeType};base64,${imageBase64}`;
      
      console.log('Attempting to upload image to Supabase:', { fileName, mimeType, imageDataLength: imageData.length });
      const uploadResult = await uploadImageToSupabase(imageData, fileName);
      console.log('Upload result:', uploadResult);
      
      // Log if we're using the fallback
      if (!uploadResult.url) {
        console.warn('Using base64 fallback instead of Supabase URL');
      }
      
      let imageUrl = `data:${mimeType};base64,${imageBase64}`;
      if (uploadResult.success && uploadResult.url && uploadResult.url.trim() !== '') {
        imageUrl = uploadResult.url;
        console.log('Image successfully uploaded to Supabase:', uploadResult.url);
      } else if (uploadResult.error) {
        console.warn('Failed to upload image to Supabase (using base64 fallback):', uploadResult.error);
        // Fallback to base64 is already set as default
      } else if (uploadResult.success && (!uploadResult.url || uploadResult.url.trim() === '')) {
        console.warn('Upload was successful but no URL returned (using base64 fallback)');
      }

      const newWallpaper: Wallpaper = {
        id: crypto.randomUUID(),
        url: imageUrl, // Use Supabase URL if successful, otherwise fallback to base64
        prompt: enhancedPrompt, // Use the detailed prompt generated by Gemini Flash
        resolution: params.resolution,
        aspectRatio: params.aspectRatio,
        createdAt: Date.now(),
        favorite: false,
        category: determineCategory(enhancedPrompt)
      };
      
      console.log('Creating new wallpaper with URL:', { imageUrl, isSupabaseUrl: imageUrl.startsWith('http') });

      // Artificial delay to let the skeleton animation play a bit longer for better feel
      await new Promise(resolve => setTimeout(resolve, 500));

      setWallpapers((prev) => [newWallpaper, ...prev]);
      
      // Clear the prompt input after successful generation
      clearPrompt();
      
      // Save to Supabase
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const savedToSupabase = await saveUserWallpaperToSupabase(userId, newWallpaper);
          if (savedToSupabase) {
            console.log('Wallpaper saved to Supabase');
          } else {
            console.error('Failed to save wallpaper to Supabase');
          }
        } catch (error) {
          console.error('Failed to save wallpaper to Supabase:', error);
        }
      }

      // Increment generation count for Basic Premium users
      if (currentUserPlan === 'basic') {
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            // Call backend to increment count (fire and forget)
            fetch(`${getBackendUrl()}/increment-generation-count/${userId}`, { method: 'POST' })
              .catch(error => console.error('Error incrementing generation count:', error));
          } catch (error) {
            console.error('Error incrementing generation count:', error);
          }
        }
      }
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

  // Function to determine category based on prompt content
  const determineCategory = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Define category keywords
    const categories: Record<string, string[]> = {
      'mountains': ['mountain', 'mountains', 'peak', 'peaks', 'summit', 'alps', 'rocky', 'himalayas', 'ridge'],
      'beaches': ['beach', 'beaches', 'ocean', 'sea', 'shore', 'coast', 'sand', 'waves', 'tropical'],
      'forest': ['forest', 'woods', 'trees', 'jungle', 'woodland', 'rainforest', 'grove'],
      'city': ['city', 'urban', 'metropolis', 'skyscraper', 'downtown', 'street', 'architecture'],
      'space': ['space', 'cosmos', 'galaxy', 'universe', 'stars', 'planets', 'astronaut', 'nebula'],
      'animals': ['animal', 'animals', 'wildlife', 'creature', 'mammal', 'bird', 'fish', 'insect'],
      'abstract': ['abstract', 'geometric', 'shapes', 'pattern', 'digital', 'minimal'],
      'fantasy': ['fantasy', 'magic', 'mythical', 'dragon', 'wizard', 'castle', 'medieval'],
      'trending': ['trending', 'popular', 'viral', 'modern', 'contemporary', 'latest']
    };
    
    // Check for matches
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return category;
      }
    }
    
    // Default to 'latest' if no specific category is found
    return 'latest';
  };

  const toggleFavorite = useCallback((id: string) => {
    setWallpapers(prev => {
      const updatedWallpapers = prev.map(wp => 
        wp.id === id ? { ...wp, favorite: !wp.favorite } : wp
      );
      
      // Update in Supabase
      const userId = localStorage.getItem('userId');
      if (userId) {
        const wallpaper = updatedWallpapers.find(wp => wp.id === id);
        if (wallpaper) {
          updateUserWallpaperInSupabase(userId, wallpaper)
            .then((success) => {
              if (success) {
                console.log('Wallpaper favorite status updated in Supabase');
              } else {
                console.error('Failed to update wallpaper favorite status in Supabase');
              }
            })
            .catch((error) => {
              console.error('Error updating wallpaper favorite status in Supabase:', error);
            });
        }
      }
      
      return updatedWallpapers;
    });
    
    if (selectedWallpaper && selectedWallpaper.id === id) {
        setSelectedWallpaper(prev => prev ? {...prev, favorite: !prev.favorite} : null);
    }
  }, [selectedWallpaper]);
  
  const deleteWallpaper = useCallback(async (id: string) => {
    setWallpapers(prev => {
      const updatedWallpapers = prev.filter(wp => wp.id !== id);
      
      // Delete from Supabase
      const userId = localStorage.getItem('userId');
      if (userId) {
        deleteUserWallpaperFromSupabase(userId, id)
          .then((success) => {
            if (success) {
              console.log('Wallpaper deleted from Supabase');
            } else {
              console.error('Failed to delete wallpaper from Supabase');
            }
          })
          .catch((error) => {
            console.error('Error deleting wallpaper from Supabase:', error);
          });
      }
      
      // Save to IndexedDB if supported
      if (indexedDBService.isIndexedDBSupported()) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          indexedDBService.saveUserWallpapers(userId, updatedWallpapers)
            .then(() => {
              console.log('Wallpapers saved to IndexedDB after deletion');
            })
            .catch((error) => {
              console.error('Failed to save wallpapers to IndexedDB after deletion:', error);
              
              // Fallback to localStorage
              try {
                localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(updatedWallpapers));
                console.log('Wallpapers saved to localStorage after deletion');
              } catch (localStorageError) {
                console.error('Failed to save wallpapers to localStorage after deletion:', localStorageError);
              }
            });
        }
      } else {
        // Fallback to localStorage
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(updatedWallpapers));
            console.log('Wallpapers saved to localStorage after deletion');
          } catch (error) {
            console.error('Failed to save wallpapers to localStorage after deletion:', error);
          }
        }
      }
      
      return updatedWallpapers;
    });
  }, []);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingWallpaper, setEditingWallpaper] = useState<Wallpaper | null>(null);
  
  const handleEditWallpaper = useCallback((wallpaper: Wallpaper) => {
    setEditingWallpaper(wallpaper);
    setShowEditor(true);
  }, []);
  
  const handleSaveEditedWallpaper = useCallback(async (editedWallpaper: Wallpaper) => {
    setWallpapers(prev => {
      const updatedWallpapers = prev.map(wp => 
        wp.id === editedWallpaper.id ? editedWallpaper : wp
      );
      
      // Update in Supabase
      const userId = localStorage.getItem('userId');
      if (userId) {
        updateUserWallpaperInSupabase(userId, editedWallpaper)
          .then((success) => {
            if (success) {
              console.log('Wallpaper updated in Supabase');
            } else {
              console.error('Failed to update wallpaper in Supabase');
            }
          })
          .catch((error) => {
            console.error('Error updating wallpaper in Supabase:', error);
          });
      }
      
      // Save to IndexedDB if supported
      if (indexedDBService.isIndexedDBSupported()) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          indexedDBService.saveUserWallpapers(userId, updatedWallpapers)
            .then(() => {
              console.log('Edited wallpapers saved to IndexedDB');
            })
            .catch((error) => {
              console.error('Failed to save edited wallpapers to IndexedDB:', error);
              
              // Fallback to localStorage
              try {
                localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(updatedWallpapers));
                console.log('Edited wallpapers saved to localStorage');
              } catch (localStorageError) {
                console.error('Failed to save edited wallpapers to localStorage:', localStorageError);
              }
            });
        }
      } else {
        // Fallback to localStorage
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(updatedWallpapers));
            console.log('Edited wallpapers saved to localStorage');
          } catch (error) {
            console.error('Failed to save edited wallpapers to localStorage:', error);
          }
        }
      }
      
      return updatedWallpapers;
    });
    
    setShowEditor(false);
    setEditingWallpaper(null);
  }, []);
  
  const handleCancelEdit = useCallback(() => {
    setShowEditor(false);
    setEditingWallpaper(null);
  }, []);
  
  // State for user profile
  const [showProfile, setShowProfile] = useState(false);
  
  // State for wallpaper organizer
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWallpapers, setFilteredWallpapers] = useState<Wallpaper[]>(wallpapers);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Function to tag a wallpaper
  const handleTagWallpaper = useCallback((id: string, tags: string[]) => {
    setWallpapers(prev => {
      const updatedWallpapers = prev.map(wp => 
        wp.id === id ? { ...wp, tags } : wp
      );
      
      // Update in Supabase
      const userId = localStorage.getItem('userId');
      if (userId) {
        const wallpaper = updatedWallpapers.find(wp => wp.id === id);
        if (wallpaper) {
          updateUserWallpaperInSupabase(userId, wallpaper)
            .then((success) => {
              if (success) {
                console.log('Wallpaper tags updated in Supabase');
              } else {
                console.error('Failed to update wallpaper tags in Supabase');
              }
            })
            .catch((error) => {
              console.error('Error updating wallpaper tags in Supabase:', error);
            });
        }
      }
      
      // Save to IndexedDB if supported
      if (indexedDBService.isIndexedDBSupported()) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          indexedDBService.saveUserWallpapers(userId, updatedWallpapers)
            .then(() => {
              console.log('Wallpapers saved to IndexedDB after tagging');
            })
            .catch((error) => {
              console.error('Failed to save wallpapers to IndexedDB after tagging:', error);
              
              // Fallback to localStorage
              try {
                localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(updatedWallpapers));
                console.log('Wallpapers saved to localStorage after tagging');
              } catch (localStorageError) {
                console.error('Failed to save wallpapers to localStorage after tagging:', localStorageError);
              }
            });
        }
      } else {
        // Fallback to localStorage
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            localStorage.setItem(`pixelWalls_${userId}`, JSON.stringify(updatedWallpapers));
            console.log('Wallpapers saved to localStorage after tagging');
          } catch (error) {
            console.error('Failed to save wallpapers to localStorage after tagging:', error);
          }
        }
      }
      
      return updatedWallpapers;
    });
  }, []);
  
  // Function to search wallpapers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredWallpapers(wallpapers);
      return;
    }
    
    const filtered = wallpapers.filter(wp => 
      wp.prompt.toLowerCase().includes(query.toLowerCase()) ||
      (wp.tags && wp.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );
    
    setFilteredWallpapers(filtered);
  }, [wallpapers]);
  
  // Function to filter by tags
  const handleFilterByTags = useCallback((tags: string[]) => {
    setSelectedTags(tags);
    
    if (tags.length === 0) {
      setFilteredWallpapers(wallpapers);
      return;
    }
    
    const filtered = wallpapers.filter(wp => 
      wp.tags && tags.every(tag => wp.tags?.includes(tag))
    );
    
    setFilteredWallpapers(filtered);
  }, [wallpapers]);
  
  // State for wallpaper sharing
  const [showShare, setShowShare] = useState(false);
  const [sharingWallpaper, setSharingWallpaper] = useState<Wallpaper | null>(null);
  
  // Function to handle wallpaper sharing
  const handleShareWallpaper = useCallback((wallpaper: Wallpaper) => {
    setSharingWallpaper(wallpaper);
    setShowShare(true);
  }, []);
  
  // Function to handle like
  const handleLikeWallpaper = useCallback((id: string) => {
    // In a real implementation, this would update the like count on the server
    // For now, we'll just toggle the favorite status
    toggleFavorite(id);
  }, [toggleFavorite]);
  
  // State for analytics dashboard
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // State for premium features
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  
  // State for mobile drawer menu
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const handlePurchase = async (planId: string) => {
    console.log('=== HANDLE PURCHASE DEBUG INFO ===');
    console.log('handlePurchase called with planId:', planId);
    console.log('Current window location:', window.location.href);
    console.log('Current hostname:', window.location.hostname);
    console.log('Current port:', window.location.port);
    
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
      
      // Validate that we received a valid order ID
      if (!orderData.orderId) {
        console.error('Invalid order data received from backend:', orderData);
        alert('Failed to create payment order. Please try again.');
        return;
      }
      
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
      
      console.log('=== INITIATING PAYMENT ===');
      console.log('Razorpay options:', razorpayOptions);
      console.log('Backend URL for payment:', getBackendUrl());
      
      // Initialize payment
      const paymentSuccess = await paymentService.initiatePayment(razorpayOptions, getBackendUrl());
      
      console.log('Payment result:', paymentSuccess);
      
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
      console.error('=== PAYMENT ERROR DETAILS ===');
      console.error('Payment failed:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
      
      let errorMessage = 'An unknown error occurred. Please try again.';
      
      // Handle specific Razorpay gateway errors
      if (error.message && error.message.includes('Payment processing failed due to error at bank or wallet gateway')) {
        errorMessage = 'Payment processing failed at the bank or wallet level. This could be due to:\n\n1. Insufficient funds\n2. Card declined\n3. Invalid card details\n4. Expired card\n5. Network issues\n\nPlease check your payment details and try again.';
      } else if (error instanceof TypeError) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the payment server. Please make sure:\n\n1. The backend server is running\n2. You have internet connectivity\n3. Firewall is not blocking the connection\n4. The server address is correct\n\nTechnical details: ' + error.message;
        } else if (error.message.includes('protocol')) {
          errorMessage = 'Connection protocol error. This could be due to SSL/TLS issues or network configuration problems.\n\nPlease check:\n1. That you\'re using the correct protocol (http/https)\n2. That your network allows the connection\n3. That there are no proxy or firewall issues\n\nTechnical details: ' + error.message;
        } else {
          errorMessage = 'Network error: ' + error.message;
        }
      } else if (error.name === 'AbortError') {
        errorMessage = 'Connection timeout - the server is not responding. Please check if the backend server is running.';
      } else {
        errorMessage = `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;
      }
      
      console.error('Displaying error to user:', errorMessage);
      alert(errorMessage);
      
      // Refresh payment history to show the failed transaction
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetchUserPaymentHistory(userId);
      }
    }
  };

  const displayedWallpapers = activeTab === 'favorites' 
    ? wallpapers.filter(w => w.favorite) 
    : selectedCategory === 'all' 
      ? wallpapers 
      : wallpapers.filter(w => w.category === selectedCategory);

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
                onClose={() => {
                  setShowPaymentHistory(false);
                  setActiveTab('gallery');
                }} 
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
          <aside className={
            `${mobileTab === 'create' ? 'flex' : 'hidden'} md:flex
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
          <main className={
            `${mobileTab === 'explore' ? 'flex' : 'hidden'} md:flex
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
                    {activeTab === 'gallery' ? 'Explore' : activeTab === 'favorites' ? 'Favorites' : showPaymentHistory ? 'Payment History' : 'Explore'}
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

              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-white/10 backdrop-blur-sm relative">
                  {/* Sliding Tab Background - only for gallery and favorites, not payments */}
                  <motion.div 
                    className="absolute top-1 bottom-1 rounded-lg bg-zinc-700 shadow-sm z-0"
                    layoutId="tab-background"
                    initial={false}
                    animate={{
                      left: activeTab === 'gallery' ? 4 : 'calc(33% + 2px)',
                      width: 'calc(33% - 6px)',
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
                    onClick={() => {
                      setShowPaymentHistory(true);
                      setActiveTab('paymentHistory');
                    }}
                    className={`relative z-10 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showPaymentHistory ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span className="text-sm font-medium hidden md:inline">Payments</span>
                  </button>
                </div>
                
                {/* Category Filter - Only show when on gallery tab */}
                {activeTab === 'gallery' && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                      className={`flex items-center justify-center p-2 rounded-lg transition-all ${showCategoryFilter ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'} backdrop-blur-sm`}
                      title="Filter by category"
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                    
                    {/* Category Filter Dropdown */}
                    <AnimatePresence>
                      {showCategoryFilter && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-12 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="py-2">
                              {[
                                { value: 'all', label: 'All Categories' },
                                { value: 'latest', label: 'Latest' },
                                { value: 'trending', label: 'Trending' },
                                { value: 'mountains', label: 'Mountains' },
                                { value: 'beaches', label: 'Beaches' },
                                { value: 'forest', label: 'Forest' },
                                { value: 'city', label: 'City' },
                                { value: 'space', label: 'Space' },
                                { value: 'animals', label: 'Animals' },
                                { value: 'abstract', label: 'Abstract' },
                                { value: 'fantasy', label: 'Fantasy' }
                              ].map((category) => (
                                <button
                                  key={category.value}
                                  onClick={() => {
                                    setSelectedCategory(category.value);
                                    setShowCategoryFilter(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedCategory === category.value ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'}`}
                                >
                                  {category.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                          
                          {/* Click outside to close */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowCategoryFilter(false)}
                          />
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                
                <button 
                  onClick={() => setShowProfile(true)}
                  className="flex items-center justify-center p-2 rounded-lg bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setShowOrganizer(true)}
                  className="flex items-center justify-center p-2 rounded-lg bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Tag className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setShowAnalytics(true)}
                  className="flex items-center justify-center p-2 rounded-lg bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setShowPremiumFeatures(true)}
                  className="flex items-center justify-center p-2 rounded-lg bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Crown className="w-5 h-5" />
                </button>
                
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
                wallpapers={showOrganizer ? filteredWallpapers : displayedWallpapers} 
                onSelect={setSelectedWallpaper} 
                onToggleFavorite={toggleFavorite}
                isGenerating={isGenerating}
              />
            </div>
          </main>

          {/* MOBILE NAVIGATION BAR */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-between px-4 pb-4 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setMobileTab('explore')}
              className="flex flex-col items-center justify-center w-1/4 h-full space-y-1.5 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'explore' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500'}`}>
                <Compass className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium ${mobileTab === 'explore' ? 'text-purple-400' : 'text-zinc-500'}`}>Explore</span>
            </button>
            
            <button 
              onClick={() => setMobileTab('create')}
              className="flex flex-col items-center justify-center w-1/4 h-full space-y-1.5 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'create' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500'}`}>
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium ${mobileTab === 'create' ? 'text-purple-400' : 'text-zinc-500'}`}>Create</span>
            </button>
            
            <button 
              onClick={() => {
                setShowPaymentHistory(true);
                setActiveTab('paymentHistory');
              }}
              className="flex flex-col items-center justify-center w-1/4 h-full space-y-1.5 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${showPaymentHistory ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span className={`text-[10px] font-medium ${showPaymentHistory ? 'text-purple-400' : 'text-zinc-500'}`}>Payments</span>
            </button>
            
            <button 
              onClick={() => setShowMobileDrawer(true)}
              className="flex flex-col items-center justify-center w-1/4 h-full space-y-1.5 active:scale-95 transition-transform"
            >
              <div className="p-1.5 rounded-xl transition-colors text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span className="text-[10px] font-medium text-zinc-500">Menu</span>
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
                onDelete={deleteWallpaper}
                onEdit={handleEditWallpaper}
                onShare={handleShareWallpaper}
              />
            )}
          </AnimatePresence>
          
          {/* Image Editor Modal */}
          <AnimatePresence>
            {showEditor && editingWallpaper && (
              <ImageEditor
                wallpaper={editingWallpaper}
                onClose={handleCancelEdit}
                onSave={handleSaveEditedWallpaper}
              />
            )}
          </AnimatePresence>
          
          {/* User Profile Modal */}
          <AnimatePresence>
            {showProfile && (
              <UserProfile
                userId={localStorage.getItem('userId') || 'demo-user-id'}
                username={username || 'Guest'}
                email={localStorage.getItem('username') || 'guest@example.com'}
                wallpaperCount={wallpapers.length}
                favoriteCount={wallpapers.filter(wp => wp.favorite).length}
                onEditProfile={() => {}}
                onUploadAvatar={() => {}}
                onClose={() => setShowProfile(false)}
              />
            )}
          </AnimatePresence>
          
          {/* Wallpaper Organizer Modal */}
          <AnimatePresence>
            {showOrganizer && (
              <WallpaperOrganizer
                wallpapers={wallpapers}
                onTagWallpaper={handleTagWallpaper}
                onSearch={handleSearch}
                onFilterByTags={handleFilterByTags}
                onClose={() => {
                  setShowOrganizer(false);
                  // Reset to show all wallpapers when closing organizer
                  setFilteredWallpapers(wallpapers);
                  setSearchQuery('');
                  setSelectedTags([]);
                }}
              />
            )}
          </AnimatePresence>
          
          {/* Wallpaper Share Modal */}
          <AnimatePresence>
            {showShare && sharingWallpaper && (
              <WallpaperShare
                wallpaper={sharingWallpaper}
                onLike={handleLikeWallpaper}
                onShare={() => {}}
                onClose={() => setShowShare(false)}
              />
            )}
          </AnimatePresence>
          
          {/* Analytics Dashboard Modal */}
          <AnimatePresence>
            {showAnalytics && (
              <AnalyticsDashboard
                wallpapers={wallpapers}
                onClose={() => setShowAnalytics(false)}
              />
            )}
          </AnimatePresence>
          
          {/* Premium Features Modal */}
          <AnimatePresence>
            {showPremiumFeatures && (
              <PremiumFeatures
                isPremium={isPremium}
                onUpgrade={() => setShowPremiumModal(true)}
                onClose={() => setShowPremiumFeatures(false)}
              />
            )}
          </AnimatePresence>
          
          {/* Mobile Drawer Menu */}
          <MobileDrawerMenu
            isOpen={showMobileDrawer}
            onClose={() => setShowMobileDrawer(false)}
            onNavigate={(tab) => {
              switch(tab) {
                case 'explore':
                  setMobileTab('explore');
                  break;
                case 'favorites':
                  setMobileTab('gallery');
                  setActiveTab('favorites');
                  break;
                case 'payment-history':
                  setShowPaymentHistory(true);
                  setActiveTab('paymentHistory');
                  break;
                case 'filter':
                  setShowCategoryFilter(!showCategoryFilter);
                  break;
                case 'profile':
                  setShowProfile(true);
                  break;
                case 'organizer':
                  setShowOrganizer(true);
                  break;
                case 'analytics':
                  setShowAnalytics(true);
                  break;
                case 'premium':
                  setShowPremiumFeatures(true);
                  break;
                default:
                  setMobileTab('explore');
              }
            }}
            onLogout={handleLogout}
            currentUserPlan={currentUserPlan}
          />
        </div>
      )}
    </>
  );
};

export default App;
