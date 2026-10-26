import type { Task } from '../types/task';

export const INITIAL_VISIBLE_COUNT = 20;
export const LOAD_MORE_COUNT = 20;

export const normalizeTasks = (response: unknown): Task[] => {
  if (Array.isArray(response)) return response as Task[];
  if (!response || typeof response !== 'object') return [];

  const record = response as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as Task[];
  if (Array.isArray(record.tasks)) return record.tasks as Task[];
  return [];
};

const parseTaskId = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;

  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const extractActiveTaskId = (value: unknown): number | null => {
  const primitiveId = parseTaskId(value);
  if (primitiveId !== null) return primitiveId;
  if (value === null || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const directId = parseTaskId(record.taskId) ?? parseTaskId(record.task_id);
  if (directId !== null) return directId;

  for (const key of ['task', 'data', 'activeTask', 'active_task']) {
    const nestedId = extractActiveTaskId(record[key]);
    if (nestedId !== null) return nestedId;
  }

  return parseTaskId(record.id);
};

export const matchesSearch = (task: Task, query: string): boolean => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  return [task.name, task.gtin, task.description, task.batch].some(
    value => String(value ?? '').toLocaleLowerCase().includes(normalizedQuery),
  );
};

export const createdAtToTimestamp = (value: unknown): number => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return 0;
};

export const sortByCreatedAtWithActiveFirst = (
  tasks: Task[],
  activeTaskId: number | null,
): Task[] =>
  [...tasks].sort((a, b) => {
    if (activeTaskId !== null) {
      if (a.id === activeTaskId) return -1;
      if (b.id === activeTaskId) return 1;
    }
    return (
      createdAtToTimestamp(b.createdAt) - createdAtToTimestamp(a.createdAt)
    );
  });
