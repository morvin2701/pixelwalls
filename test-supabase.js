import { supabase } from './services/supabaseClient.js';

console.log('Testing Supabase connection...');

// Test if Supabase is properly configured
if (supabase && typeof supabase.storage !== 'undefined') {
  console.log('Supabase client is properly configured');
  
  // Test listing buckets
  supabase.storage.listBuckets()
    .then(({ data, error }) => {
      if (error) {
        console.error('Error listing buckets:', error);
      } else {
        console.log('Available buckets:', data);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
    });
} else {
  console.log('Supabase client is not properly configured');
}