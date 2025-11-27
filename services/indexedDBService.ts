// IndexedDB service for storing user wallpapers
const DB_NAME = 'PixelWallsDB';
const DB_VERSION = 1;
const WALLPAPERS_STORE = 'wallpapers';

// Open database connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      console.log('Upgrading IndexedDB schema');
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create wallpapers object store if it doesn't exist
      if (!db.objectStoreNames.contains(WALLPAPERS_STORE)) {
        const store = db.createObjectStore(WALLPAPERS_STORE, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('Wallpapers store created');
      }
    };
  });
};

// Save wallpapers for a user
const saveUserWallpapers = async (userId: string, wallpapers: any[]): Promise<void> => {
  try {
    console.log(`Saving ${wallpapers.length} wallpapers for user ${userId} to IndexedDB`);
    
    const db = await openDB();
    const transaction = db.transaction([WALLPAPERS_STORE], 'readwrite');
    const store = transaction.objectStore(WALLPAPERS_STORE);
    
    // Clear existing wallpapers for this user
    const userIndex = store.index('userId');
    const userWallpapers = await new Promise<any[]>((resolve, reject) => {
      const request = userIndex.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Delete existing wallpapers for this user
    for (const wallpaper of userWallpapers) {
      store.delete(wallpaper.id);
    }
    
    // Add new wallpapers
    for (const wallpaper of wallpapers) {
      const wallpaperData = {
        ...wallpaper,
        userId: userId,
        savedAt: new Date().toISOString()
      };
      store.add(wallpaperData);
    }
    
    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Wallpapers saved successfully to IndexedDB');
        resolve();
      };
      transaction.onerror = () => {
        console.error('Failed to save wallpapers to IndexedDB:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error saving wallpapers to IndexedDB:', error);
    throw error;
  }
};

// Load wallpapers for a user
const loadUserWallpapers = async (userId: string): Promise<any[]> => {
  try {
    console.log(`Loading wallpapers for user ${userId} from IndexedDB`);
    
    const db = await openDB();
    const transaction = db.transaction([WALLPAPERS_STORE], 'readonly');
    const store = transaction.objectStore(WALLPAPERS_STORE);
    const index = store.index('userId');
    
    const wallpapers = await new Promise<any[]>((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        console.log(`Loaded ${request.result.length} wallpapers from IndexedDB`);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('Failed to load wallpapers from IndexedDB:', request.error);
        reject(request.error);
      };
    });
    
    // Sort by creation date (newest first)
    return wallpapers.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error loading wallpapers from IndexedDB:', error);
    return [];
  }
};

// Delete all wallpapers for a user
const deleteUserWallpapers = async (userId: string): Promise<void> => {
  try {
    console.log(`Deleting all wallpapers for user ${userId} from IndexedDB`);
    
    const db = await openDB();
    const transaction = db.transaction([WALLPAPERS_STORE], 'readwrite');
    const store = transaction.objectStore(WALLPAPERS_STORE);
    const index = store.index('userId');
    
    // Get all wallpapers for this user
    const wallpapers = await new Promise<any[]>((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Delete each wallpaper
    for (const wallpaper of wallpapers) {
      store.delete(wallpaper.id);
    }
    
    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Wallpapers deleted successfully from IndexedDB');
        resolve();
      };
      transaction.onerror = () => {
        console.error('Failed to delete wallpapers from IndexedDB:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error deleting wallpapers from IndexedDB:', error);
    throw error;
  }
};

// Check if IndexedDB is supported
const isIndexedDBSupported = (): boolean => {
  return 'indexedDB' in window;
};

// Export all functions as a service object
export const indexedDBService = {
  saveUserWallpapers,
  loadUserWallpapers,
  deleteUserWallpapers,
  isIndexedDBSupported
};