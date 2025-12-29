import { supabase } from './supabaseClient';
import { Wallpaper } from '../types';

/**
 * Fetches user's wallpapers from Supabase database
 * @param userId - The ID of the user whose wallpapers to fetch
 * @returns Promise with array of wallpapers
 */
export const fetchUserWallpapersFromSupabase = async (userId: string): Promise<Wallpaper[]> => {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      console.error('Supabase is not properly configured');
      return [];
    }

    // Query the 'user_wallpapers' table for the user's wallpapers
    const { data, error } = await supabase
      .from('user_wallpapers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user wallpapers from Supabase:', error);
      return [];
    }

    if (!data) {
      console.log('No wallpapers found for user in Supabase');
      return [];
    }

    // Convert the data to Wallpaper objects
    const wallpapers: Wallpaper[] = data.map((item: any) => ({
      id: item.id,
      url: item.url,
      prompt: item.prompt,
      resolution: item.resolution || '4K',
      aspectRatio: item.aspect_ratio || '9:16',
      createdAt: new Date(item.created_at).getTime(),
      favorite: item.favorite || false,
      category: item.category || 'uncategorized',
      tags: item.tags || []
    }));

    console.log(`Fetched ${wallpapers.length} wallpapers from Supabase for user: ${userId}`);
    return wallpapers;
  } catch (error) {
    console.error('Unexpected error fetching user wallpapers from Supabase:', error);
    return [];
  }
};

/**
 * Saves a wallpaper to Supabase database for the user
 * @param userId - The ID of the user
 * @param wallpaper - The wallpaper to save
 * @returns Promise with success status
 */
export const saveUserWallpaperToSupabase = async (userId: string, wallpaper: Wallpaper): Promise<boolean> => {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      console.error('Supabase is not properly configured');
      return false;
    }

    // Insert the wallpaper into the 'user_wallpapers' table
    const { error } = await supabase
      .from('user_wallpapers')
      .insert([{
        user_id: userId,
        id: wallpaper.id,
        url: wallpaper.url,
        prompt: wallpaper.prompt,
        resolution: wallpaper.resolution,
        aspect_ratio: wallpaper.aspectRatio,
        created_at: new Date(wallpaper.createdAt).toISOString(),
        favorite: wallpaper.favorite,
        category: wallpaper.category,
        tags: wallpaper.tags || []
      }]);

    if (error) {
      console.error('Error saving wallpaper to Supabase:', error);
      return false;
    }

    console.log('Wallpaper saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error saving wallpaper to Supabase:', error);
    return false;
  }
};

/**
 * Updates a wallpaper in Supabase database
 * @param userId - The ID of the user
 * @param wallpaper - The updated wallpaper
 * @returns Promise with success status
 */
export const updateUserWallpaperInSupabase = async (userId: string, wallpaper: Wallpaper): Promise<boolean> => {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      console.error('Supabase is not properly configured');
      return false;
    }

    // Update the wallpaper in the 'user_wallpapers' table
    const { error } = await supabase
      .from('user_wallpapers')
      .update({
        url: wallpaper.url,
        prompt: wallpaper.prompt,
        resolution: wallpaper.resolution,
        aspect_ratio: wallpaper.aspectRatio,
        favorite: wallpaper.favorite,
        category: wallpaper.category,
        tags: wallpaper.tags || []
      })
      .eq('id', wallpaper.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating wallpaper in Supabase:', error);
      return false;
    }

    console.log('Wallpaper updated in Supabase successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error updating wallpaper in Supabase:', error);
    return false;
  }
};

/**
 * Deletes a wallpaper from Supabase database
 * @param userId - The ID of the user
 * @param wallpaperId - The ID of the wallpaper to delete
 * @returns Promise with success status
 */
export const deleteUserWallpaperFromSupabase = async (userId: string, wallpaperId: string): Promise<boolean> => {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      console.error('Supabase is not properly configured');
      return false;
    }

    // Delete the wallpaper from the 'user_wallpapers' table
    const { error } = await supabase
      .from('user_wallpapers')
      .delete()
      .eq('id', wallpaperId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting wallpaper from Supabase:', error);
      return false;
    }

    console.log('Wallpaper deleted from Supabase successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting wallpaper from Supabase:', error);
    return false;
  }
};

export default {
  fetchUserWallpapersFromSupabase,
  saveUserWallpaperToSupabase,
  updateUserWallpaperInSupabase,
  deleteUserWallpaperFromSupabase
};