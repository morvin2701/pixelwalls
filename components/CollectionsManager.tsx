import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Folder, LayoutGrid, ArrowLeft, FolderOpen, Image as ImageIcon } from 'lucide-react'; // Added FolderOpen, Image
import { Collection } from '../types';
import { collectionsService } from '../services/collectionsService';
import { motion, AnimatePresence } from 'framer-motion';

interface CollectionsManagerProps {
    onBack: () => void;
    onSelectCollection: (collection: Collection) => void;
}

export const CollectionsManager: React.FC<CollectionsManagerProps> = ({ onBack, onSelectCollection }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setIsLoading(true);
        const data = await collectionsService.getUserCollections();
        setCollections(data);
        setIsLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        const newCol = await collectionsService.createCollection(newCollectionName.trim());
        if (newCol) {
            setCollections([newCol, ...collections]);
            setNewCollectionName('');
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this collection?')) {
            const success = await collectionsService.deleteCollection(id);
            if (success) {
                setCollections(collections.filter(c => c.id !== id));
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-black p-8 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="p-3 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800 hover:border-zinc-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 flex items-center gap-3">
                            <FolderOpen className="w-8 h-8 text-purple-500" />
                            My Collections
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Organize and curate your personal galleries</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Collection
                </motion.button>
            </div>

            {/* Create Modal / Inline Form */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto">
                            <h3 className="text-white font-bold mb-4">Create New Collection</h3>
                            <form onSubmit={handleCreate} className="flex gap-4">
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="e.g., 'Cyberpunk Cityscapes' or 'Dreamy Landscapes'"
                                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!newCollectionName.trim()}
                                    className="px-6 py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50 hover:bg-zinc-200 transition-colors"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-6 py-3 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-zinc-900/30 rounded-3xl animate-pulse border border-zinc-800/50" />
                    ))}
                </div>
            ) : collections.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
                        <div className="relative p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-md">
                            <FolderOpen className="w-16 h-16 text-zinc-600 group-hover:text-purple-400 transition-colors duration-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">No collections yet</h2>
                    <p className="text-zinc-500 max-w-sm text-center mb-8">
                        Create your first collection to start organizing your generations into themed galleries.
                    </p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium transition-colors border border-zinc-700"
                    >
                        Create Your First Collection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {collections.map((collection) => (
                        <motion.div
                            key={collection.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
                            onClick={() => onSelectCollection(collection)}
                            className="group relative bg-zinc-900/40 border border-zinc-800/60 hover:border-purple-500/30 rounded-3xl p-5 cursor-pointer transition-all duration-300 overflow-hidden backdrop-blur-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 group-hover:border-purple-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                        <Folder className="w-6 h-6 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(collection.id, e)}
                                        className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                        title="Delete Collection"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-100 transition-colors line-clamp-1">
                                        {collection.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs font-medium text-zinc-500 group-hover:text-zinc-400">
                                        <span className="flex items-center gap-1.5">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            {collection.item_count || 0} items
                                        </span>
                                        <span>
                                            {new Date(collection.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
