import type { BlockType } from '../types';

// ベースパスを取得する関数
const getBasePath = (): string => {
  return import.meta.env.BASE_URL || '/';
};

// 画像パスを取得する関数
const getImagePath = (imageName: string): string => {
  const basePath = getBasePath();
  return `${basePath}images/${imageName}`;
};

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
      return getImagePath('obsidian.png');
    case 'iron':
      return getImagePath('iron.png');
    case 'stone':
      return getImagePath('stone.png');
    case 'wood':
      return getImagePath('wood.png');
    case 'dirt':
      return getImagePath('dirt.png');
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

export const getChestImagePath = (): string => getImagePath('chest.png');
export const getInventoryImagePath = (): string => getImagePath('inventory.png');
export const getInfoButtonImagePath = (): string => getImagePath('info_button.png');
export const getBackgroundImagePath = (): string => getImagePath('background.png');