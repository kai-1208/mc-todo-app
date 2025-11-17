import { useState, useEffect } from "react";
import type { Todo, CompletedTodo } from "./types";
import { initTodos } from "./initTodos";
import World from "./components/World";
import Chest from "./components/Chest";
import { v4 as uuid } from "uuid";
import { getInfoButtonImagePath, getBackgroundImagePath } from "./utils/blockUtils";

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [completedTodos, setCompletedTodos] = useState<CompletedTodo[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [showInfo, setShowInfo] = useState(false); // インフォメーション表示状態

  const localStorageKey = "MinecraftTodoApp";
  const completedLocalStorageKey = "MinecraftTodoApp_Completed";

  useEffect(() => {
    // アクティブなタスクを読み込み
    const todoJsonStr = localStorage.getItem(localStorageKey);
    if (todoJsonStr && todoJsonStr !== "[]") {
      const storedTodos: Todo[] = JSON.parse(todoJsonStr);
      const convertedTodos = storedTodos.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
      }));
      setTodos(convertedTodos);
    } else {
      setTodos(initTodos);
    }

    // 完了済みタスクを読み込み
    const completedJsonStr = localStorage.getItem(completedLocalStorageKey);
    if (completedJsonStr && completedJsonStr !== "[]") {
      const storedCompleted: CompletedTodo[] = JSON.parse(completedJsonStr);
      const convertedCompleted = storedCompleted.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
        completedAt: new Date(todo.completedAt),
      }));
      setCompletedTodos(convertedCompleted);
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(localStorageKey, JSON.stringify(todos));
    }
  }, [todos, initialized]);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(completedLocalStorageKey, JSON.stringify(completedTodos));
    }
  }, [completedTodos, initialized]);

  const updateIsDone = (id: string, value: boolean) => {
    if (value) {
      // 完了チェストが満杯かチェック
      if (completedTodos.length >= 27) {
        alert(`完了チェストが満杯です！(${completedTodos.length}/27)\n先にいくつかのタスクを削除するか、古いタスクを整理してください。`);
        return;
      }
      
      const todo = todos.find(t => t.id === id);
      if (todo) {
        const completedTodo = { ...todo, completedAt: new Date() };
        setTodos(prev => prev.filter(t => t.id !== id));
        setCompletedTodos(prev => [...prev, completedTodo]);
      }
    } else {
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, isDone: value } : todo
        )
      );
    }
  };

  const addTodo = (todoData: Omit<Todo, 'id'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: uuid(),
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const updateTodo = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const restoreTodo = (completedTodo: CompletedTodo) => {
    const activeTodos = todos.filter(todo => !todo.isDone);

    if (activeTodos.length >= 27) {
      alert(`インベントリが満杯です！(${activeTodos.length}/27)\n先にいくつかのタスクを完了してからお試しください。`);
      return;
    }
    
    const restoredTodo: Todo = {
      id: completedTodo.id,
      name: completedTodo.name,
      isDone: false,
      priority: completedTodo.priority,
      deadline: completedTodo.deadline,
    };
    setTodos(prev => [...prev, restoredTodo]);
    setCompletedTodos(prev => prev.filter(todo => todo.id !== completedTodo.id));
  };

  const deleteCompletedTodo = (id: string) => {
    const todoToDelete = completedTodos.find(todo => todo.id === id);
    if (!todoToDelete) {
      alert('削除するタスクが見つかりません。');
      return;
    }
    
    const confirmMessage = `「${todoToDelete.name}」を削除しますか？\n\nこの操作は元に戻せません。`;
    
    if (window.confirm(confirmMessage)) {
      setCompletedTodos(prev => prev.filter(todo => todo.id !== id));
      alert(`「${todoToDelete.name}」を削除しました。`);
    }
  };

  const clearAllCompletedTodos = () => {
    if (completedTodos.length === 0) {
      alert('削除するタスクがありません。');
      return;
    }
    
    const confirmMessage = `完了済みタスクをすべて削除しますか？\n削除されるタスク: ${completedTodos.length}個\n\nこの操作は元に戻せません。`;
    
    if (window.confirm(confirmMessage)) {
      setCompletedTodos([]);
      alert(`${completedTodos.length}個のタスクを削除しました。`);
    }
  };

  const uncompletedCount = todos.filter(todo => !todo.isDone).length;

  return (
    <div 
      className="min-h-screen bg-sky-200 p-4 relative pixel-font"
      style={{
        backgroundImage: `url('${getBackgroundImagePath()}')`,
        imageRendering: 'pixelated',
      }}
    >
      {/* ヘッダー */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">
            🧱 Minecraft Todo App
          </h1>
          <div className="text-gray-600">
            未完了タスク: {uncompletedCount}個 | 完了済み: {completedTodos.length}個
          </div>
        </div>

        {/* メインエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* インベントリ（メインエリア） */}
          <div className="lg:col-span-2 p-4">
            <World 
              todos={todos}
              updateIsDone={updateIsDone}
              addTodo={addTodo}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
            />
          </div>

          {/* サイドバー（背景画像削除） */}
          <div className="space-y-4 p-4">
            {/* チェスト */}
            <Chest 
              completedTodos={completedTodos}
              onRestore={restoreTodo}
              onClearAll={clearAllCompletedTodos}
              onDelete={deleteCompletedTodo}
              activeTodosCount={todos.filter(todo => !todo.isDone).length}
            />
          </div>
        </div>
      </div>

      {/* 右下固定のインフォメーションボタン */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="bg-transparent hover:bg-gray-100/20 transition-colors p-2 rounded"
        >
          <img 
            src={getInfoButtonImagePath()}
            alt="Info" 
            className="w-12 h-12"
            style={{ imageRendering: 'pixelated' }}
          />
        </button>

        {/* インフォメーション内容（トグル表示） */}
        {showInfo && (
          <div className="absolute bottom-16 right-0 w-80 bg-stone-600 border-4 border-stone-700 rounded-lg p-4 animate-fadeIn shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center">
              📖 操作方法
            </h3>
            <ul className="text-white text-sm space-y-1">
              <li className="flex items-center space-x-2">
                <span className="text-yellow-400">🖱️</span>
                <span>空きスペース右クリック: タスク追加</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">👆</span>
                <span>ブロック左クリック: タスク完了</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">🖱️</span>
                <span>ブロック右クリック: タスク編集</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">📦</span>
                <span>チェストから復活可能</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-orange-400">🎨</span>
                <span>優先度でブロック種類変化</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-400">⏰</span>
                <span>期限表示: 緑(余裕) 黄(24h以内) 赤(超過)</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;