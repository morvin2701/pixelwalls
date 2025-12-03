import { supabase } from './supabaseClient';

/**
 * Sets up the Supabase storage bucket for generated images
 * This function should be run once to configure the storage bucket
 */
export const setupSupabaseStorage = async (): Promise<void> => {
  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'generated_images');
    
    if (!bucketExists) {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('generated_images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return;
      }
      
      console.log('Successfully created generated_images bucket:', data);
    } else {
      console.log('generated_images bucket already exists');
    }
    
    // Set up policies for the bucket
    // Note: Policy creation requires admin privileges and cannot be done through the client SDK
    // Policies need to be set up in the Supabase dashboard
    
  } catch (error) {
    console.error('Error setting up Supabase storage:', error);
  }
};

/**
 * Creates a folder structure in the bucket (if needed)
 */
export const setupFolderStructure = async (): Promise<void> => {
  try {
    // In Supabase Storage, folders are virtual and created implicitly
    // We can simulate folder creation by uploading a placeholder file
    const { error } = await supabase.storage
      .from('generated_images')
      .upload('placeholders/.gitkeep', new Blob([''], { type: 'text/plain' }), {
        upsert: true
      });
    
    if (error && !error.message.includes('already exists')) {
      console.error('Error creating folder structure:', error);
    } else {
      console.log('Folder structure set up successfully');
    }
  } catch (error) {
    console.error('Error setting up folder structure:', error);
  }
};

// Run setup when this module is imported
setupSupabaseStorage()
  .then(() => setupFolderStructure())
  .catch(console.error);

export default {
  setupSupabaseStorage,
  setupFolderStructure
};