import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiService } from '../services/api';
import type { Task, TaskCardMode, TaskTab } from '../types/task';
import {
  INITIAL_VISIBLE_COUNT,
  LOAD_MORE_COUNT,
  extractActiveTaskId,
  matchesSearch,
  normalizeTasks,
  sortByCreatedAtWithActiveFirst,
} from '../utils/taskSelection';

export const useTaskSelection = (
  onTaskSelected: (taskId: number) => void,
) => {
  const [tasksInWork, setTasksInWork] = useState<Task[]>([]);
  const [unprocessedTasks, setUnprocessedTasks] = useState<Task[]>([]);
  const [historyTasks, setHistoryTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TaskTab>('active');
  const [searchText, setSearchText] = useState('');
  const [visibleActiveCount, setVisibleActiveCount] = useState(
    INITIAL_VISIBLE_COUNT,
  );
  const [visibleUnprocessedCount, setVisibleUnprocessedCount] = useState(
    INITIAL_VISIBLE_COUNT,
  );
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(
    INITIAL_VISIBLE_COUNT,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startingTaskKey, setStartingTaskKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    setError('');

    try {
      const activeTaskPromise = ApiService.getActiveTask().catch(
        activeTaskError => {
          console.warn(
            'Не удалось определить активное задание:',
            activeTaskError,
          );
          return null;
        },
      );

      const [
        inWorkResponse,
        unprocessedResponse,
        historyResponse,
        activeTaskResponse,
      ] = await Promise.all([
        ApiService.getTaskInWorkForTsd(),
        ApiService.getTaskUnprocessedForTsd(),
        ApiService.getHistoryTasks(),
        activeTaskPromise,
      ]);

      const loadedHistoryTasks = normalizeTasks(historyResponse);
      const loadedActiveTaskId = extractActiveTaskId(activeTaskResponse);

      setTasksInWork(normalizeTasks(inWorkResponse));
      setUnprocessedTasks(normalizeTasks(unprocessedResponse));
      setHistoryTasks(loadedHistoryTasks);
      setActiveTaskId(loadedActiveTaskId);

      // После перезапуска приложения, если на этом ТСД открыта история,
      // сразу показываем вкладку истории вместо обычного списка заданий.
      setActiveTab(
        loadedActiveTaskId !== null &&
          loadedHistoryTasks.some(task => task.id === loadedActiveTaskId)
          ? 'history'
          : 'active',
      );
    } catch (loadError) {
      console.error('Ошибка загрузки заданий:', loadError);
      setError('Не удалось загрузить задания');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    setVisibleActiveCount(INITIAL_VISIBLE_COUNT);
    setVisibleUnprocessedCount(INITIAL_VISIBLE_COUNT);
    setVisibleHistoryCount(INITIAL_VISIBLE_COUNT);
  }, [searchText, activeTab]);

  const filteredTasksInWork = useMemo(
    () =>
      sortByCreatedAtWithActiveFirst(
        tasksInWork.filter(task => matchesSearch(task, searchText)),
        activeTaskId,
      ),
    [tasksInWork, searchText, activeTaskId],
  );

  const filteredUnprocessedTasks = useMemo(
    () =>
      sortByCreatedAtWithActiveFirst(
        unprocessedTasks.filter(task => matchesSearch(task, searchText)),
        activeTaskId,
      ),
    [unprocessedTasks, searchText, activeTaskId],
  );

  // Сортировка по createdAt (новые сверху), активное задание — всегда первым.
  const filteredHistoryTasks = useMemo(
    () =>
      sortByCreatedAtWithActiveFirst(
        historyTasks.filter(task => matchesSearch(task, searchText)),
        activeTaskId,
      ),
    [historyTasks, searchText, activeTaskId],
  );

  const startTask = async (taskId: number) => {
    try {
      setStartingTaskKey(`task-${taskId}`);
      setError('');
      if (taskId !== activeTaskId) await ApiService.startTask(taskId);
      onTaskSelected(taskId);
    } catch (startError) {
      console.error('Ошибка запуска задания:', startError);
      setError('Не удалось начать задание');
    } finally {
      setStartingTaskKey(null);
    }
  };

  const startHistoryTask = async (taskId: number) => {
    try {
      setStartingTaskKey(`history-${taskId}`);
      setError('');
      if (taskId !== activeTaskId) await ApiService.startHistoryTask(taskId);
      onTaskSelected(taskId);
    } catch (startError) {
      console.error('Ошибка открытия исторического задания:', startError);
      setError('Не удалось открыть историческое задание');
    } finally {
      setStartingTaskKey(null);
    }
  };

  const handleTaskPress = (task: Task, mode: TaskCardMode) => {
    if (mode === 'history') {
      void startHistoryTask(task.id);
      return;
    }

    void startTask(task.id);
  };

  return {
    activeCount: tasksInWork.length + unprocessedTasks.length,
    activeTab,
    activeTaskId,
    error,
    filteredHistoryTasks,
    filteredTasksInWork,
    filteredUnprocessedTasks,
    handleTaskPress,
    historyCount: historyTasks.length,
    isLoading,
    isRefreshing,
    loadTasks,
    searchText,
    setActiveTab,
    setSearchText,
    showMoreActive: () =>
      setVisibleActiveCount(count => count + LOAD_MORE_COUNT),
    showMoreHistory: () =>
      setVisibleHistoryCount(count => count + LOAD_MORE_COUNT),
    showMoreUnprocessed: () =>
      setVisibleUnprocessedCount(count => count + LOAD_MORE_COUNT),
    startingTaskKey,
    visibleActiveCount,
    visibleHistoryCount,
    visibleUnprocessedCount,
  };
};

export type TaskSelectionModel = ReturnType<typeof useTaskSelection>;
