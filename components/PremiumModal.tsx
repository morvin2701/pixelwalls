import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crown, Check } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (planId: string) => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('basic');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'basic' as const,
      name: 'Basic Premium',
      price: '₹299',
      description: 'Perfect for casual users',
      features: [
        'Unlock premium wallpapers',
        'Access to exclusive styles',
        'High-resolution downloads',
        'Remove watermarks'
      ]
    },
    {
      id: 'pro' as const,
      name: 'Pro Premium',
      price: '₹599',
      description: 'For professional creators',
      features: [
        'All Basic features',
        'Priority generation',
        'Commercial license',
        'Early access to new features',
        'Custom style presets',
        'Dedicated support'
      ],
      popular: true
    }
  ];

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="text-amber-400" />
            Go Premium
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                } ${plan.popular ? 'ring-2 ring-amber-500/30' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-zinc-400 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{plan.price}</div>
                    <div className="text-zinc-400 text-sm">one-time</div>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onPurchase(selectedPlan)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all"
            >
              Continue to Payment
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <p className="text-center text-zinc-500 text-xs mt-6">
            Secure payment powered by Razorpay. By purchasing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};