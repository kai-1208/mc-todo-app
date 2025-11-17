export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null; // 注意
};

export type BlockType = 'obsidian' | 'iron' | 'stone' | 'wood' | 'dirt';

export type CompletedTodo = Todo & {
  completedAt: Date;
};