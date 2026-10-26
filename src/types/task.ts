export interface Task {
  id: number;
  gtin?: string | null;
  name?: string | null;
  description?: string | null;
  batch?: string | null;
  isActive?: boolean;
  isHistory?: boolean;
  createdAt?: string | null;
}

export type TaskTab = 'active' | 'history';

export type TaskCardMode = 'continue' | 'start' | 'history';
