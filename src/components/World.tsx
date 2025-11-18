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

type CrackState = {
  todoId: string;
  level: number;
  startTime: number;
  duration: number;
};

type SortOption = 'none' | 'deadline' | 'priority';

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  addTodo: (todo: Omit<Todo, 'id'>) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  completedTodosCount: number;
};

const World: React.FC<Props> = ({ todos, updateIsDone, addTodo, updateTodo, deleteTodo, completedTodosCount }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [particleEffects, setParticleEffects] = useState<ParticleEffectData[]>([]);
  const [pendingCompletions, setPendingCompletions] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [crackStates, setCrackStates] = useState<CrackState[]>([]);

  const MAX_BLOCKS = 27;
  const MAX_CHEST_CAPACITY = 27;

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

      if (pendingCompletions.has(id)) return;

      // 完了チェストが満杯かチェック（エフェクト開始前）
      if (completedTodosCount >= MAX_CHEST_CAPACITY) {
        alert(`完了チェストが満杯です！(${completedTodosCount}/${MAX_CHEST_CAPACITY})\n先にいくつかのタスクを削除するか、古いタスクを整理してください。`);
        return; // エフェクトを開始せずに処理を終了
      }

      // 現在処理中のタスクと合わせて容量オーバーになるかチェック
      const pendingCompletionCount = pendingCompletions.size;
      if (completedTodosCount + pendingCompletionCount + 1 > MAX_CHEST_CAPACITY) {
        alert(`完了チェストの容量が不足しています！\n現在: ${completedTodosCount}個、処理中: ${pendingCompletionCount}個\n残り容量: ${MAX_CHEST_CAPACITY - completedTodosCount - pendingCompletionCount}個`);
        return; // エフェクトを開始せずに処理を終了
      }

      const breakingTime = getBlockBreakingTime(todo.priority);
      const effectId = `effect-${id}-${Date.now()}`;

      // ひび割れ状態を開始
      const crackState: CrackState = {
        todoId: id,
        level: 1,
        startTime: Date.now(),
        duration: breakingTime,
      };
      setCrackStates(prev => [...prev, crackState]);
      
      // ひび割れの進行をアニメーション
      const updateCrack = () => {
        const elapsed = Date.now() - crackState.startTime;
        const progress = Math.min(elapsed / breakingTime, 1);
        
        // 0.0~1.0の進行状況を1~5のひび割れレベルにマッピング
        let newLevel = 1;
        if (progress >= 0.8) newLevel = 5;
        else if (progress >= 0.6) newLevel = 4;
        else if (progress >= 0.4) newLevel = 3;
        else if (progress >= 0.2) newLevel = 2;
        else newLevel = 1;
        
        setCrackStates(prev => prev.map(crack => 
          crack.todoId === id 
            ? { ...crack, level: newLevel }
            : crack
        ));
        
        if (progress < 1) {
          requestAnimationFrame(updateCrack);
        } else {
          // ひび割れエフェクト完了後にクリア
          setTimeout(() => {
            setCrackStates(prev => prev.filter(crack => crack.todoId !== id));
          }, 100);
        }
      };
      
      requestAnimationFrame(updateCrack);
      
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
        setPendingCompletions(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
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

  // 各ブロックのひび割れレベルを取得する関数
  const getCrackLevelForTodo = (todoId: string): number => {
    const crackState = crackStates.find(crack => crack.todoId === todoId);
    return crackState ? crackState.level : 0;
  };

  const textSizes = {
    main: '12px',
    small: '10px',
    title: '16px',
  };

  // レスポンシブ設定
  const responsiveClasses = {
    blockSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16', // 40px → 48px → 56px → 64px
    emptySlotSize: {
      width: 'w-10 sm:w-12 md:w-14 lg:w-16',
      height: 'h-10 sm:h-12 md:h-14 lg:h-16',
    },
    gridGap: 'gap-x-2 gap-y-2 sm:gap-x-2.5 sm:gap-y-2.5 md:gap-x-3 md:gap-y-3 lg:gap-x-3.5 lg:gap-y-3.5',
    containerPadding: 'p-2 sm:p-3 md:p-4',
  };

  return (
    <div className="relative">
      {/* 背景 */}
      <div
        className={`min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] rounded-lg ${responsiveClasses.containerPadding} relative bg-transparent pt-2 sm:pt-3 md:pt-4 pixel-font`}
        style={{
          backgroundColor: '#c6c6c6',
        }}
        onContextMenu={handleRightClick}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
          <div className="flex-1">
            <div className="text-center text-gray-800 mb-1 bg-white/80 rounded px-2 py-1">
              <div className="text-xs sm:text-sm" style={{ fontSize: textSizes.main }}>
                右クリックでタスクを追加 | 左クリックでタスク完了 | ブロック右クリックで編集
              </div>
              <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1">
                <span style={{ fontSize: textSizes.main }}>容量: {activeTodos.length}/{MAX_BLOCKS}</span>
                <span style={{ fontSize: textSizes.main }}>チェスト: {completedTodosCount + pendingCompletions.size}/{MAX_CHEST_CAPACITY}</span>
                <span className="text-red-600" style={{ fontSize: textSizes.main }}>期限切れ: {overdueTodos.length}個</span>
                <span className="text-yellow-600" style={{ fontSize: textSizes.main }}>緊急: {urgentTodos.length}個</span>
              </div>
            </div>
          </div>

          {/* ソート設定 */}
          <div className="flex justify-center">
            <div className="bg-white/80 rounded px-2 sm:px-3 py-1 sm:py-2 flex flex-wrap items-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-2">
              <span className="text-xs sm:text-sm font-bold text-gray-700" style={{ fontSize: textSizes.main }}>ソート:</span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => setSortBy('none')}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded ${
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
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded ${
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
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded ${
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
            className={`grid grid-cols-9 ${responsiveClasses.gridGap} justify-items-center relative z-10 w-full overflow-x-auto`}
            style={{
              maxWidth: '100%', // App.tsxのlg:col-span-2に収まるように
              minWidth: 'fit-content',
            }}
          >
            {/* ソート済みアクティブなタスクブロック */}
            {sortedActiveTodos.map((todo, index) => (
              <div
                key={todo.id}
                className='rounded flex-shrink-0'
                style={{
                  backgroundColor: '#94979b',
                  padding: '1px',
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
                crackLevel={getCrackLevelForTodo(todo.id)}
                isChestFull={completedTodosCount + pendingCompletions.size >= MAX_CHEST_CAPACITY}
                responsiveClasses={responsiveClasses}
              />
              </div>
            ))}

            {/* 空きスロット表示 */}
            {Array.from({ length: Math.max(0, MAX_BLOCKS - activeTodos.length) }).map((_, index) => (
              <div
                key={`empty-slot-${index}`}
                className="rounded flex-shrink-0"
                style={{
                  backgroundColor: '#94979b',
                  padding: '1px',
                }}
                onContextMenu={handleRightClick}
                title="右クリックでタスクを追加"
              >
                <div
                  className={`${responsiveClasses.emptySlotSize.width} ${responsiveClasses.emptySlotSize.height} border border-dashed border-gray-400/50 opacity-30 hover:opacity-50 hover:border-gray-500/70 transition-all duration-200 cursor-pointer rounded flex items-center justify-center`}
                >
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 空の時の表示 */}
        {activeTodos.length === 0 && (
          <div className="flex items-center justify-center mt-4" style={{ minHeight: '150px sm:200px md:250px' }}>
            <div className="text-gray-800 text-center bg-white/80 rounded p-3 sm:p-4">
              <div className="text-lg sm:text-xl font-bold mb-2" style={{ fontSize: textSizes.title }}>空のインベントリ</div>
              <div className="text-base sm:text-lg" style={{ fontSize: textSizes.title }}>右クリックでブロックを追加しよう！</div>
              <div className="text-sm text-gray-600 mt-2" style={{ fontSize: textSizes.main }}>最大27個まで配置可能</div>
            </div>
          </div>
        )}

        {/* 満杯警告 */}
        {activeTodos.length >= MAX_BLOCKS && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500/90 text-white p-1 sm:p-2 rounded z-50 text-xs sm:text-sm">
            <span>⚠️ インベントリ満杯！</span>
          </div>
        )}

        {/* 完了チェスト満杯警告 */}
        {completedTodosCount >= MAX_CHEST_CAPACITY && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500/90 text-white p-1 sm:p-2 rounded z-50 text-xs sm:text-sm">
            <span>⚠️ 完了チェスト満杯！</span>
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