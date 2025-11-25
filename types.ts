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
}

export interface GenerationParams {
  prompt: string;
  resolution: '2K' | '4K';
  aspectRatio: '16:9' | '9:16' | '1:1';
  stylePreset?: string;
  enhancePrompt?: boolean;
}

export type ViewMode = 'create' | 'gallery' | 'favorites';

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