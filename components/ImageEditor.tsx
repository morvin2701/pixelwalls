import React, { useState, useRef, useEffect } from 'react';
import { Download, RotateCw, Undo2, Redo2, Sun, Contrast, Palette, X } from 'lucide-react';
import { Wallpaper } from '../types';

interface ImageEditorProps {
  wallpaper: Wallpaper;
  onClose: () => void;
  onSave: (editedWallpaper: Wallpaper) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ wallpaper, onClose, onSave }) => {
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    flipX: 1,
    flipY: 1,
  });

  const [history, setHistory] = useState<any[]>([filters]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Update filters and save to history
  const updateFilter = (key: string, value: number | string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update history
    const newHistory = [...history.slice(0, historyIndex + 1), newFilters];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFilters(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFilters(history[historyIndex + 1]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      flipX: 1,
      flipY: 1,
    });
    
    const newHistory = [...history, {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      flipX: 1,
      flipY: 1,
    }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Apply filters to image and save
  const applyFilters = () => {
    // In a real implementation, this would apply the filters to the image
    // For now, we'll just update the wallpaper with the new filter values
    const editedWallpaper = {
      ...wallpaper,
      // Store filter settings as metadata
      editSettings: { ...filters }
    };
    onSave(editedWallpaper);
  };

  // Calculate CSS filter string
  const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;

  // Calculate transform for rotation and flip
  const transformString = `rotate(${filters.rotation}deg) scaleX(${filters.flipX}) scaleY(${filters.flipY})`;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Edit Wallpaper</h2>
        <div className="flex space-x-2">
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-50 hover:bg-zinc-700 transition-colors"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-50 hover:bg-zinc-700 transition-colors"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button 
            onClick={resetFilters}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button 
            onClick={applyFilters}
            className="p-2 px-4 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Image Preview */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-full overflow-hidden">
            <img
              ref={imgRef}
              src={wallpaper.url}
              alt="Wallpaper to edit"
              className="max-w-full max-h-full object-contain transition-all duration-300"
              style={{
                filter: filterString,
                transform: transformString,
              }}
            />
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-zinc-900 border-l border-white/10 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Brightness Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center">
                  <Sun className="w-4 h-4 mr-2" />
                  Brightness
                </label>
                <span className="text-sm text-zinc-400">{filters.brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.brightness}
                onChange={(e) => updateFilter('brightness', parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Contrast Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center">
                  <Contrast className="w-4 h-4 mr-2" />
                  Contrast
                </label>
                <span className="text-sm text-zinc-400">{filters.contrast}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.contrast}
                onChange={(e) => updateFilter('contrast', parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Saturation Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Saturation
                </label>
                <span className="text-sm text-zinc-400">{filters.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.saturation}
                onChange={(e) => updateFilter('saturation', parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Rotation Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-300">
                  Rotation
                </label>
                <span className="text-sm text-zinc-400">{filters.rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={filters.rotation}
                onChange={(e) => updateFilter('rotation', parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Flip Controls */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Flip
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => updateFilter('flipX', filters.flipX === 1 ? -1 : 1)}
                  className={`flex-1 py-2 rounded-lg border transition-colors ${
                    filters.flipX === -1 
                      ? 'bg-white text-black border-white' 
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  Flip X
                </button>
                <button
                  onClick={() => updateFilter('flipY', filters.flipY === 1 ? -1 : 1)}
                  className={`flex-1 py-2 rounded-lg border transition-colors ${
                    filters.flipY === -1 
                      ? 'bg-white text-black border-white' 
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  Flip Y
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ImageEditor };