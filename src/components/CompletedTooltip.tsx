import React from 'react';
import type { CompletedTodo } from '../types';
import { getBlockName, getBlockTypeFromPriority } from '../utils/blockUtils';

type Props = {
  todo: CompletedTodo;
  visible: boolean;
  position: { x: number; y: number };
};

const CompletedTooltip: React.FC<Props> = ({ todo, visible, position }) => {
  if (!visible) return null;

  const blockType = getBlockTypeFromPriority(todo.priority);
  const blockName = getBlockName(blockType);
  
  const isOverdue = todo.deadline && todo.completedAt > todo.deadline;
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
      <div className="relative bg-emerald-800 border-2 border-emerald-600 rounded-lg p-3 shadow-2xl min-w-[200px] max-w-[300px]">
        {/* 吹き出しの矢印 */}
        <div className="absolute -left-2 top-4 w-4 h-4 bg-emerald-800 border-l-2 border-b-2 border-emerald-600 transform rotate-45"></div>
        
        {/* タスク情報 */}
        <div className="space-y-2 text-white text-sm">
          {/* タスク名 */}
          <div className="font-bold text-green-300">
            ✅ {todo.name} (完了済み)
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
          
          {/* 完了日時 */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">🎉 完了:</span>
            <span className="text-green-300">
              {formatDate(todo.completedAt)}
            </span>
          </div>
          
          {/* 期限（完了済みの場合） */}
          {todo.deadline && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">⏰ 期限:</span>
              <span className={`
                ${isOverdue ? 'text-red-400' : 'text-green-400'}
              `}>
                {formatDate(todo.deadline)}
                {isOverdue && ' (期限超過)'}
                {!isOverdue && ' (期限内完了)'}
              </span>
            </div>
          )}
          
          {/* 操作方法 */}
          <div className="border-t border-emerald-600 pt-2 mt-2">
            <div className="text-xs text-gray-400 space-y-1">
              <div>🖱️ 左クリック: タスクを復活</div>
              <div>📦 チェストから復元可能</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedTooltip;