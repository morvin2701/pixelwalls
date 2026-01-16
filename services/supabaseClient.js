import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
// For Vercel, we need to use import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase environment variables (Vercel format):', { 
  hasSupabaseUrl: !!supabaseUrl, 
  hasSupabaseAnonKey: !!supabaseAnonKey 
});

// Create a dummy Supabase client if credentials are missing
let supabase;

try {
  // Validate that we have the required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Creating dummy client.');
    // Create a dummy client that mimics Supabase API but doesn't make actual requests
    supabase = {
      from: (table) => ({
        select: (columns = '*') => ({
          eq: (column, value) => Promise.resolve({ data: [], error: null }),
          order: (column, options) => Promise.resolve({ data: [], error: null })
        }),
        insert: (data) => Promise.resolve({ error: null }),
        update: (data) => ({
          eq: (column, value) => Promise.resolve({ error: null })
        }),
        delete: () => ({
          eq: (column, value) => Promise.resolve({ error: null })
        })
      }),
      storage: {
        from: (bucket) => ({
          upload: (path, file, options) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: (path) => ({ data: { publicUrl: '' } })
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
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => Promise.resolve({ data: [], error: null }),
        order: (column, options) => Promise.resolve({ data: [], error: null })
      }),
      insert: (data) => Promise.resolve({ error: null }),
      update: (data) => ({
        eq: (column, value) => Promise.resolve({ error: null })
      }),
      delete: () => ({
        eq: (column, value) => Promise.resolve({ error: null })
      })
    }),
    storage: {
      from: (bucket) => ({
        upload: (path, file, options) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: (path) => ({ data: { publicUrl: '' } })
      })
    }
  };
}

console.log('Final Supabase client initialized');

// Export default for compatibility
export default supabase
export { supabase }