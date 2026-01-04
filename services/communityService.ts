import { supabase } from './supabaseClient';
import { Wallpaper } from '../types';

export const communityService = {
    /**
     * Get all public wallpapers ordered by newest
     */
    async getPublicWallpapers(): Promise<Wallpaper[]> {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch wallpapers and check if user liked them
        // Note: This is a simplified approach. For scale, you'd use a dedicated RPC or join.
        const { data, error } = await supabase
            .from('user_wallpapers')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(50); // Pagination could be added later

        if (error) {
            console.error('Error fetching public wallpapers:', error);
            return [];
        }

        if (!data) return [];

        // If user is logged in, get their likes
        let userLikes = new Set<string>();
        if (user) {
            const { data: likes } = await supabase
                .from('likes')
                .select('wallpaper_id')
                .eq('user_id', user.id);

            if (likes) {
                likes.forEach(l => userLikes.add(l.wallpaper_id));
            }
        }

        return data.map((item: any) => ({
            id: item.id,
            url: item.url,
            prompt: item.prompt,
            resolution: item.resolution || '4K',
            aspectRatio: item.aspect_ratio || '9:16',
            createdAt: new Date(item.created_at).getTime(),
            favorite: item.favorite || false,
            category: item.category || 'uncategorized',
            tags: item.tags || [],
            isPublic: item.is_public,
            likesCount: item.likes_count || 0,
            userName: item.user_name,
            userAvatar: item.user_avatar,
            isLiked: userLikes.has(item.id)
        }));
    },

    /**
     * Make a wallpaper public or private
     */
    async optimizeVisibility(wallpaperId: string, isPublic: boolean): Promise<boolean> {
        const { error } = await supabase
            .from('user_wallpapers')
            .update({ is_public: isPublic })
            .eq('id', wallpaperId);

        if (error) {
            console.error('Error updating wallpaper visibility:', error);
            return false;
        }
        return true;
    },

    /**
     * Toggle like on a wallpaper
     */
    async toggleLike(wallpaperId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Must be logged in to like');

        // Check if already liked
        const { data: existingLike } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', user.id)
            .eq('wallpaper_id', wallpaperId)
            .single();

        if (existingLike) {
            // Unlike
            await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('wallpaper_id', wallpaperId);

            // Decrement count (optimistic update happens in UI, but we should update DB)
            // Note: In production, use an RPC or database trigger for atomic increments
            // simple decrement for now:
            await this.incrementLikeCount(wallpaperId, -1);
            return false; // Not liked anymore
        } else {
            // Like
            await supabase
                .from('likes')
                .insert({ user_id: user.id, wallpaper_id: wallpaperId });

            await this.incrementLikeCount(wallpaperId, 1);
            return true; // Liked
        }
    },

    async incrementLikeCount(wallpaperId: string, amount: number) {
        // Fetch current count to avoid using stale data in high concurrency, 
        // but for this app, a simple fetch update or RPC (better) is needed.
        // We will try a simple update based on current knowlege or just rpc if available.
        // Since we didn't write an RPC, we will read-modify-write (prone to races but okay for MVP)

        const { data } = await supabase.from('user_wallpapers').select('likes_count').eq('id', wallpaperId).single();
        if (data) {
            const newCount = (data.likes_count || 0) + amount;
            await supabase.from('user_wallpapers').update({ likes_count: newCount }).eq('id', wallpaperId);
        }
    }
};
