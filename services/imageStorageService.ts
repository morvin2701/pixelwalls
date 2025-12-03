import { supabase } from './supabaseClient';

// Flag to track if Supabase is properly configured
let isSupabaseConfigured = true;

// Check if Supabase is properly configured
try {
  if (!supabase || typeof supabase.storage === 'undefined') {
    isSupabaseConfigured = false;
    console.warn('Supabase is not properly configured. Image uploads will be disabled.');
  }
} catch (error) {
  isSupabaseConfigured = false;
  console.warn('Error checking Supabase configuration:', error);
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image to Supabase Storage
 * @param imageData - Base64 encoded image data
 * @param fileName - Name to save the file as
 * @param bucketName - Storage bucket name (defaults to 'generated_images')
 * @returns Promise with upload result containing URL or error
 */
export const uploadImageToSupabase = async (
  imageData: string,
  fileName: string,
  bucketName: string = 'generated_images'
): Promise<UploadResult> => {
  // If Supabase is not configured, return early with success but no URL
  if (!isSupabaseConfigured) {
    console.warn('Skipping Supabase upload - not configured');
    return {
      success: true, // Still return success so the app continues to work
      url: '' // Empty URL means use base64 data directly
    };
  }
  
  try {
    // Convert base64 to Blob
    const base64Data = imageData.split(',')[1] || imageData;
    const byteString = atob(base64Data);
    const mimeMatch = imageData.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-.+]+).*,.*/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      // Return success but with empty URL so base64 is used as fallback
      return {
        success: true,
        url: '',
        error: error.message
      };
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error: any) {
    console.error('Image upload error:', error);
    // Return success but with empty URL so base64 is used as fallback
    return {
      success: true,
      url: '',
      error: error.message || 'Failed to upload image'
    };
  }
};

/**
 * Gets the public URL for an image in Supabase Storage
 * @param fileName - Name of the file
 * @param bucketName - Storage bucket name (defaults to 'generated_images')
 * @returns Public URL of the image
 */
export const getImageUrl = (
  fileName: string,
  bucketName: string = 'generated_images'
): string => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};

export default {
  uploadImageToSupabase,
  getImageUrl
};