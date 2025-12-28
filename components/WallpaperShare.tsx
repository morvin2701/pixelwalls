import React, { useState } from 'react';
import { Share2, Heart, MessageCircle, Copy, Link, X } from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperShareProps {
  wallpaper: Wallpaper;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onClose: () => void;
}

const WallpaperShare: React.FC<WallpaperShareProps> = ({
  wallpaper,
  onLike,
  onShare,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href + `?wallpaper=${wallpaper.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this wallpaper!',
        text: wallpaper.prompt,
        url: window.location.href + `?wallpaper=${wallpaper.id}`
      });
    } else {
      setShowShareOptions(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6">
          {/* Wallpaper Preview */}
          <div className="relative mb-6">
            <img 
              src={wallpaper.url} 
              alt={wallpaper.prompt} 
              className="w-full h-96 object-contain rounded-xl"
            />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onLike(wallpaper.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span>Like</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Wallpaper Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Prompt</h3>
            <p className="text-zinc-300 mb-4">{wallpaper.prompt}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <div className="text-zinc-400">Resolution</div>
                <div className="text-white font-medium">{wallpaper.resolution}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <div className="text-zinc-400">Aspect Ratio</div>
                <div className="text-white font-medium">{wallpaper.aspectRatio}</div>
              </div>
            </div>
          </div>
          
          {/* Share Options */}
          {showShareOptions && (
            <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-white mb-3">Share this wallpaper</h4>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-800 text-white hover:bg-blue-900 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Comments Section */}
          <div>
            <h4 className="font-medium text-white mb-3">Comments</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                  U
                </div>
                <div>
                  <div className="font-medium text-white text-sm">User</div>
                  <p className="text-zinc-400 text-sm">This is an amazing wallpaper! Love the colors.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white">
                  A
                </div>
                <div>
                  <div className="font-medium text-white text-sm">AnotherUser</div>
                  <p className="text-zinc-400 text-sm">What was your prompt for this? I'd love to try it!</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { WallpaperShare };