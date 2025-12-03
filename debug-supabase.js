// Simple test script to debug Supabase integration
// This can be run in the browser console after importing

// To use this, open your browser's developer tools and run:
// import('./debug-supabase.js').then(module => module.testSupabase())

export async function testSupabase() {
  console.log('=== Supabase Debug Test ===');
  
  // Import the Supabase client
  const { supabase } = await import('./services/supabaseClient.js');
  
  console.log('Supabase client:', supabase);
  
  // Check if Supabase is properly configured
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    return;
  }
  
  if (!supabase.storage) {
    console.error('❌ Supabase storage is not available');
    return;
  }
  
  console.log('✅ Supabase client is initialized');
  
  // List buckets
  try {
    console.log('Listing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      console.log('✅ Available buckets:', buckets);
    }
  } catch (error) {
    console.error('❌ Exception while listing buckets:', error);
  }
  
  // Test upload with a small file
  try {
    console.log('Testing upload...');
    const testFileName = `debug-test-${Date.now()}.txt`;
    const testContent = 'This is a debug test file';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log('Uploading test file:', testFileName);
    const { data, error } = await supabase.storage
      .from('generated_images')
      .upload(testFileName, blob, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
    } else {
      console.log('✅ Upload successful:', data);
      
      // Try to get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('generated_images')
        .getPublicUrl(testFileName);
      
      console.log('✅ Public URL:', publicUrl);
    }
  } catch (error) {
    console.error('❌ Exception during upload test:', error);
  }
  
  console.log('=== End Supabase Debug Test ===');
}