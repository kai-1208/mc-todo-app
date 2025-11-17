import React from 'react';
import type { Todo } from '../types';
import { getBlockName, getBlockTypeFromPriority } from '../utils/blockUtils';

type Props = {
  todo: Todo;
  visible: boolean;
  position: { x: number; y: number };
};

const Tooltip: React.FC<Props> = ({ todo, visible, position }) => {
  if (!visible) return null;

  const blockType = getBlockTypeFromPriority(todo.priority);
  const blockName = getBlockName(blockType);
  
  const isOverdue = todo.deadline && new Date() > todo.deadline;
  const isNearDeadline = todo.deadline && !isOverdue && 
    new Date(Date.now() + 24 * 60 * 60 * 1000) > todo.deadline;

  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="fixed z-[10000] pointer-events-none tooltip-enter"
      style={{
        left: position.x + 10,
        top: position.y - 10,
      }}
    >
      {/* 吹き出し本体 */}
      <div className="relative bg-stone-800 border-2 border-stone-600 rounded-lg p-3 shadow-2xl min-w-[200px] max-w-[300px]">
        {/* 吹き出しの矢印 */}
        <div className="absolute -left-2 top-4 w-4 h-4 bg-stone-800 border-l-2 border-b-2 border-stone-600 transform rotate-45"></div>
        
        {/* タスク情報 */}
        <div className="space-y-2 text-white text-sm">
          {/* タスク名 */}
          <div className="font-bold text-yellow-400">
            📝 {todo.name}
          </div>
          
          {/* ブロック種類 */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">🧱 種類:</span>
            <span className="text-white">{blockName}</span>
          </div>
          
          {/* 優先度 */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">⭐ 優先度:</span>
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < todo.priority ? 'text-yellow-400' : 'text-gray-600'}>
                  ★
                </span>
              ))}
              <span className="ml-1 text-white">({todo.priority}/5)</span>
            </div>
          </div>
          
          {/* 期限 */}
          {todo.deadline && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">⏰ 期限:</span>
              <span className={`
                ${isOverdue ? 'text-red-400' : isNearDeadline ? 'text-yellow-400' : 'text-green-400'}
              `}>
                {formatDate(todo.deadline)}
                {isOverdue && ' (超過)'}
                {isNearDeadline && ' (24時間以内)'}
              </span>
            </div>
          )}
          
          {/* 操作方法 */}
          <div className="border-t border-stone-600 pt-2 mt-2">
            <div className="text-xs text-gray-400 space-y-1">
              <div>🖱️ 左クリック: タスク完了</div>
              <div>🖱️ 右クリック: 編集・削除</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;