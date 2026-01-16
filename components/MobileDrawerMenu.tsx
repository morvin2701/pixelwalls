import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Heart, BarChart3, Filter, User, Tag, Crown, CreditCard, LogOut } from 'lucide-react';

interface MobileDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  currentUserPlan: 'base' | 'basic' | 'pro';
  onSync?: () => void; // Added sync function prop
}

const MobileDrawerMenu: React.FC<MobileDrawerMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onLogout,
  currentUserPlan,
  onSync  // Added sync function
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleMenuClick = (tab: string) => {
    if (tab === 'sync') {
      if (onSync) {
        onSync();
      }
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onNavigate(tab);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const menuItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'payment-history', label: 'Payment History', icon: CreditCard },
    { id: 'filter', label: 'Filter', icon: Filter },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organizer', label: 'Wallpaper Organizer', icon: Tag },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'premium', label: 'Premium Features', icon: Crown },
    { id: 'sync', label: 'Sync Wallpapers', icon: Compass }, // Added sync option
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 max-w-[80%] bg-zinc-900 border-r border-zinc-800 z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Menu items */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-white hover:bg-zinc-800 transition-colors"
                      >
                        <IconComponent className="w-5 h-5 text-zinc-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Logout button at the bottom */}
              <div className="p-4 border-t border-zinc-800">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawerMenu;