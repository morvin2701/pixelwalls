import React, { useState } from 'react';
import { BarChart3, TrendingUp, Eye, Download, Heart, Calendar, Filter, X } from 'lucide-react';
import { Wallpaper } from '../types';

interface AnalyticsDashboardProps {
  wallpapers: Wallpaper[];
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ wallpapers, onClose }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Calculate statistics
  const totalWallpapers = wallpapers.length;
  const totalFavorites = wallpapers.filter(wp => wp.favorite).length;
  const totalDownloads = Math.floor(wallpapers.length * 1.5); // Simulated downloads
  const categories = Array.from(new Set(wallpapers.map(wp => wp.category || 'uncategorized')));
  
  // Calculate creation over time
  const creationOverTime = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      const count = wallpapers.filter(wp => {
        const wpDate = new Date(wp.createdAt);
        return wpDate.toDateString() === date.toDateString();
      }).length;
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }
    
    return data;
  };
  
  const weeklyData = creationOverTime();
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics Dashboard
        </h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-white/10 flex flex-wrap gap-3">
        <div className="flex items-center bg-zinc-800 rounded-xl p-1">
          {(['week', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalWallpapers}</div>
          <div className="text-sm text-zinc-400">Total Wallpapers</div>
        </div>
        
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalFavorites}</div>
          <div className="text-sm text-zinc-400">Favorites</div>
        </div>
        
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Download className="w-5 h-5 text-green-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalDownloads}</div>
          <div className="text-sm text-zinc-400">Downloads</div>
        </div>
        
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{categories.length}</div>
          <div className="text-sm text-zinc-400">Categories</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Creation Over Time Chart */}
        <div className="flex-1 bg-zinc-900/50 rounded-xl p-4 border border-white/10 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">Wallpapers Created</h3>
          
          <div className="flex items-end h-40 gap-2 mt-6">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all hover:from-blue-400 hover:to-blue-500"
                  style={{ height: `${Math.max(day.count * 10, 10)}%` }}
                ></div>
                <div className="text-xs text-zinc-400 mt-2">{day.date}</div>
                <div className="text-xs text-zinc-300">{day.count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Category Distribution */}
        <div className="w-full md:w-80 bg-zinc-900/50 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
          
          <div className="space-y-3">
            {categories.map((category, index) => {
              const count = wallpapers.filter(wp => wp.category === category).length;
              const percentage = totalWallpapers > 0 ? Math.round((count / totalWallpapers) * 100) : 0;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300 capitalize">{category || 'Uncategorized'}</span>
                    <span className="text-zinc-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {wallpapers.slice(0, 5).map((wallpaper, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={wallpaper.url} 
                  alt={wallpaper.prompt} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300 truncate">{wallpaper.prompt}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(wallpaper.createdAt).toLocaleDateString()} • {wallpaper.resolution}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {wallpaper.favorite && (
                  <div className="p-1 rounded-full bg-red-500/20">
                    <Heart className="w-4 h-4 text-red-400" />
                  </div>
                )}
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full">
                  {wallpaper.aspectRatio}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { AnalyticsDashboard };