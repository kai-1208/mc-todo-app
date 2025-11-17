import type { BlockType } from '../types';

export const getBlockTypeFromPriority = (priority: number): BlockType => {
  switch (priority) {
    case 1:
      return 'dirt';
    case 2:
      return 'wood';
    case 3:
      return 'stone';
    case 4:
      return 'iron';
    case 5:
      return 'obsidian';
    default:
      return 'stone';
  }
};

export const getBlockColor = (blockType: BlockType): string => {
  switch (blockType) {
    case 'obsidian':
      return 'bg-purple-900 border-purple-800';
    case 'iron':
      return 'bg-gray-400 border-gray-500';
    case 'stone':
      return 'bg-gray-600 border-gray-700';
    case 'wood':
      return 'bg-amber-600 border-amber-700';
    case 'dirt':
      return 'bg-amber-800 border-amber-900';
  }
};

export const getBlockTexture = (blockType: BlockType): string => {
  switch (blockType) {
    case 'obsidian':
      return '/images/obsidian.png';
    case 'iron':
      return '/images/iron.png';
    case 'stone':
      return '/images/stone.png';
    case 'wood':
      return '/images/wood.png';
    case 'dirt':
      return '/images/dirt.png';
  }
};

export const getBlockName = (blockType: BlockType): string => {
  switch (blockType) {
    case 'obsidian':
      return '黒曜石';
    case 'iron':
      return '鉄鉱石';
    case 'stone':
      return '石ブロック';
    case 'wood':
      return '木材ブロック';
    case 'dirt':
      return '土ブロック';
  }
};