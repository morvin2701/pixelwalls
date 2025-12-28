import React, { useState, useEffect } from 'react';
import { Search, Tag, Plus, Filter, X, Hash } from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperOrganizerProps {
  wallpapers: Wallpaper[];
  onTagWallpaper: (id: string, tags: string[]) => void;
  onSearch: (query: string) => void;
  onFilterByTags: (tags: string[]) => void;
  onClose: () => void;
}

const WallpaperOrganizer: React.FC<WallpaperOrganizerProps> = ({
  wallpapers,
  onTagWallpaper,
  onSearch,
  onFilterByTags,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [wallpaperTags, setWallpaperTags] = useState<Record<string, string[]>>({});

  // Get all unique tags from wallpapers
  const allTags = Array.from(
    new Set(wallpapers.flatMap(wp => wp.tags || []))
  ).filter(tag => typeof tag === 'string') as string[];

  useEffect(() => {
    // Initialize wallpaper tags
    const initialTags: Record<string, string[]> = {};
    wallpapers.forEach(wp => {
      initialTags[wp.id] = wp.tags || [];
    });
    setWallpaperTags(initialTags);
  }, [wallpapers]);

  const handleAddTag = () => {
    if (newTag.trim() && selectedWallpaper) {
      const updatedTags = [...(wallpaperTags[selectedWallpaper.id] || []), newTag.trim()];
      setWallpaperTags(prev => ({
        ...prev,
        [selectedWallpaper.id]: updatedTags
      }));
      onTagWallpaper(selectedWallpaper.id, updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (wallpaperId: string, tag: string) => {
    const updatedTags = (wallpaperTags[wallpaperId] || []).filter(t => t !== tag);
    setWallpaperTags(prev => ({
      ...prev,
      [wallpaperId]: updatedTags
    }));
    onTagWallpaper(wallpaperId, updatedTags);
  };

  const toggleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      const updatedTags = selectedTags.filter(t => t !== tag);
      setSelectedTags(updatedTags);
      onFilterByTags(updatedTags);
    } else {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      onFilterByTags(updatedTags);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    onSearch('');
    onFilterByTags([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Wallpaper Organizer</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search wallpapers..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Filter Button */}
          <button className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {/* Active Tags */}
        {selectedTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <div key={tag} className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300">
                <span>#{tag}</span>
                <button 
                  onClick={() => toggleTagFilter(tag)}
                  className="text-purple-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={clearFilters}
              className="px-3 py-1 rounded-full bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Tag List */}
        <div className="w-full md:w-64 bg-zinc-900/50 border-r border-white/10 p-4 overflow-y-auto">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Tags
          </h3>
          <div className="space-y-2">
            {allTags.map(tag => (
              <div 
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-600/30 border border-purple-500/30 text-purple-300'
                    : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <span>#{tag}</span>
                <span className="text-xs bg-zinc-700 px-2 py-1 rounded-full">
                  {wallpapers.filter(wp => wp.tags?.includes(tag)).length}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-white mb-3">Create Tag</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag..."
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button 
                onClick={handleAddTag}
                className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Wallpaper Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {wallpapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-lg">No wallpapers found</p>
              <p className="text-sm">Try changing your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {wallpapers.map(wallpaper => (
                <div 
                  key={wallpaper.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedWallpaper(wallpaper)}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                    <img 
                      src={wallpaper.url} 
                      alt={wallpaper.prompt} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Tags overlay */}
                  {wallpaperTags[wallpaper.id] && wallpaperTags[wallpaper.id].length > 0 && (
                    <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
                      {wallpaperTags[wallpaper.id].slice(0, 2).map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 rounded-full text-xs bg-black/70 text-white backdrop-blur-sm truncate max-w-[80px]"
                        >
                          #{tag}
                        </span>
                      ))}
                      {wallpaperTags[wallpaper.id].length > 2 && (
                        <span className="px-2 py-1 rounded-full text-xs bg-black/70 text-white backdrop-blur-sm">
                          +{wallpaperTags[wallpaper.id].length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center p-2">
                      <Tag className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">Add tags</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wallpaper Tag Editor Modal */}
      {selectedWallpaper && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white">Tag Wallpaper</h3>
              <button 
                onClick={() => setSelectedWallpaper(null)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <img 
                  src={selectedWallpaper.url} 
                  alt={selectedWallpaper.prompt} 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(wallpaperTags[selectedWallpaper.id] || []).map(tag => (
                    <div 
                      key={tag} 
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300"
                    >
                      <span>#{tag}</span>
                      <button 
                        onClick={() => handleRemoveTag(selectedWallpaper.id, tag)}
                        className="text-purple-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                  />
                  <button 
                    onClick={handleAddTag}
                    className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedWallpaper(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { WallpaperOrganizer };