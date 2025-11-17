import React, { useState } from 'react';
import type { Todo } from '../types';
import { getBlockColor, getBlockName, getBlockTypeFromPriority } from '../utils/blockUtils';

type Props = {
  position: { x: number; y: number };
  onClose: () => void;
  onAdd: (todo: Omit<Todo, 'id'>) => void;
};

const AddTodoModal: React.FC<Props> = ({ position, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(3);
  const [deadline, setDeadline] = useState<string>('');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd({
        name,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        isDone: false,
      });
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const blockType = getBlockTypeFromPriority(priority);
  const blockName = getBlockName(blockType);

  return (
    <>
      {/* 背景オーバーレイ（半透明黒） */}
      <div 
        className="fixed inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998 
        }}
        onClick={onClose}
      ></div>
      
      {/* モーダル */}
      <div
        className="fixed bg-stone-500 border-4 border-stone-600 rounded-lg p-6 min-w-[400px] shadow-2xl"
        style={{
          left: Math.min(position.x, window.innerWidth - 420),
          top: Math.min(position.y, window.innerHeight - 400),
          zIndex: 9999,
        }}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          新しいブロックを作成
        </h2>

        <div className="space-y-4">
          {/* タスク名 */}
          <div>
            <label className="block text-white font-bold mb-1">タスク名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border-2 border-stone-700 rounded bg-stone-100"
              placeholder="タスク名を入力..."
              autoFocus
            />
          </div>

          {/* 優先度選択 */}
          <div>
            <label className="block text-white font-bold mb-2">優先度</label>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <label key={p} className="flex items-center space-x-2 text-white cursor-pointer">
                  <input
                    type="radio"
                    value={p}
                    checked={priority === p}
                    onChange={(e) => setPriority(Number(e.target.value))}
                  />
                  <div className={`w-6 h-6 border-2 ${getBlockColor(getBlockTypeFromPriority(p))}`}></div>
                  <span>{getBlockName(getBlockTypeFromPriority(p))} (優先度 {p})</span>
                </label>
              ))}
            </div>
          </div>

          {/* 期限 */}
          <div>
            <label className="block text-white font-bold mb-1">期限</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2 border-2 border-stone-700 rounded bg-stone-100"
            />
          </div>

          {/* ボタン */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              ブロックを作成
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              キャンセル
            </button>
          </div>

          {/* ショートカットキー説明 */}
          <div className="text-xs text-gray-300 text-center">
            Ctrl+Enter: 作成 | Esc: キャンセル
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTodoModal;