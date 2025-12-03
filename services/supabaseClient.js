import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
// For Vercel, we need to use import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase environment variables (Vercel format):', { supabaseUrl, supabaseAnonKey });

console.log('Supabase environment variables:', { supabaseUrl, supabaseAnonKey });

// Create a dummy Supabase client if credentials are missing
let supabase;

try {
  // Validate that we have the required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Creating dummy client.');
    // Create a dummy client that doesn't make actual requests
    supabase = {
      storage: {
        listBuckets: () => Promise.resolve({ data: [], error: null }),
        createBucket: () => Promise.resolve({ data: null, error: null }),
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    };
  } else {
    console.log('Creating Supabase client with URL:', supabaseUrl);
    // Create the Supabase client
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client created successfully');
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Fallback to dummy client
  supabase = {
    storage: {
      listBuckets: () => Promise.resolve({ data: [], error: null }),
      createBucket: () => Promise.resolve({ data: null, error: null }),
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
}

console.log('Final Supabase client:', supabase);

// Export default for compatibility
export default supabase
export { supabase }