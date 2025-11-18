import React, { useState } from 'react';
import type { Todo } from '../types';
import { getBlockColor, getBlockName, getBlockTypeFromPriority, getBlockTexture, getCrackImagePath } from '../utils/blockUtils';
import Tooltip from './Tooltip';

type Props = {
  todo: Todo;
  onComplete: (id: string, value: boolean, particleInfo?: { 
    blockTexture: string; 
    blockPosition: { x: number; y: number } 
  }) => void;
  onEdit: (todo: Todo, position: { x: number; y: number }) => void;
  gridPosition: { x: number; y: number };
  crackLevel: number;
};

const BlockComponent: React.FC<Props> = ({ todo, onComplete, onEdit, gridPosition, crackLevel=0 }) => {
  const [isBreaking, setIsBreaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [breakingProgress, setBreakingProgress] = useState(0);

  const handleClick = () => {
    if (isBreaking || isCompleted) return;
    
    setIsBreaking(true);
    
    // ブロック要素の位置を取得
    const blockElement = document.querySelector(`[data-block-id="${todo.id}"]`) as HTMLElement;
    if (blockElement) {
      const rect = blockElement.getBoundingClientRect();
      const blockPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      
      const blockType = getBlockTypeFromPriority(todo.priority);
      const blockTexture = getBlockTexture(blockType);

      const breakingTime = getBlockBreakingTime(todo.priority);
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / breakingTime, 1);
        setBreakingProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(updateProgress);
        } else {
          setIsCompleted(true);
        }
      };
      
      requestAnimationFrame(updateProgress);
      
      // パーティクル情報と共に完了処理を呼び出し
      onComplete(todo.id, true, {
        blockTexture,
        blockPosition
      });
    } else {
      onComplete(todo.id, true);
    }
  };

  const getBlockBreakingTime = (priority: number): number => {
    const blockType = getBlockTypeFromPriority(todo.priority);
    const breakingTimes = {
      'dirt': 1000,
      'stone': 2000,
      'wood': 1500,
      'iron': 3000,
      'obsidian': 4000,
    };
    return breakingTimes[blockType] || 1000;
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(false);
    onEdit(todo, { x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showTooltip) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const blockType = getBlockTypeFromPriority(todo.priority);
  const blockColorClass = getBlockColor(blockType);
  const blockTexture = getBlockTexture(blockType);
  const blockName = getBlockName(blockType);

  const isOverdue = todo.deadline && new Date() > todo.deadline;
  const isNearDeadline = todo.deadline && !isOverdue && 
    new Date(Date.now() + 24 * 60 * 60 * 1000) > todo.deadline;

  return (
    <div className='relative'>
      <div
        data-block-id={todo.id}
        className={`
          relative w-16 h-16 border-2 cursor-pointer transform transition-all duration-300
          ${blockColorClass}
          ${isBreaking ? `scale-${Math.max(50, 100 - Math.floor(breakingProgress * 50))} opacity-${Math.max(30, 100 - Math.floor(breakingProgress * 70))}` : 'hover:scale-105'}
          ${isOverdue ? 'ring-4 ring-red-500' : isNearDeadline ? 'ring-2 ring-yellow-400' : ''}
          shadow-lg overflow-hidden
          ${isCompleted ? 'pointer-events-none' : ''} 
        `}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          gridColumn: gridPosition.x + 1,
          gridRow: gridPosition.y + 1,
          backgroundImage: `url(${blockTexture})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          imageRendering: 'pixelated',
        }}
      >
        {/* 破壊進行状況のオーバーレイ */}
        {isBreaking && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-orange-500/30"
            style={{
              opacity: breakingProgress * 0.7,
            }}
          />
        )}
        
        {/* テクスチャオーバーレイ（明度調整） */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10"></div>
        
        {/* タスク名表示エリア */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 px-1 py-0.5 rounded text-center">
            <span className="text-xs font-bold text-white leading-tight">
              {todo.name.length > 4 ? todo.name.substring(0, 4) + '..' : todo.name}
            </span>
          </div>
        </div>

        {/* 優先度インジケーター */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full border border-black"></div>
        
        {/* 期限インジケーター */}
        {todo.deadline && (
          <div className={`absolute bottom-1 left-1 w-2 h-2 rounded-full border border-black ${
            isOverdue ? 'bg-red-500' : isNearDeadline ? 'bg-yellow-400' : 'bg-green-400'
          }`}></div>
        )}
        
        {/* 破壊エフェクト */}
        {isBreaking && (
          <div className="absolute inset-0 bg-white/50 animate-pulse"></div>
        )}

        {/* ひび割れエフェクト */}
        {crackLevel > 0 && crackLevel <= 5 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url('${getCrackImagePath(crackLevel)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
              zIndex: 10,
            }}
          />
        )}
      </div>

      {/* カスタムツールチップ */}
      <Tooltip
        todo={todo}
        visible={showTooltip && !isBreaking && !isCompleted}
        position={tooltipPosition}
      />
    </div>
  );
};

export default BlockComponent;