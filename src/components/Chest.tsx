import React, { useState } from 'react';
import type { CompletedTodo } from '../types';
import { getBlockColor, getBlockName, getBlockTypeFromPriority, getBlockTexture, getChestImagePath } from '../utils/blockUtils';
import CompletedTooltip from './CompletedTooltip';

type Props = {
  completedTodos: CompletedTodo[];
  onRestore: (todo: CompletedTodo) => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
  activeTodosCount: number;
};

const Chest: React.FC<Props> = ({ completedTodos, onRestore, onClearAll, onDelete, activeTodosCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTodo, setHoveredTodo] = useState<CompletedTodo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const MAX_CHEST_CAPACITY = 27;
  const MAX_WORLD_CAPACITY = 27;

  const handleMouseEnter = (todo: CompletedTodo, e: React.MouseEvent) => {
    setHoveredTodo(todo);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredTodo(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredTodo) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleRestore = (todo: CompletedTodo) => {
    setHoveredTodo(null);
    
    if (activeTodosCount >= MAX_WORLD_CAPACITY) {
      alert(`インベントリが満杯です！(${activeTodosCount}/${MAX_WORLD_CAPACITY})\n先にいくつかのタスクを完了してからお試しください。`);
      return;
    }
    
    onRestore(todo);
  };

  const handleDelete = (todo: CompletedTodo, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredTodo(null);
    onDelete(todo.id);
  };

  const handleClearAll = () => {
    setHoveredTodo(null);
    onClearAll();
  };

  const isChestFull = completedTodos.length >= MAX_CHEST_CAPACITY;

  const textSizes = {
    main: '12px',
    small: '10px',
    tiny: '8px',
    button: '11px',
    label: '14px',
    title: '16px',
  };

  return (
    <>
      <div className="rounded-lg p-4 pixel-font" style={{ backgroundColor: '#c6c6c6' }}>
        {/* チェスト画像ボタン */}
        <div className="flex flex-col items-center">
          <div 
            className="relative cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img 
              src={getChestImagePath()}
              alt="Chest" 
              className="w-16 h-16 hover:scale-110 transition-transform"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* 完了数バッジ */}
            {completedTodos.length > 0 && (
              <div className={`absolute -top-2 -right-2 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white pointer-events-none ${
                isChestFull ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ fontSize: textSizes.small }}
              >
                {completedTodos.length}
              </div>
            )}

            {/* 満杯警告 */}
            {isChestFull && (
              <div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-1 rounded"
                style={{ fontSize: textSizes.tiny }}
              >
                満杯
              </div>
            )}
          </div>
          
          {/* チェストラベル */}
          <div 
            className="mt-1 font-bold text-gray-800 bg-white/80 rounded px-2 py-1 flex items-center cursor-pointer hover:bg-white/90 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            style={{ fontSize: textSizes.label }}
          >
            完了チェスト
            <span className="ml-2 text-gray-600" style={{ fontSize: textSizes.main }}>
              {isOpen ? '▼' : '▶'}
            </span>
          </div>
        </div>
        
        {isOpen && (
          <div className="mt-2">
            {/* チェスト操作説明とボタン */}
            <div className="flex flex-col space-y-2 mb-2">
              <div className="text-gray-600 bg-white/80 rounded text-center py-1" style={{ fontSize: textSizes.small }}>
                <div>左クリック: 復活 | 右クリック: 削除</div>
              </div>
              {completedTodos.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors flex items-center space-x-1"
                    title="すべてのタスクを削除"
                    style={{ fontSize: textSizes.button }}
                  >
                    <span>🗑️</span>
                    <span>全削除</span>
                  </button>
                </div>
              )}
            </div>

            {/* Minecraft風チェストインベントリ（9列グリッド） */}
            <div 
              className="grid grid-cols-9 gap-1 p-2 rounded max-h-80 overflow-y-auto"
            >
              {/* 完了済みタスクを配置 */}
              {completedTodos.slice(0, MAX_CHEST_CAPACITY).map((todo, index) => {
                const blockType = getBlockTypeFromPriority(todo.priority);
                const blockTexture = getBlockTexture(blockType);
                const isOverdue = todo.deadline && todo.completedAt > todo.deadline;
                
                return (
                  <div
                    key={todo.id}
                    className="cursor-pointer relative overflow-hidden hover:scale-110 transition-transform shadow-md group rounded"
                    style={{
                      backgroundColor: '#94979b',
                      padding: '1px',
                      width: '24px',
                      height: '24px',
                    }}
                    onClick={() => handleRestore(todo)}
                    onContextMenu={(e) => handleDelete(todo, e)}
                    onMouseEnter={(e) => handleMouseEnter(todo, e)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    <div
                      className={`w-6 h-6 border relative ${getBlockColor(blockType)} ${isOverdue ? 'ring-1 ring-red-400' : ''}`}
                      style={{
                        backgroundImage: `url(${blockTexture})`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'repeat',
                        imageRendering: 'pixelated',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10"></div>
                      
                      {/* 期限超過マーク（極小） */}
                      {isOverdue && (
                        <div className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full"></div>
                      )}

                      {/* 優先度インジケーター（極小） */}
                      <div className="absolute bottom-0 left-0 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                );
              })}

              {/* 空きスロット表示 */}
              {Array.from({ length: Math.max(0, MAX_CHEST_CAPACITY - Math.min(completedTodos.length, MAX_CHEST_CAPACITY)) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="rounded"
                  style={{
                    backgroundColor: '#94979b',
                    padding: '1px',
                    width: '24px',
                    height: '24px',
                  }}
                >
                  <div className="w-6 h-6 border border-dashed border-gray-400/50 opacity-30 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* チェストの統計情報 */}
            <div className={`mt-1 text-gray-800 text-center bg-white/80 rounded px-2 py-1 ${
              isChestFull ? 'bg-red-100 text-red-800' : ''
            }`}
            style={{ fontSize: textSizes.main }}
            >
              完了済み: {Math.min(completedTodos.length, MAX_CHEST_CAPACITY)}個
              {isChestFull && ' (満杯)'}
              {completedTodos.length > MAX_CHEST_CAPACITY && (
                <div 
                  className="text-red-600 mt-1"
                  style={{ fontSize: textSizes.small }}
                >
                  警告: {completedTodos.length - MAX_CHEST_CAPACITY}個が表示されていません
                </div>
              )}
            </div>

            {/* 復活制限メッセージ */}
            {activeTodosCount >= MAX_WORLD_CAPACITY && (
              <div 
                className="mt-2 text-red-600 text-center bg-red-50 rounded px-2 py-1"
                style={{ fontSize: textSizes.small }}
              >
                インベントリが満杯のため復活できません ({activeTodosCount}/{MAX_WORLD_CAPACITY})
              </div>
            )}
          </div>
        )}
      </div>

      {/* 完了済みタスク用ツールチップ */}
      {hoveredTodo && (
        <CompletedTooltip
          todo={hoveredTodo}
          visible={true}
          position={tooltipPosition}
        />
      )}
    </>
  );
}

export default Chest;