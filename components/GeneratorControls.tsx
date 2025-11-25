
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { GenerationParams, STYLE_PRESETS } from '../types';
import { Wand2, Sparkles, Monitor, Smartphone, Square, Zap, History, Trash2, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratorControlsProps {
  onGenerate: (params: GenerationParams) => void;
  isGenerating: boolean;
}

// Helper to retrieve draft settings safely
const getDraftSettings = () => {
  try {
    const saved = localStorage.getItem('pixelwalls_draft_settings');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.warn('Failed to parse draft settings', e);
    return {};
  }
};

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({ onGenerate, isGenerating }) => {
  // Initialize state with lazy loaders to restore draft from localStorage on mount
  const [prompt, setPrompt] = useState(() => getDraftSettings().prompt || '');
  
  const [resolution, setResolution] = useState<'2K' | '4K'>(() => {
    const val = getDraftSettings().resolution;
    return (val === '2K' || val === '4K') ? val : '4K';
  });
  
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>(() => {
    const val = getDraftSettings().aspectRatio;
    return (val === '16:9' || val === '9:16' || val === '1:1') ? val : '9:16';
  });
  
  const [selectedStyle, setSelectedStyle] = useState<string>(() => {
     return getDraftSettings().selectedStyle || 'photorealistic';
  });
  
  const [useEnhancer, setUseEnhancer] = useState(() => {
     const val = getDraftSettings().useEnhancer;
     return val !== undefined ? val : true;
  });
  
  // History State
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pixelwalls_prompt_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load prompt history', e);
    }
  }, []);

  // Auto-save draft settings whenever they change
  useEffect(() => {
    const draft = {
      prompt,
      resolution,
      aspectRatio,
      selectedStyle,
      useEnhancer
    };
    localStorage.setItem('pixelwalls_draft_settings', JSON.stringify(draft));
  }, [prompt, resolution, aspectRatio, selectedStyle, useEnhancer]);

  const addToHistory = (newPrompt: string) => {
    const trimmed = newPrompt.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const filtered = prev.filter((p) => p !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 20); // Keep last 20
      try {
        localStorage.setItem('pixelwalls_prompt_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pixelwalls_prompt_history');
    setShowHistory(false);
  };

  const selectHistoryItem = (item: string) => {
    setPrompt(item);
    setShowHistory(false);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    // Save to history when generating
    addToHistory(prompt.trim());

    onGenerate({
      prompt: prompt.trim(),
      resolution,
      aspectRatio,
      stylePreset: selectedStyle,
      enhancePrompt: useEnhancer
    });
  };

  const handleSurpriseMe = () => {
    const ideas = [
      "A transparent glass apple filled with a galaxy",
      "A cozy reading nook inside a hollow giant oak tree",
      "A futuristic train traveling through an underwater tunnel",
      "A samurai standing on a neon rooftop in rain",
      "A calm zen garden with floating rocks",
      "A majestic white owl with golden feathers"
    ];
    setPrompt(ideas[Math.floor(Math.random() * ideas.length)]);
    // Pick a random style, excluding 'none' for surprise factor
    const styles = STYLE_PRESETS.filter(s => s.id !== 'none');
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    setSelectedStyle(randomStyle.id);
  };

  return (
    <div className="flex flex-col h-full">
        
        {/* Scrollable Settings Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            
            {/* Prompt Input */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Prompt
                    </label>
                    
                    <div className="flex items-center space-x-2">
                        {/* History Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowHistory(!showHistory)}
                            className={`text-[10px] font-medium flex items-center transition-colors px-2 py-1 rounded-md cursor-pointer border ${
                                showHistory 
                                ? 'bg-white/10 text-white border-white/20' 
                                : 'bg-white/5 text-zinc-400 border-transparent hover:border-white/10 hover:text-white'
                            }`}
                            title="Prompt History"
                        >
                            <History className="w-3 h-3 mr-1" />
                            History
                        </motion.button>

                        {/* Enhancer Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setUseEnhancer(!useEnhancer)}
                            className={`text-[10px] font-medium flex items-center transition-colors px-2 py-1 rounded-md cursor-pointer border ${
                                useEnhancer 
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20' 
                                : 'bg-zinc-800/50 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                            }`}
                            title={useEnhancer ? "AI Prompt Enhancement Active" : "AI Prompt Enhancement Off"}
                        >
                            <Wand2 className={`w-3 h-3 mr-1.5 ${useEnhancer ? 'text-purple-400' : 'text-zinc-600'}`} />
                            {useEnhancer ? 'AI Enhance' : 'AI Enhance'}
                        </motion.button>

                        {/* Surprise Me */}
                        <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSurpriseMe}
                            className="text-[10px] font-medium text-zinc-400 hover:text-white flex items-center transition-colors bg-white/5 px-2 py-1 rounded-md cursor-pointer border border-transparent hover:border-white/10"
                        >
                            <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                            Surprise
                        </motion.button>
                    </div>
                </div>
                
                <div className="relative group">
                    <motion.div
                        className={`absolute -inset-0.5 bg-gradient-to-r rounded-xl opacity-0 group-focus-within:opacity-50 transition-opacity duration-500 blur-sm ${useEnhancer ? 'from-purple-600 to-indigo-600' : 'from-zinc-600 to-zinc-600'}`}
                        layoutId="prompt-glow"
                    />
                    <motion.textarea
                        layout
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={useEnhancer ? "Describe your basic idea, and I'll make it magical..." : "Enter your detailed prompt here..."}
                        className={`relative w-full h-36 p-4 rounded-xl bg-black/60 border focus:border-white/20 transition-all resize-none text-sm text-white placeholder-zinc-600 outline-none shadow-inner ${useEnhancer ? 'border-purple-500/20' : 'border-white/10'}`}
                        whileFocus={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.8)" }}
                    />
                    
                    {/* History Overlay */}
                    <AnimatePresence>
                        {showHistory && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute inset-0 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-white/10 z-30 flex flex-col overflow-hidden shadow-2xl"
                            >
                                <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5 shrink-0">
                                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Recent Prompts
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {history.length > 0 && (
                                            <button 
                                                onClick={clearHistory} 
                                                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" /> Clear
                                            </button>
                                        )}
                                        <button onClick={() => setShowHistory(false)} className="text-zinc-400 hover:text-white p-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    {history.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                                            <History className="w-6 h-6 opacity-20" />
                                            <span className="text-xs">No history yet</span>
                                        </div>
                                    ) : (
                                        history.map((h, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => selectHistoryItem(h)}
                                                className="w-full text-left p-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors truncate border border-transparent hover:border-white/5"
                                                title={h}
                                            >
                                                {h}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {useEnhancer && !showHistory && (
                        <div className="absolute bottom-3 right-3 text-[10px] text-purple-400/60 flex items-center gap-1 pointer-events-none">
                            <Sparkles className="w-3 h-3" />
                            <span>Enhancer Active</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Visual Style</label>
                <div className="grid grid-cols-2 gap-3">
                    {STYLE_PRESETS.map((style) => (
                        <motion.button
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative group h-24 rounded-xl overflow-hidden text-left transition-all duration-200 border ${
                                style.id === 'none' ? 'col-span-2' : ''
                            } ${
                                selectedStyle === style.id
                                    ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-900/20'
                                    : 'border-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                            <div className="relative z-10 h-full p-3 flex flex-col justify-end">
                                <span className={`text-xs font-bold leading-tight drop-shadow-md ${selectedStyle === style.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                                    {style.label}
                                </span>
                                <span className="text-[10px] text-white/60 block mt-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                                    {style.description}
                                </span>
                                {selectedStyle === style.id && (
                                    <motion.div 
                                        layoutId="active-dot"
                                        className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }} 
                                    />
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Tech Specs */}
            <div className="space-y-5 pt-6 border-t border-white/5">
                {/* Aspect Ratio */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3">Dimensions</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: '9:16', label: 'Phone', icon: Smartphone },
                            { id: '16:9', label: 'Desktop', icon: Monitor },
                            { id: '1:1', label: 'Square', icon: Square },
                        ].map((ar) => (
                            <motion.button
                                key={ar.id}
                                onClick={() => setAspectRatio(ar.id as any)}
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex flex-col items-center justify-center py-3 rounded-lg border transition-colors relative ${
                                    aspectRatio === ar.id
                                        ? 'border-purple-500/50 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                        : 'border-white/5 bg-white/5 text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <ar.icon className="w-4 h-4 mb-1.5" />
                                <span className="text-[10px] font-medium">{ar.label}</span>
                                {aspectRatio === ar.id && (
                                    <motion.div
                                        layoutId="ar-selection"
                                        className="absolute inset-0 border-2 border-purple-500 rounded-lg opacity-50"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Resolution */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3">Resolution</label>
                    <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 relative">
                        {['2K', '4K'].map((res) => (
                            <button
                                key={res}
                                onClick={() => setResolution(res as any)}
                                className={`relative flex-1 text-[10px] font-bold py-2 rounded-lg transition-colors z-10 ${
                                    resolution === res ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {resolution === res && (
                                    <motion.div 
                                        layoutId="resolution-tab"
                                        className="absolute inset-0 bg-zinc-700 rounded-lg shadow-md"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10">{res}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-[9px] text-zinc-500 mt-2 text-center">
                        Note: 4K images are generated at the highest available resolution (2K) per API limitations
                    </p>
                </div>
            </div>
        </div>

        {/* Footer / Generate Button */}
        <div className="p-6 bg-zinc-900/90 border-t border-white/5 backdrop-blur-md z-10 shrink-0">
            <motion.button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                whileHover={!isGenerating && prompt.trim() ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isGenerating && prompt.trim() ? { scale: 0.96 } : {}}
                className={`w-full relative group overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                    isGenerating || !prompt.trim()
                        ? 'bg-zinc-800 cursor-not-allowed opacity-50'
                        : 'shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40'
                }`}
            >
                <div className={`absolute inset-0 transition-opacity duration-300 ${isGenerating || !prompt.trim() ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient bg-[length:200%_auto]" />
                </div>

                <div className="relative flex items-center justify-center space-x-2 text-white font-bold tracking-wide text-sm">
                    {isGenerating ? (
                        <>
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" 
                            />
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                {useEnhancer ? 'Refining & Designing...' : 'Designing...'}
                            </motion.span>
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform" />
                            <span>Generate Wallpaper</span>
                        </>
                    )}
                </div>
            </motion.button>
            <div className="text-center mt-3">
                <p className="text-[10px] text-zinc-600 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Gemini 3 Pro Image {useEnhancer ? '+ Flash Enhancer' : 'Raw Mode'}
                </p>
            </div>
        </div>

        <style>{`
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .animate-gradient {
                animation: gradient 3s ease infinite;
            }
        `}</style>
    </div>
  );
};
