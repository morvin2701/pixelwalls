// Wallpaper service for handling wallpaper synchronization with backend
import { getBackendUrl } from './apiUtils';
import { Wallpaper } from '../types';

interface SyncWallpapersResponse {
  success: boolean;
  wallpapers?: Wallpaper[];
  message?: string;
  error?: string;
}

export const wallpaperService = {
  // Save wallpapers to backend
  saveWallpapers: async (userId: string, wallpapers: Wallpaper[]): Promise<boolean> => {
    const backendUrl = getBackendUrl();
    
    try {
      console.log(`Saving ${wallpapers.length} wallpapers to backend for user ${userId}`);
      
      // Filter out base64 data URLs to reduce payload size
      const wallpapersWithoutBase64 = wallpapers.map(wallpaper => {
        // If it's a base64 URL, we'll send metadata only
        const isBase64 = wallpaper.url.startsWith('data:');
        return {
          ...wallpaper,
          url: isBase64 ? '' : wallpaper.url, // Send empty string for base64 images
          isBase64: isBase64
        };
      });
      
      const response = await fetch(`${backendUrl}/save-wallpapers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          wallpapers: wallpapersWithoutBase64
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save wallpapers to backend. Status:', response.status, 'Error:', errorText);
        return false;
      }
      
      const data = await response.json();
      console.log('Wallpapers saved to backend:', data);
      return data.success || true;
    } catch (error) {
      console.error('Network error during wallpaper save:', error);
      return false;
    }
  },
  
  // Load wallpapers from backend
  loadWallpapers: async (userId: string): Promise<Wallpaper[]> => {
    const backendUrl = getBackendUrl();
    
    try {
      console.log(`Loading wallpapers from backend for user ${userId}`);
      
      const response = await fetch(`${backendUrl}/load-wallpapers/${userId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load wallpapers from backend. Status:', response.status, 'Error:', errorText);
        return [];
      }
      
      const data = await response.json();
      console.log('Wallpapers loaded from backend:', data);
      
      if (data.success && Array.isArray(data.wallpapers)) {
        return data.wallpapers;
      }
      
      return [];
    } catch (error) {
      console.error('Network error during wallpaper load:', error);
      return [];
    }
  },
  
  // Delete all wallpapers for a user from backend
  deleteWallpapers: async (userId: string): Promise<boolean> => {
    const backendUrl = getBackendUrl();
    
    try {
      console.log(`Deleting wallpapers from backend for user ${userId}`);
      
      const response = await fetch(`${backendUrl}/delete-wallpapers/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete wallpapers from backend. Status:', response.status, 'Error:', errorText);
        return false;
      }
      
      const data = await response.json();
      console.log('Wallpapers deleted from backend:', data);
      return data.success || true;
    } catch (error) {
      console.error('Network error during wallpaper delete:', error);
      return false;
    }
  }
};