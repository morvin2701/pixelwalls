import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crown, Check, Star, Zap, Award } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (planId: string) => void;
  currentUserPlan: 'base' | 'basic' | 'pro'; // Add current user plan prop
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onPurchase, currentUserPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'base'>(currentUserPlan);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'base' as const,
      name: 'Base Version',
      price: 'Free',
      description: 'Limited features for basic use',
      features: [
        { text: 'Access to limited wallpaper library', available: true },
        { text: 'Standard resolution downloads (1080p)', available: true },
        { text: 'Watermarked images', available: true },
        { text: '5 wallpapers per day', available: true },
        { text: 'No wallpaper generation capability', available: false },
        { text: 'High-resolution downloads (4K)', available: false },
        { text: 'Unlimited generations', available: false },
        { text: 'Priority processing', available: false }
      ],
      free: true,
      icon: <Star className="w-5 h-5" />
    },
    {
      id: 'basic' as const,
      name: 'Basic Premium',
      price: '₹300',
      description: 'Perfect for casual users - monthly subscription',
      features: [
        { text: 'Access to premium wallpaper library', available: true },
        { text: 'High-resolution downloads (4K)', available: true },
        { text: 'No watermarks', available: true },
        { text: '10 generations per day', available: true },
        { text: 'Access to exclusive styles', available: true },
        { text: 'Unlimited generations', available: false },
        { text: 'Priority processing', available: false },
        { text: 'Commercial license', available: false }
      ],
      icon: <Award className="w-5 h-5" />
    },
    {
      id: 'pro' as const,
      name: 'Pro Premium',
      price: '₹1000',
      description: 'For professional creators - monthly subscription',
      features: [
        { text: 'Full wallpaper generation capability', available: true },
        { text: 'Unlimited 4K wallpaper generation', available: true },
        { text: 'No watermarks', available: true },
        { text: 'Unlimited generations per day', available: true },
        { text: 'Priority processing queue', available: true },
        { text: 'Commercial license for content', available: true },
        { text: 'Early access to new features', available: true },
        { text: 'Custom style presets', available: true }
      ],
      popular: true,
      icon: <Zap className="w-5 h-5" />
    }
  ];

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Crown className="text-amber-400" />
              Premium Plans
            </h2>
            <p className="text-zinc-400 mt-1">Choose the perfect plan for your creative needs</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => !plan.free && setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 shadow-lg shadow-purple-500/10'
                    : plan.free 
                      ? 'border-zinc-700 bg-zinc-800/30 opacity-90 hover:opacity-100' 
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                } ${plan.popular ? 'ring-2 ring-amber-500/30' : ''} ${plan.free ? 'cursor-default' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    MOST POPULAR
                  </div>
                )}
                
                {/* Current Plan Badge */}
                {plan.id === currentUserPlan && (
                  <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                    CURRENT PLAN
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${plan.free ? 'bg-zinc-700' : 'bg-purple-500/20'}`}>
                        {plan.icon}
                      </div>
                      <h3 className={`text-xl font-bold ${plan.free ? 'text-zinc-400' : 'text-white'}`}>{plan.name}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${plan.free ? 'text-zinc-500' : 'text-white'}`}>{plan.price}</div>
                    {!plan.free && <div className="text-zinc-400 text-sm">per month</div>}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.available ? (
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-zinc-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.available ? 'text-zinc-300' : plan.free ? 'text-zinc-600' : 'text-zinc-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {plan.id === currentUserPlan ? (
                  <div className="w-full py-3 rounded-lg font-medium text-center bg-green-500/20 text-green-400">
                    Current Plan
                  </div>
                ) : plan.free ? (
                  <button
                    onClick={() => onPurchase(plan.id)}
                    className="w-full py-3 rounded-lg font-medium bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
                  >
                    Switch to Free
                  </button>
                ) : (
                  <button
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      selectedPlan === plan.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {selectedPlan !== currentUserPlan && selectedPlan !== 'base' ? (
              <>
                <button
                  onClick={() => onPurchase(selectedPlan)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Continue to Payment
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-300 font-medium py-4 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : selectedPlan !== currentUserPlan && selectedPlan === 'base' ? (
              <>
                <button
                  onClick={() => {
                    onPurchase(selectedPlan);
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-700 hover:to-zinc-800 text-white font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Switch to Free Plan
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-300 font-medium py-4 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-300 font-medium py-4 px-6 rounded-xl transition-colors"
              >
                Close
              </button>
            )}
          </div>
          
          <p className="text-center text-zinc-500 text-xs mt-6">
            Secure payment powered by Razorpay. By purchasing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};