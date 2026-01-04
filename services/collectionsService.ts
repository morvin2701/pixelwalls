
import { createClient } from '@supabase/supabase-js';
import { Collection, CollectionItem } from '../types';

// Use strict typing for environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const collectionsService = {
    // Get all collections for the current user
    async getUserCollections(): Promise<Collection[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('collections')
            .select(`
        *,
        collection_items (count)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching collections:', error);
            return [];
        }

        return data.map((c: any) => ({
            ...c,
            item_count: c.collection_items?.[0]?.count || 0
        }));
    },

    // Create a new collection
    async createCollection(name: string, description?: string): Promise<Collection | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('collections')
            .insert({
                user_id: user.id,
                name,
                description,
                is_public: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating collection:', error);
            return null;
        }

        return data;
    },

    // Add a wallpaper to a collection
    async addToCollection(collectionId: string, wallpaperId: string): Promise<boolean> {
        const { error } = await supabase
            .from('collection_items')
            .insert({
                collection_id: collectionId,
                wallpaper_id: wallpaperId
            });

        if (error) {
            // Ignore unique violation (already in collection)
            if (error.code === '23505') return true;
            console.error('Error adding to collection:', error);
            return false;
        }

        return true;
    },

    // Remove a wallpaper from a collection
    async removeFromCollection(collectionId: string, wallpaperId: string): Promise<boolean> {
        const { error } = await supabase
            .from('collection_items')
            .delete()
            .match({ collection_id: collectionId, wallpaper_id: wallpaperId });

        if (error) {
            console.error('Error removing from collection:', error);
            return false;
        }

        return true;
    },

    // Delete a collection
    async deleteCollection(collectionId: string): Promise<boolean> {
        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionId);

        if (error) {
            console.error('Error deleting collection:', error);
            return false;
        }

        return true;
    },

    // Get items in a specific collection
    async getCollectionItems(collectionId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('collection_items')
            .select('wallpaper_id')
            .eq('collection_id', collectionId);

        if (error) {
            console.error('Error fetching collection items:', error);
            return [];
        }

        return data.map(item => item.wallpaper_id);
    }
};
