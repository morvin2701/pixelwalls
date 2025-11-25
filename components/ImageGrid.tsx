/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Wallpaper } from '../types';
import { Heart, Maximize2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Added Variants

interface ImageGridProps {
  wallpapers: Wallpaper[];
  onSelect: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (id: string) => void;
  isGenerating?: boolean;
}

const SkeletonCard = () => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.3 } }}
    transition={{ type: "spring", bounce: 0.4 }}
    className="break-inside-avoid mb-6 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 relative h-[400px] shadow-lg z-10"
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer" style={{ backgroundSize: '200% 100%' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="absolute inset-0 blur-md bg-purple-500/30 rounded-full"></div>
          <ImageIcon className="w-10 h-10 text-purple-500 relative z-10" />
        </motion.div>
        <div className="flex flex-col items-center">
            <span className="text-xs text-white/40 font-bold tracking-[0.2em] animate-pulse mb-1">DREAMING</span>
            <span className="text-[10px] text-white/20">Generating pixels...</span>
        </div>
    </div>
  </motion.div>
);

// Explicitly type itemVariants as Variants
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

export const ImageGrid: React.FC<ImageGridProps> = ({ wallpapers, onSelect, onToggleFavorite, isGenerating }) => {
  
  // Empty State
  if (wallpapers.length === 0 && !isGenerating) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 text-zinc-600"
      >
        <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 mb-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent"></div>
            <Maximize2 className="w-10 h-10 text-zinc-500" />
        </motion.div>
        <p className="text-xl font-bold text-zinc-400">Canvas Empty</p>
        <p className="text-zinc-600 mt-2 text-sm text-center max-w-xs">Your masterpiece begins with a single prompt. Use the controls to start.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-full columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-6 space-y-6 mx-auto pb-20">
      <AnimatePresence mode="popLayout">
        {isGenerating && (
           <SkeletonCard key="skeleton-loader" />
        )}

        {wallpapers.map((wp, index) => (
          <motion.div 
            layout
            key={wp.id}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            custom={index}
            className="group relative break-inside-avoid rounded-xl overflow-hidden bg-zinc-900 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer border border-white/5 z-0"
            onClick={() => onSelect(wp)}
            whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1, filter: 'blur(10px)' }}
                  animate={{ scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  src={wp.url}
                  alt={wp.prompt}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <p className="text-white text-sm font-medium line-clamp-2 mb-4 drop-shadow-md leading-relaxed text-balance">
                  "{wp.prompt}"
                  </p>
                  <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                          {wp.resolution}
                      </span>
                      
                      <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite(wp.id); }}
                          className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-colors ${wp.favorite ? 'bg-red-500 text-white border-red-500' : 'bg-black/40 text-white hover:bg-black/60'}`}
                      >
                          <Heart className={`w-4 h-4 ${wp.favorite ? 'fill-current' : ''}`} />
                      </motion.button>
                  </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};