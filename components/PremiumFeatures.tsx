import React from 'react';
import { Crown, Sparkles, Download, Zap, Star, Shield, Image, Monitor, X } from 'lucide-react';

interface PremiumFeaturesProps {
  isPremium: boolean;
  onUpgrade: () => void;
  onClose: () => void;
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ isPremium, onUpgrade, onClose }) => {
  const features = [
    {
      icon: Download,
      title: 'Higher Resolution Downloads',
      description: 'Download wallpapers in 8K resolution for crystal clear quality',
      base: '4K',
      premium: '8K'
    },
    {
      icon: Sparkles,
      title: 'Exclusive AI Models',
      description: 'Access to advanced AI models for more creative wallpapers',
      base: 'Standard',
      premium: 'Advanced + Pro'
    },
    {
      icon: Zap,
      title: 'Faster Generation',
      description: 'Priority processing with faster generation times',
      base: 'Standard',
      premium: 'Priority'
    },
    {
      icon: Image,
      title: 'Unlimited Generations',
      description: 'Generate as many wallpapers as you want',
      base: 'Limited',
      premium: 'Unlimited'
    },
    {
      icon: Monitor,
      title: 'Multi-Device Sync',
      description: 'Access your wallpapers from all your devices',
      base: 'No',
      premium: 'Yes'
    },
    {
      icon: Shield,
      title: 'Ad-Free Experience',
      description: 'Enjoy PixelWalls without any ads',
      base: 'Ads',
      premium: 'Ad-Free'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              <span>{isPremium ? 'Premium Member' : 'Upgrade to Premium'}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              {isPremium ? 'Premium Features' : 'Unlock Premium Features'}
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              {isPremium 
                ? 'Enjoy all the premium benefits you unlocked!' 
                : 'Enhance your wallpaper creation experience with exclusive features'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-zinc-800/50 rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-400 mb-3">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Base:</span>
                      <span className={`font-medium ${feature.base === 'Limited' || feature.base === 'No' || feature.base === 'Ads' ? 'text-red-400' : 'text-zinc-300'}`}>
                        {feature.base}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-zinc-500">Premium:</span>
                      <span className={`font-medium ${feature.premium === 'Unlimited' || feature.premium === 'Yes' || feature.premium === 'Ad-Free' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {feature.premium}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {!isPremium && (
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/20 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Upgrade?</h2>
              <p className="text-zinc-300 mb-6 max-w-md mx-auto">
                Join thousands of users enjoying premium features for wallpaper creation
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={onUpgrade}
                  className="flex-1 max-w-xs flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  <Crown className="w-5 h-5" />
                  <span>Upgrade to Premium</span>
                </button>
                
                <button 
                  onClick={onClose}
                  className="flex-1 max-w-xs px-6 py-4 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                >
                  Continue with Base
                </button>
              </div>
            </div>
          )}
          
          {isPremium && (
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border border-green-500/20 text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full mb-4">
                <Star className="w-4 h-4" />
                <span>Thank you for supporting PixelWalls!</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Premium Active</h2>
              <p className="text-zinc-300">
                Enjoy all premium features with your subscription
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { PremiumFeatures };