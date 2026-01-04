import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallpaper } from '../types';
import { communityService } from '../services/communityService';
import { Heart, Globe, User as UserIcon } from 'lucide-react';

interface CommunityFeedProps {
    onSelectCallback: (wallpaper: Wallpaper) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onSelectCallback }) => {
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWallpapers();
    }, []);

    const loadWallpapers = async () => {
        setLoading(true);
        const data = await communityService.getPublicWallpapers();
        setWallpapers(data);
        setLoading(false);
    };

    const handleLike = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        // Optimistic update
        setWallpapers(prev => prev.map(wp => {
            if (wp.id === id) {
                const isLiked = !wp.isLiked;
                return {
                    ...wp,
                    isLiked,
                    likesCount: (wp.likesCount || 0) + (isLiked ? 1 : -1)
                };
            }
            return wp;
        }));

        try {
            await communityService.toggleLike(id);
        } catch (err) {
            console.error("Failed to toggle like", err);
            // Revert on error could be implemented here
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (wallpapers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <Globe className="w-12 h-12 mb-4 opacity-20" />
                <p>No public wallpapers yet.</p>
                <p className="text-sm">Be the first to share one!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {wallpapers.map((wallpaper, index) => (
                <motion.div
                    key={wallpaper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-[9/16] group cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-white/5"
                    onClick={() => onSelectCallback(wallpaper)}
                >
                    <img
                        src={wallpaper.url}
                        alt={wallpaper.prompt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-white text-sm font-medium line-clamp-2 mb-2">{wallpaper.prompt}</p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-zinc-300">
                                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <UserIcon className="w-3 h-3" />
                                </div>
                                <span className="truncate max-w-[80px]">Anonymous</span>
                            </div>

                            <button
                                onClick={(e) => handleLike(e, wallpaper.id)}
                                className="flex items-center space-x-1 hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                            >
                                <Heart className={`w-4 h-4 ${wallpaper.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                <span className="text-xs text-white font-bold">{wallpaper.likesCount}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
