import React, { useState } from 'react';
import type { Todo } from '../types';
import BlockComponent from './Block';
import AddTodoModal from './AddTodoModal';
import EditTodoModal from './EditTodoModal';
import ParticleEffect from './ParticleEffect';
import { getBlockTypeFromPriority } from '../utils/blockUtils';

type ParticleEffectData = {
  id: string;
  blockTexture: string;
  blockPosition: { x: number; y: number };
  createdAt: number;
  duration: number;
};

type SortOption = 'none' | 'deadline' | 'priority';

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  addTodo: (todo: Omit<Todo, 'id'>) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
};

const World: React.FC<Props> = ({ todos, updateIsDone, addTodo, updateTodo, deleteTodo }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [particleEffects, setParticleEffects] = useState<ParticleEffectData[]>([]);
  const [pendingCompletions, setPendingCompletions] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('none');

  const MAX_BLOCKS = 27;

  const getBlockBreakingTime = (priority: number): number => {
    const blockType = getBlockTypeFromPriority(priority);
    const breakingTimes = {
      'dirt': 1000,
      'stone': 2000,
      'wood': 1500,
      'iron': 3000,
      'obsidian': 4000,
    };
    return breakingTimes[blockType] || 1000;
  };

  // ソート関数
  const sortTodos = (todos: Todo[], sortOption: SortOption): Todo[] => {
    const currentTime = new Date();
    
    switch (sortOption) {
      case 'deadline':
        return [...todos].sort((a, b) => {
          // 期限なしのタスクは最後に配置
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          
          // 期限切れのタスクを優先（期限切れの度合いが大きい順）
          const aOverdue = a.deadline < currentTime;
          const bOverdue = b.deadline < currentTime;
          
          if (aOverdue && bOverdue) {
            // 両方期限切れの場合、より期限切れの度合いが大きいものを優先
            return a.deadline.getTime() - b.deadline.getTime();
          } else if (aOverdue && !bOverdue) {
            return -1; // aが期限切れならaを優先
          } else if (!aOverdue && bOverdue) {
            return 1; // bが期限切れならbを優先
          } else {
            // 両方期限内の場合、期限が近いものを優先
            return a.deadline.getTime() - b.deadline.getTime();
          }
        });
      
      case 'priority':
        return [...todos].sort((a, b) => b.priority - a.priority); // 優先度が高い順
      
      case 'none':
      default:
        return todos; // 元の順序を維持
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const activeTodos = todos.filter(todo => !todo.isDone);
    
    if (activeTodos.length >= MAX_BLOCKS) {
      alert(`インベントリが満杯です！(${MAX_BLOCKS}/27)\n完了チェストに移動してスペースを空けてください。`);
      return;
    }
    
    setModalPosition({ x: e.clientX, y: e.clientY });
    setShowAddModal(true);
  };

  const handleEditTodo = (todo: Todo, position: { x: number; y: number }) => {
    setEditingTodo(todo);
    setModalPosition(position);
    setShowEditModal(true);
  };

  const handleCompleteWithEffect = (
    id: string, 
    value: boolean, 
    particleInfo?: { blockTexture: string; blockPosition: { x: number; y: number } }
  ) => {
    if (value && particleInfo) {
      const todo = todos.find(t => t.id === id);
      if (!todo) {
        updateIsDone(id, value);
        return;
      }

      const breakingTime = getBlockBreakingTime(todo.priority);
      const effectId = `effect-${id}-${Date.now()}`;
      
      // パーティクルエフェクトを追加
      const newEffect: ParticleEffectData = {
        id: effectId,
        blockTexture: particleInfo.blockTexture,
        blockPosition: particleInfo.blockPosition,
        createdAt: Date.now(),
        duration: breakingTime,
      };
      
      setParticleEffects(prev => [...prev, newEffect]);
      setPendingCompletions(prev => new Set([...prev, id]));
      
      // breakingTime後にタスクを完了
      setTimeout(() => {
        updateIsDone(id, true);
      }, breakingTime);
    } else {
      updateIsDone(id, value);
    }
  };

  const handleEffectComplete = (effectId: string) => {
    // 該当するタスクIDを探す
    const todoId = effectId.split('-')[1];
    
    // エフェクトリストから削除
    setParticleEffects(prev => prev.filter(effect => effect.id !== effectId));
    
    // 保留中の完了処理から削除
    setPendingCompletions(prev => {
      const newSet = new Set(prev);
      newSet.delete(todoId);
      return newSet;
    });
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingTodo(null);
  };

  const activeTodos = todos.filter(todo => !todo.isDone);
  const sortedActiveTodos = sortTodos(activeTodos, sortBy);
  const remainingSlots = MAX_BLOCKS - activeTodos.length;

  // 期限に関する統計
  const currentTime = new Date();
  const overdueTodos = activeTodos.filter(todo => todo.deadline && todo.deadline < currentTime);
  const urgentTodos = activeTodos.filter(todo => 
    todo.deadline && 
    todo.deadline >= currentTime && 
    todo.deadline <= new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
  );

  const textSizes = {
    main: '12px',
    small: '10px',
    title: '16px',
  };

  return (
    <div className="relative">
      {/* 背景 */}
      <div
        className="min-h-[300px] rounded-lg p-4 relative bg-transparent pt-4 pixel-font"
        style={{
          backgroundColor: '#c6c6c6',
        }}
        onContextMenu={handleRightClick}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <div className="text-center text-gray-800 mb-1 bg-white/80 rounded px-2 py-1">
              <span style={{ fontSize: textSizes.main }}>右クリックでタスクを追加 | 左クリックでタスク完了 | ブロック右クリックで編集</span>
              <div className="text-xs text-gray-600 mt-1 flex items-center justify-center space-x-4">
                <span style={{ fontSize: textSizes.main }}>容量: {activeTodos.length}/{MAX_BLOCKS}</span>
                <span className="text-red-600" style={{ fontSize: textSizes.main }}>期限切れ: {overdueTodos.length}個</span>
                <span className="text-yellow-600" style={{ fontSize: textSizes.main }}>緊急: {urgentTodos.length}個</span>
              </div>
            </div>
          </div>

          {/* ソート設定 */}
          <div className="flex justify-center">
            <div className="bg-white/80 rounded px-3 py-2 flex items-center space-x-4">
              <span className="text-sm font-bold text-gray-700" style={{ fontSize: textSizes.main }}>ソート:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortBy('none')}
                  className={`px-3 py-1 text-xs rounded ${
                    sortBy === 'none' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ fontSize: textSizes.main }}
                >
                  なし
                </button>
                <button
                  onClick={() => setSortBy('deadline')}
                  className={`px-3 py-1 text-xs rounded ${
                    sortBy === 'deadline' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ fontSize: textSizes.main }}
                >
                  期限順
                </button>
                <button
                  onClick={() => setSortBy('priority')}
                  className={`px-3 py-1 text-xs rounded ${
                    sortBy === 'priority' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ fontSize: textSizes.main }}
                >
                  優先度順
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* ブロック配置エリア（Minecraft風 9列グリッド） */}
        <div className="clear-both">
          <div 
            className="grid grid-cols-9 gap-x-1.5 gap-y-3.5 justify-items-center relative z-10 mt-2"
            style={{
              maxWidth: '100%', // App.tsxのlg:col-span-2に収まるように
            }}
          >
            {/* ソート済みアクティブなタスクブロック */}
            {sortedActiveTodos.map((todo, index) => (
              <div
                key={todo.id}
                className='rounded'
                style={{
                  backgroundColor: '#94979b',
                  padding: '2px',
                }}
              >
              <BlockComponent
                todo={todo}
                onComplete={handleCompleteWithEffect}
                onEdit={handleEditTodo}
                gridPosition={{ 
                  x: index % 9, 
                  y: Math.floor(index / 9) 
                }}
              />
              </div>
            ))}

            {/* 空きスロット表示 */}
            {Array.from({ length: Math.max(0, MAX_BLOCKS - activeTodos.length) }).map((_, index) => (
              <div
                key={`empty-slot-${index}`}
                className="rounded"
                style={{
                  backgroundColor: '#94979b',
                  padding: '2px',
                }}
                onContextMenu={handleRightClick}
                title="右クリックでタスクを追加"
              >
                <div
                  className="border border-dashed border-gray-400/50 opacity-30 hover:opacity-50 hover:border-gray-500/70 transition-all duration-200 cursor-pointer rounded flex items-center justify-center"
                  style={{
                    width: '60px',
                    height: '60px',
                  }}
                >
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 空の時の表示 */}
        {activeTodos.length === 0 && (
          <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
            <div className="text-gray-800 text-lg text-center bg-white/80 rounded p-4">
              <span style={{ fontSize: textSizes.title }}>空のインベントリ</span><br />
              <span style={{ fontSize: textSizes.title }}>右クリックでブロックを追加しよう！</span><br />
              <span className="text-sm text-gray-600" style={{ fontSize: textSizes.main }}>最大27個まで配置可能</span>
            </div>
          </div>
        )}

        {/* 満杯警告 */}
        {activeTodos.length >= MAX_BLOCKS && (
          <div className="absolute top-4 left-4 bg-red-500/90 text-white p-2 rounded z-50">
            <span style={{ fontSize: textSizes.main }}>⚠️ インベントリ満杯！</span>
          </div>
        )}
      </div>

      {/* タスク追加モーダル */}
      {showAddModal && (
        <AddTodoModal
          position={modalPosition}
          onClose={closeAllModals}
          onAdd={addTodo}
        />
      )}

      {/* タスク編集モーダル */}
      {showEditModal && editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          position={modalPosition}
          onClose={closeAllModals}
          onSave={updateTodo}
          onDelete={deleteTodo}
        />
      )}

      {/* 複数パーティクルエフェクト */}
      <ParticleEffect
        effects={particleEffects}
        onEffectComplete={handleEffectComplete}
      />
    </div>
  );
};

export default World;