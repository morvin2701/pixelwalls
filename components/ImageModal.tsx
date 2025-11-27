
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Wallpaper } from '../types';
import { X, Download, Heart, Share2, Wand2 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ImageModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
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

export const ImageModal: React.FC<ImageModalProps> = ({ wallpaper, onClose, onToggleFavorite }) => {
  const [downloadQuality, setDownloadQuality] = useState<'High' | 'Medium'>('High');
  const [isDownloading, setIsDownloading] = useState(false);

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

  return (
    <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
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
        className="relative w-full max-w-7xl h-[85vh] md:h-[90vh] bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 ring-1 ring-white/5 z-10"
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
        <div className="flex-1 bg-zinc-950 flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 to-zinc-950 opacity-50"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
             
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
        <div className="w-full md:w-[400px] bg-zinc-900 border-l border-white/5 flex flex-col h-auto md:h-full z-20 shadow-xl">
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

           <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                 <div className="relative group">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3 flex items-center gap-2">
                        Prompt
                    </label>
                    <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 text-zinc-300 text-sm leading-relaxed italic relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                        "{wallpaper.prompt}"
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-800/30 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Resolution</label>
                        <p className="text-lg font-semibold text-white mt-1 tracking-tight">{wallpaper.resolution}</p>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-800/30 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Aspect Ratio</label>
                        <p className="text-lg font-semibold text-white mt-1 tracking-tight">{wallpaper.aspectRatio}</p>
                    </motion.div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                         <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Model</label>
                    </div>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-zinc-900 to-zinc-800 px-4 py-3 rounded-xl border border-white/5">
                        <div className="relative w-3 h-3">
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                        </div>
                        <span className="text-sm font-semibold text-zinc-300">Gemini 3 Pro Image</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 border-t border-white/5 bg-zinc-900 relative z-30">
              
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
              
              <div className="flex space-x-3">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onToggleFavorite(wallpaper.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-medium border transition-all ${
                        wallpaper.favorite 
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
                    className="px-4 py-4 rounded-xl border border-white/10 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
