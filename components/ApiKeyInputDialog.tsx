import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiKeyInputDialogProps {
  onConfirm: (apiKey: string) => void;
  onCancel: () => void;
}

export const ApiKeyInputDialog: React.FC<ApiKeyInputDialogProps> = ({ onConfirm, onCancel }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onConfirm(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)] mx-auto">
              <KeyRound className="w-8 h-8 text-purple-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Enter API Key</h2>
            <p className="text-zinc-400 text-sm">
              Please enter your Gemini API key to generate wallpapers
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  autoFocus
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!apiKey.trim()}
                className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};