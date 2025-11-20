import React, { useState } from 'react';
import type { Todo } from '../types';
import { getBlockColor, getBlockName, getBlockTypeFromPriority } from '../utils/blockUtils';

type Props = {
  todo: Todo;
  position: { x: number; y: number };
  onClose: () => void;
  onSave: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

const EditTodoModal: React.FC<Props> = ({ todo, position, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(todo.name);
  const [priority, setPriority] = useState(todo.priority);
  const [deadline, setDeadline] = useState<string>(
    todo.deadline ? new Date(todo.deadline.getTime() - todo.deadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
  );

  const modalWidth = 420;
  const modalHeight = 500; // 編集モーダルは削除ボタンがあるので少し高め
  const margin = 60; // 画面端からの余白

  const calculatePosition = () => {
    let left = position.x;
    let top = position.y;

    // 右端チェック
    if (left + modalWidth > window.innerWidth - margin) {
      left = window.innerWidth - modalWidth - margin;
    }
    // 左端チェック
    if (left < margin) {
      left = margin;
    }

    // 下端チェック
    if (top + modalHeight > window.innerHeight - margin) {
      top = window.innerHeight - modalHeight - margin;
    }
    // 上端チェック
    if (top < margin) {
      top = margin;
    }

    return { left, top };
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        ...todo,
        name,
        priority,
        deadline: deadline ? new Date(deadline) : null,
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm(`「${todo.name}」を削除しますか？`)) {
      onDelete(todo.id);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const blockType = getBlockTypeFromPriority(priority);
  const blockName = getBlockName(blockType);

  const modalPosition = calculatePosition();

  return (
    <>
      {/* 背景オーバーレイ（半透明黒） */}
      <div 
        className="fixed inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998 
        }}
        onClick={onClose}
      ></div>
      
      {/* モーダル */}
      <div
        className="fixed bg-stone-500 border-4 border-stone-600 rounded-lg p-6 shadow-2xl"
        style={{
          left: modalPosition.left,
          top: modalPosition.top,
          width: `${modalWidth}px`,
          maxWidth: `calc(100vw - ${margin * 2}px)`,
          maxHeight: `calc(100vh - ${margin * 2}px)`,
          zIndex: 9999,
          overflow: 'auto',
        }}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          ブロックを編集
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
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              削除
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              キャンセル
            </button>
          </div>

          {/* ショートカットキー説明 */}
          <div className="text-xs text-gray-300 text-center">
            Ctrl+Enter: 保存 | Esc: キャンセル
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTodoModal;