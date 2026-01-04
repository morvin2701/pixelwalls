/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  resolution: '2K' | '4K';
  aspectRatio: '16:9' | '9:16' | '1:1';
  createdAt: number;
  favorite?: boolean;
  category?: 'nature' | 'urban' | 'abstract' | 'sci-fi' | 'minimalist' | 'uncategorized' | 'mountains' | 'beaches' | 'forest' | 'city' | 'space' | 'animals' | 'fantasy' | 'trending' | 'latest';
  tags?: string[];
  isPublic?: boolean;
  likesCount?: number;
  userName?: string;
  userAvatar?: string;
  isLiked?: boolean; // UI state for if current user liked it
}

export interface GenerationParams {
  prompt: string;
  resolution: '2K' | '4K';
  aspectRatio: '16:9' | '9:16' | '1:1';
  stylePreset?: string;
  enhancePrompt?: boolean;
}

export type ViewMode = 'gallery' | 'favorites' | 'history' | 'paymentHistory' | 'collections' | 'community';

export const STYLE_PRESETS = [
  {
    id: 'none',
    label: 'No Style',
    description: 'Raw creativity, no filters',
    promptSuffix: '',
    gradient: 'from-zinc-600 to-zinc-800'
  },
  {
    id: 'photorealistic',
    label: 'Cinematic',
    description: 'Hyper-realism, 8k photography',
    promptSuffix: 'highly detailed, photorealistic, 8k, cinematic lighting, depth of field, ray tracing, unreal engine 5 render',
    gradient: 'from-orange-400 to-amber-600'
  },
  {
    id: 'nature',
    label: 'Ethereal',
    description: 'Dreamy nature & landscapes',
    promptSuffix: 'misty mountains, forest morning, bioluminescent plants, dreamlike atmosphere, macro details, national geographic style',
    gradient: 'from-emerald-400 to-teal-600'
  },
  {
    id: 'abstract',
    label: 'Fluid 3D',
    description: 'Glassy shapes & gradients',
    promptSuffix: 'abstract fluid 3d shapes, glassmorphism, vibrant gradients, smooth curves, iridescent materials, studio lighting',
    gradient: 'from-purple-400 to-pink-600'
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean lines, pastel colors',
    promptSuffix: 'minimalist, clean lines, pastel colors, plenty of negative space, flat design, vector art style, soothing',
    gradient: 'from-slate-200 to-slate-400'
  },
  {
    id: 'digital-art',
    label: 'Fantasy',
    description: 'Concept art & illustration',
    promptSuffix: 'digital painting, trending on artstation, concept art, sharp focus, intricate details, masterpiece, fantasy art',
    gradient: 'from-blue-400 to-indigo-600'
  },
  {
    id: 'scifi',
    label: 'Cyber',
    description: 'Futuristic tech & neon',
    promptSuffix: 'futuristic, sci-fi, spaceship interior, neon details, high tech, star wars aesthetic, cosmic background',
    gradient: 'from-fuchsia-500 to-purple-800'
  },
];

export interface DevicePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: number; // width / height
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'original', label: 'Original', width: 0, height: 0, aspectRatio: 0 },
  { id: 'iphone-15', label: 'iPhone 15/14', width: 1179, height: 2556, aspectRatio: 1179 / 2556 },
  { id: 'iphone-se', label: 'iPhone SE', width: 750, height: 1334, aspectRatio: 750 / 1334 },
  { id: 'pixel-8', label: 'Pixel 8', width: 1080, height: 2400, aspectRatio: 1080 / 2400 },
  { id: 'samsung-s24', label: 'Samsung S24', width: 1080, height: 2340, aspectRatio: 1080 / 2340 },
  { id: 'ipad-pro', label: 'iPad Pro 12.9"', width: 2048, height: 2732, aspectRatio: 2048 / 2732 },
  { id: 'desktop-4k', label: 'Desktop 4K', width: 3840, height: 2160, aspectRatio: 3840 / 2160 },
  { id: 'desktop-1080p', label: 'Desktop 1080p', width: 1920, height: 1080, aspectRatio: 1920 / 1080 },
];

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number; // Optional count for UI
  preview_images?: string[]; // Optional previews for UI
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  wallpaper_id: string;
  added_at: string;
}