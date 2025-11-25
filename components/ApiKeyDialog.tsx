/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { KeyRound, ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
      >
        
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <KeyRound className="w-8 h-8 text-purple-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">API Key Required</h2>
          
          <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
            To generate high-fidelity wallpapers with 
            <span className="text-zinc-200 font-semibold mx-1">Gemini 3 Pro Image</span>, 
            you need to select a Google Cloud project with billing enabled.
          </p>
          
          <div className="w-full bg-zinc-950/50 rounded-xl p-4 mb-8 border border-white/5 text-left">
             <div className="flex items-start space-x-3">
                <div className="text-xs text-zinc-400">
                    <p className="mb-2">This model uses a paid API tier.</p>
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 inline-flex items-center transition-colors"
                    >
                        View Billing Documentation <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </div>
             </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-white/5"
          >
            <span>Select API Key Project</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
