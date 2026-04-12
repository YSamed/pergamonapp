import type { Todo } from '../types';
import { mockTodos } from '../mock';

let _todos = [...mockTodos];

export const todosService = {
  async getTodos(): Promise<Todo[]> {
    return _todos.filter((t) => !t.completedAt);
  },

  async getCompletedTodos(): Promise<Todo[]> {
    return _todos.filter((t) => !!t.completedAt);
  },

  async completeTodo(id: string): Promise<Todo> {
    const index = _todos.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Todo not found: ${id}`);

    _todos[index] = {
      ..._todos[index],
      completedAt: new Date().toISOString(),
    };
    return _todos[index];
  },

  async createTodo(data: Omit<Todo, 'id' | 'createdAt' | 'completedAt'>): Promise<Todo> {
    const newTodo: Todo = {
      ...data,
      id: `todo-${Date.now()}`,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    _todos.push(newTodo);
    return newTodo;
  },

  async deleteTodo(id: string): Promise<void> {
    _todos = _todos.filter((t) => t.id !== id);
  },
};
