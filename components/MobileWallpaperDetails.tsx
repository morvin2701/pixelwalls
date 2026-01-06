import React, { useState, useRef, useEffect } from 'react';
import { Wallpaper, Collection } from '../types';
import { X, Download, Heart, Share2, Wand2, Trash2, Edit3, FolderPlus, Globe, Lock, ChevronDown, Sparkles, Image as ImageIcon, Smartphone, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { collectionsService } from '../services/collectionsService';
import { communityService } from '../services/communityService';

interface MobileWallpaperDetailsProps {
    wallpaper: Wallpaper;
    onClose: () => void;
    onToggleFavorite: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (wallpaper: Wallpaper) => void;
    onShare: (wallpaper: Wallpaper) => void;
    onRemix?: (wallpaper: Wallpaper) => void;
}

export const MobileWallpaperDetails: React.FC<MobileWallpaperDetailsProps> = ({
    wallpaper,
    onClose,
    onToggleFavorite,
    onDelete,
    onEdit,
    onShare,
    onRemix
}) => {
    const [downloadQuality, setDownloadQuality] = useState<'High' | 'Medium'>('High');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSavingToGallery, setIsSavingToGallery] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isAddingToCollection, setIsAddingToCollection] = useState<string | null>(null);

    // Visibility State
    const [isPublic, setIsPublic] = useState(wallpaper?.isPublic || false);
    const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
    const [showFullPrompt, setShowFullPrompt] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const slideUpVariants = {
        hidden: { y: '100%' },
        visible: {
            y: 0,
            transition: { type: 'spring', damping: 25, stiffness: 300 }
        },
        exit: {
            y: '100%',
            transition: { ease: 'easeInOut', duration: 0.3 }
        }
    };

    // Scroll animations for the image
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: containerRef });
    const imageScale = useTransform(scrollY, [0, 300], [1, 1.1]);
    const imageOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);
    const contentY = useTransform(scrollY, [0, 300], [0, -50]);

    const handleFetchCollections = async () => {
        setShowCollectionMenu(true);
        if (collections.length === 0) {
            const data = await collectionsService.getUserCollections();
            setCollections(data);
        }
    };

    const handleAddToCollection = async (collectionId: string) => {
        if (!wallpaper) return;
        setIsAddingToCollection(collectionId);
        await collectionsService.addToCollection(collectionId, wallpaper.id);
        setIsAddingToCollection(null);
        setShowCollectionMenu(false);
        alert(`Added to collection!`);
    };

    const handleTogglePublic = async () => {
        if (!wallpaper || isUpdatingVisibility) return;
        setIsUpdatingVisibility(true);
        const newState = !isPublic;
        setIsPublic(newState);

        const success = await communityService.optimizeVisibility(wallpaper.id, newState);
        if (!success) {
            setIsPublic(!newState);
            alert("Failed to update visibility");
        }
        setIsUpdatingVisibility(false);
    };

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);

        try {
            const response = await fetch(wallpaper.url);
            const blob = await response.blob();
            const userId = localStorage.getItem('userId');
            const downloadCountKey = userId ? `pixelWallsDownloadCount_${userId}` : 'pixelWallsDownloadCount';
            let downloadCount = parseInt(localStorage.getItem(downloadCountKey) || '0', 10);
            downloadCount++;
            localStorage.setItem(downloadCountKey, downloadCount.toString());

            const formattedCount = downloadCount.toString().padStart(3, '0');
            const filename = `PixelWalls_${formattedCount}`;

            if (downloadQuality === 'High') {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const img = new Image();
                const imgUrl = window.URL.createObjectURL(blob);
                img.src = imgUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((jpegBlob) => {
                        if (jpegBlob) {
                            const downloadUrl = window.URL.createObjectURL(jpegBlob);
                            const a = document.createElement('a');
                            a.href = downloadUrl;
                            a.download = `${filename}-medium.jpg`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(downloadUrl);
                            document.body.removeChild(a);
                        }
                    }, 'image/jpeg', 0.8);
                }
                window.URL.revokeObjectURL(imgUrl);
            }
        } catch (e) {
            console.error("Download failed", e);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSaveToGallery = async () => {
        if (isSavingToGallery) return;
        setIsSavingToGallery(true);

        try {
            const response = await fetch(wallpaper.url);
            const blob = await response.blob();
            const userId = localStorage.getItem('userId');
            const saveCountKey = userId ? `pixelWallsSaveCount_${userId}` : 'pixelWallsSaveCount';
            let saveCount = parseInt(localStorage.getItem(saveCountKey) || '0', 10);
            saveCount++;
            localStorage.setItem(saveCountKey, saveCount.toString());

            const formattedCount = saveCount.toString().padStart(3, '0');
            const filename = `PixelWalls_${formattedCount}`;

            if ('showSaveFilePicker' in window) {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `${filename}.png`,
                    types: [{
                        description: 'Image',
                        accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } else if ('navigator' in window && 'canShare' in navigator && (window.navigator as any).canShare({ files: [new File([], 'test')] })) {
                const file = new File([blob], `${filename}.png`, { type: blob.type });
                const shareData = {
                    files: [file],
                    title: 'PixelWalls Image',
                    text: 'Check out this wallpaper from PixelWalls!'
                };
                await (window.navigator as any).share(shareData);
            } else {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                alert('Image saved to gallery!');
            }
        } catch (e) {
            console.error('Save to gallery failed', e);
            alert('Failed to save. Downloaded instead.');
            handleDownload();
        } finally {
            setIsSavingToGallery(false);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black flex flex-col md:hidden"
        >
            {/* Top Bar - Fixed */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10"
                >
                    <X className="w-5 h-5" />
                </motion.button>

                <div className="flex gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onToggleFavorite(wallpaper.id)}
                        className={`p-3 backdrop-blur-md rounded-full border transition-all ${wallpaper.favorite
                                ? 'bg-red-500/80 border-red-500 text-white shadow-lg shadow-red-500/20'
                                : 'bg-black/40 border-white/10 text-white'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${wallpaper.favorite ? 'fill-current' : ''}`} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onShare(wallpaper)}
                        className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10"
                    >
                        <Share2 className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden relative"
                style={{ scrollBehavior: 'smooth' }}
            >
                {/* Full Height Image View */}
                <div className="h-[75vh] w-full relative flex items-center justify-center bg-zinc-950 overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 to-zinc-950 opacity-50"></div>

                    <motion.img
                        layoutId={`image-${wallpaper.id}`}
                        style={{ scale: imageScale, opacity: imageOpacity }}
                        src={wallpaper.url}
                        alt={wallpaper.prompt}
                        className="w-full h-full object-contain z-10 p-2"
                    />

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 1, duration: 2, repeat: Infinity }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
                    >
                        <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Details</span>
                        <ChevronDown className="w-4 h-4 text-white/50" />
                    </motion.div>
                </div>

                {/* Details Sheet Content */}
                <motion.div
                    style={{ y: contentY }}
                    className="relative z-20 bg-zinc-900 rounded-t-[2.5rem] -mt-8 min-h-[50vh] pb-32 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                >
                    {/* Handle Bar */}
                    <div className="w-full flex justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full" />
                    </div>

                    <div className="px-6 py-4 space-y-8">

                        {/* Title / Prompt Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Creation Prompt</h2>
                            </div>

                            <motion.div
                                onClick={() => setShowFullPrompt(!showFullPrompt)}
                                className={`p-5 rounded-3xl bg-zinc-800/50 border border-white/5 relative overflow-hidden group active:scale-[0.99] transition-transform duration-200 ${showFullPrompt ? '' : 'max-h-32'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className={`text-zinc-200 text-lg leading-relaxed font-light ${showFullPrompt ? '' : 'line-clamp-3'}`}>
                                    "{wallpaper.prompt}"
                                </p>
                                {!showFullPrompt && (
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent flex items-end justify-center pb-2">
                                        <span className="text-xs font-bold text-purple-400">Read more</span>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Resolution */}
                            <div className="bg-zinc-800/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 text-center group active:bg-zinc-800/50 transition-colors">
                                <Maximize2 className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Res</div>
                                    <div className="text-white font-medium">{wallpaper.resolution}</div>
                                </div>
                            </div>

                            {/* Ratio */}
                            <div className="bg-zinc-800/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 text-center group active:bg-zinc-800/50 transition-colors">
                                <Smartphone className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ratio</div>
                                    <div className="text-white font-medium">{wallpaper.aspectRatio}</div>
                                </div>
                            </div>

                            {/* Visibility */}
                            <button
                                onClick={handleTogglePublic}
                                disabled={isUpdatingVisibility}
                                className="bg-zinc-800/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 text-center group active:bg-zinc-800/50 transition-colors relative overflow-hidden"
                            >
                                {isUpdatingVisibility && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                                {isPublic ? <Globe className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 text-amber-500" />}
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Status</div>
                                    <div className={`text-white font-medium ${isPublic ? 'text-emerald-400' : 'text-amber-400'}`}>{isPublic ? 'Public' : 'Private'}</div>
                                </div>
                            </button>

                            {/* Model */}
                            <div className="bg-zinc-800/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 text-center">
                                <div className="w-5 h-5 relative">
                                    <div className="absolute inset-0 bg-cyan-500/50 rounded-full animate-pulse blur-[1px]" />
                                    <div className="relative w-full h-full bg-cyan-500 rounded-full border-2 border-zinc-900" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">AI Model</div>
                                    <div className="text-cyan-400 font-medium text-sm">Gemini 3</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Actions</h2>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onRemix && onRemix(wallpaper)}
                                    className="p-4 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center gap-3 active:scale-95 transition-transform"
                                >
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-900/20">
                                        <Wand2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white">Remix</span>
                                </button>

                                <button
                                    onClick={() => onEdit(wallpaper)}
                                    className="p-4 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center gap-3 active:scale-95 transition-transform"
                                >
                                    <div className="p-2 bg-zinc-700 rounded-lg">
                                        <Edit3 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white">Edit</span>
                                </button>

                                <button
                                    onClick={handleFetchCollections}
                                    className="col-span-2 p-4 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center gap-3 active:scale-95 transition-transform"
                                >
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <FolderPlus className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="text-sm font-medium text-white">Add to Collection</span>
                                </button>

                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this wallpaper?')) {
                                            onDelete(wallpaper.id);
                                            onClose();
                                        }
                                    }}
                                    className="col-span-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 active:scale-95 transition-transform"
                                >
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span className="text-sm font-medium text-red-400">Delete Wallpaper</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-50 bg-gradient-to-t from-black via-zinc-950 to-transparent pointer-events-none sticky">
                <div className="flex gap-3 pointer-events-auto">
                    <div className="flex-1">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="w-full bg-white text-black font-bold h-14 rounded-2xl shadow-lg shadow-white/5 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            {isDownloading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
                            <span>Download</span>
                        </button>
                    </div>
                    <div className="flex-1">
                        <button
                            onClick={handleSaveToGallery}
                            disabled={isSavingToGallery}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold h-14 rounded-2xl shadow-lg shadow-purple-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            {isSavingToGallery ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
                            <span>Save</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Collection Drawer */}
            <AnimatePresence>
                {showCollectionMenu && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCollectionMenu(false)}
                            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[2rem] z-[65] p-6 pb-12 border-t border-white/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Select Collection</h3>
                                <button onClick={() => setShowCollectionMenu(false)} className="p-2 bg-zinc-800 rounded-full">
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <div className="max-h-[50vh] overflow-y-auto space-y-2">
                                {collections.length === 0 ? (
                                    <div className="text-center text-zinc-500 py-8">No collections found.</div>
                                ) : (
                                    collections.map(col => (
                                        <button
                                            key={col.id}
                                            onClick={() => handleAddToCollection(col.id)}
                                            disabled={isAddingToCollection === col.id}
                                            className="w-full p-4 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center justify-between active:scale-98 transition-transform"
                                        >
                                            <span className="font-medium text-white">{col.name}</span>
                                            {isAddingToCollection === col.id ? (
                                                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FolderPlus className="w-4 h-4 text-zinc-500" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </motion.div>
    );
};
