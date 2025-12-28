import React, { useState } from 'react';
import { User, Upload, Camera, Edit3, Trophy, Heart, Download, Settings, X } from 'lucide-react';
import { Wallpaper } from '../types';

interface UserProfileProps {
  userId: string;
  username: string;
  email: string;
  wallpaperCount: number;
  favoriteCount: number;
  onEditProfile: () => void;
  onUploadAvatar: (file: File) => void;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  username,
  email,
  wallpaperCount,
  favoriteCount,
  onEditProfile,
  onUploadAvatar,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [newEmail, setNewEmail] = useState(email);

  const handleSave = () => {
    // In a real implementation, this would save the changes
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </div>
              <label className="absolute bottom-0 right-0 bg-white text-black rounded-full p-2 cursor-pointer hover:bg-zinc-200 transition-colors">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white">{username}</h3>
              <p className="text-zinc-400">{email}</p>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <span className="text-sm text-zinc-500">ID: {userId}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{wallpaperCount}</div>
              <div className="text-sm text-zinc-400">Wallpapers</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{favoriteCount}</div>
              <div className="text-sm text-zinc-400">Favorites</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-zinc-400">Premium</div>
            </div>
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <div className="mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Username</span>
                  <span className="text-white">{username}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Email</span>
                  <span className="text-white">{email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Member since</span>
                  <span className="text-white">Today</span>
                </div>
              </div>
            </div>
          )}

          {/* Premium Section */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 mb-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Premium Features</h3>
            </div>
            <ul className="text-sm text-zinc-300 space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Unlimited wallpaper generations</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Higher resolution downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Exclusive AI models</span>
              </li>
            </ul>
            <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserProfile };