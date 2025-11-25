/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ViewMode } from '../types';
import { LayoutGrid, PlusCircle, Heart, Image as ImageIcon, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewMode; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        currentView === view
          ? 'bg-white text-black shadow-lg shadow-gray-200/50'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-black' : 'text-gray-400 group-hover:text-gray-900'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-50/80 backdrop-blur-xl border-r border-gray-200 z-20 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Pixel
          </span>
        </div>

        <nav className="space-y-2">
          <NavItem view="create" icon={PlusCircle} label="Create New" />
          <NavItem view="gallery" icon={LayoutGrid} label="Gallery" />
          <NavItem view="favorites" icon={Heart} label="Favorites" />
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-gray-900 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </div>
      </div>
    </div>
  );
};