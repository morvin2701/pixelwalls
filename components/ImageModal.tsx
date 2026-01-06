
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Wallpaper, Collection } from '../types';
import { X, Download, Heart, Share2, Wand2, Trash2, Edit3, FolderPlus, Check, Globe, Lock } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { collectionsService } from '../services/collectionsService';
import { communityService } from '../services/communityService';
import { MobileWallpaperDetails } from './MobileWallpaperDetails';

interface ImageModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (wallpaper: Wallpaper) => void;
  onShare: (wallpaper: Wallpaper) => void;
  onRemix?: (wallpaper: Wallpaper) => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      mass: 0.8,
      delay: 0.05
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

export const ImageModal: React.FC<ImageModalProps> = ({ wallpaper, onClose, onToggleFavorite, onDelete, onEdit, onShare, onRemix }) => {
  const [downloadQuality, setDownloadQuality] = useState<'High' | 'Medium'>('High');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingToGallery, setIsSavingToGallery] = useState(false);

  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isAddingToCollection, setIsAddingToCollection] = useState<string | null>(null); // collectionId being added to

  // Visibility State
  const [isPublic, setIsPublic] = useState(wallpaper?.isPublic || false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const handleFetchCollections = async () => {
    setShowCollectionMenu(!showCollectionMenu);
    if (!showCollectionMenu && collections.length === 0) {
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
    // Optional: Show success toast
    alert(`Added to collection!`);
  };

  const handleTogglePublic = async () => {
    if (!wallpaper || isUpdatingVisibility) return;
    setIsUpdatingVisibility(true);
    const newState = !isPublic;
    // Optimistic update
    setIsPublic(newState);

    const success = await communityService.optimizeVisibility(wallpaper.id, newState);
    if (!success) {
      // Revert if failed
      setIsPublic(!newState);
      alert("Failed to update visibility");
    }
    setIsUpdatingVisibility(false);
  };

  if (!wallpaper) return null;

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Fetch blob first (handles both remote and data URLs to avoid CORS issues on canvas if possible)
      const response = await fetch(wallpaper.url);
      const blob = await response.blob();

      // Get the user's downloaded wallpapers count from localStorage
      const userId = localStorage.getItem('userId');
      const downloadCountKey = userId ? `pixelWallsDownloadCount_${userId}` : 'pixelWallsDownloadCount';
      let downloadCount = parseInt(localStorage.getItem(downloadCountKey) || '0', 10);
      downloadCount++;
      localStorage.setItem(downloadCountKey, downloadCount.toString());

      // Format the download count with leading zeros (001, 002, etc.)
      const formattedCount = downloadCount.toString().padStart(3, '0');
      const filename = `PixelWalls_${formattedCount}`;

      if (downloadQuality === 'High') {
        // Direct download (Original PNG)
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Compressed download (JPEG)
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
          // White background for JPEG transparency handling
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
          }, 'image/jpeg', 0.8); // 80% quality
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
      // Fetch the image as blob
      const response = await fetch(wallpaper!.url);
      const blob = await response.blob();

      // Get the user's saved images count from localStorage
      const userId = localStorage.getItem('userId');
      const saveCountKey = userId ? `pixelWallsSaveCount_${userId}` : 'pixelWallsSaveCount';
      let saveCount = parseInt(localStorage.getItem(saveCountKey) || '0', 10);
      saveCount++;
      localStorage.setItem(saveCountKey, saveCount.toString());

      // Format the save count with leading zeros (001, 002, etc.)
      const formattedCount = saveCount.toString().padStart(3, '0');
      const filename = `PixelWalls_${formattedCount}`;

      // Try to save using the File System Access API (for mobile and modern browsers)
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
        // Try using the Web Share API for mobile devices
        const file = new File([blob], `${filename}.png`, { type: blob.type });
        const shareData = {
          files: [file],
          title: 'PixelWalls Image',
          text: 'Check out this wallpaper from PixelWalls!'
        };

        await (window.navigator as any).share(shareData);
      } else {
        // Fallback: Create and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Show a message to the user that the image has been saved
        alert('Image saved to gallery!');
      }
    } catch (e) {
      console.error('Save to gallery failed', e);
      alert('Failed to save image to gallery. The image has been downloaded instead.');

      // Fallback to regular download
      handleDownload();
    } finally {
      setIsSavingToGallery(false);
    }
  };

  return (
    <>
      <div className="md:hidden">
        <MobileWallpaperDetails
          wallpaper={wallpaper}
          onClose={onClose}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
          onEdit={onEdit}
          onShare={onShare}
          onRemix={onRemix}
        />
      </div>
      <motion.div
        className="fixed inset-0 z-50 items-center justify-center p-4 md:p-8 overflow-y-auto hidden md:flex"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-lg"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          variants={modalVariants}
          className="relative w-full max-w-7xl h-[90vh] bg-zinc-900/95 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 ring-1 ring-white/5 z-10 max-h-[95vh]"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Close Button (Mobile) - Floating */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-black/50 text-white rounded-full md:hidden backdrop-blur-md border border-white/10"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Image Area */}
          <div className="flex-1 bg-zinc-950/50 flex items-center justify-center relative overflow-hidden group md:min-h-0 min-h-[40vh]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950/50 to-zinc-950 opacity-100"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blur-overlay"></div>

            <motion.img
              layoutId={`image-${wallpaper.id}`}
              src={wallpaper.url}
              alt={wallpaper.prompt}
              className="max-w-full max-h-full object-contain shadow-2xl z-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Sidebar / Info Area */}
          <div className="w-full md:w-[400px] bg-zinc-900/80 backdrop-blur-xl border-l border-white/5 flex flex-col h-auto md:h-full z-20 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-900/20">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg tracking-tight">Details</h3>
              </div>
              {/* Sidebar Close Button - Visible on all screens now */}
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Prompt Section */}
                <div className="relative group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                      <Wand2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Prompt
                    </label>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-white/10 text-zinc-300 text-sm leading-relaxed italic relative min-h-[80px] backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl"></div>
                    <div className="relative pl-3 break-words whitespace-pre-wrap">
                      "{wallpaper.prompt}"
                    </div>
                  </div>
                </div>

                {/* Resolution and Aspect Ratio */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Resolution</label>
                      <p className="text-lg font-semibold text-white mt-1 tracking-tight">{wallpaper.resolution}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Aspect Ratio</label>
                      <p className="text-lg font-semibold text-white mt-1 tracking-tight">{wallpaper.aspectRatio}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Visibility Section */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                      <Lock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Visibility
                    </label>
                  </div>
                  <div className="flex items-center justify-between bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      {isPublic ? (
                        <Globe className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-amber-400" />
                      )}
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${isPublic ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isPublic ? 'Public' : 'Private'}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {isPublic ? 'Visible to community' : 'Only you can see this'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleTogglePublic}
                      disabled={isUpdatingVisibility}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all backdrop-blur-sm border ${isPublic
                        ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
                        : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                    >
                      {isUpdatingVisibility ? '...' : (isPublic ? 'Make Private' : 'Make Public')}
                    </button>
                  </div>
                </div>

                {/* Model Section */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                      <Wand2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Model
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10">
                    <div className="relative w-3 h-3">
                      <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-75"></div>
                      <div className="relative w-3 h-3 bg-cyan-500 rounded-full border-2 border-zinc-900"></div>
                    </div>
                    <span className="text-sm font-semibold text-cyan-400">Gemini 3 Pro Image</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-zinc-900 relative z-30 flex-shrink-0">

              {/* Quality Selector */}
              <div className="mb-4">
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setDownloadQuality('High')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${downloadQuality === 'High' ? 'bg-zinc-800 text-white shadow-sm border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    High (PNG)
                  </button>
                  <button
                    onClick={() => setDownloadQuality('Medium')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${downloadQuality === 'Medium' ? 'bg-zinc-800 text-white shadow-sm border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Medium (JPG)
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-full flex items-center justify-center space-x-2 bg-white text-black px-4 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 mb-3 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isDownloading ? (
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>{isDownloading ? 'Downloading...' : `Download ${downloadQuality}`}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSaveToGallery}
                disabled={isSavingToGallery}
                className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/20 mb-3 ${isSavingToGallery ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isSavingToGallery ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>{isSavingToGallery ? 'Saving to Gallery...' : 'Save to Gallery'}</span>
              </motion.button>

              <div className="mb-3 relative z-50">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleFetchCollections}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all font-medium"
                >
                  <FolderPlus className="w-5 h-5" />
                  <span>Save to Collection...</span>
                </motion.button>

                <AnimatePresence>
                  {showCollectionMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto"
                    >
                      {collections.length === 0 ? (
                        <div className="p-3 text-xs text-zinc-500 text-center">No collections found</div>
                      ) : (
                        collections.map(col => (
                          <button
                            key={col.id}
                            onClick={() => handleAddToCollection(col.id)}
                            disabled={isAddingToCollection === col.id}
                            className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-between border-b border-white/5 last:border-0"
                          >
                            <span className="truncate">{col.name}</span>
                            {isAddingToCollection === col.id ? (
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onRemix && onRemix(wallpaper)}
                  className="flex items-center justify-center space-x-2 px-4 py-4 rounded-xl border border-white/10 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Remix</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onEdit(wallpaper)}
                  className="flex items-center justify-center space-x-2 px-4 py-4 rounded-xl border border-white/10 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Edit</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onToggleFavorite(wallpaper.id)}
                  className={`flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-medium border transition-all ${wallpaper.favorite
                    ? 'border-red-500/30 bg-red-500/10 text-red-400 shadow-lg shadow-red-900/20'
                    : 'border-white/10 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${wallpaper.favorite ? 'fill-current' : ''}`} />
                  <span>{wallpaper.favorite ? 'Saved' : 'Save'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onShare(wallpaper)}
                  className="flex items-center justify-center space-x-2 px-4 py-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this wallpaper? This action cannot be undone.')) {
                      onDelete(wallpaper.id);
                      onClose(); // Close modal after deletion
                    }
                  }}
                  className="col-span-2 flex items-center justify-center space-x-2 px-4 py-4 rounded-xl border border-red-600 bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
