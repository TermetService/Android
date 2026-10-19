import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ApiService } from '../../services/api';
import { styles } from './styles';

interface Task {
  id: number;
  gtin?: string | null;
  name?: string | null;
  description?: string | null;
  batch?: string | null;
  isActive?: boolean;
  isHistory?: boolean;
  createdAt?: string | null;
}

interface TaskSelectionScreenProps {
  onTaskSelected: (taskId: number) => void;
}

type Tab = 'active' | 'history';
const INITIAL_VISIBLE_COUNT = 20;
const LOAD_MORE_COUNT = 20;

const normalizeTasks = (response: unknown): Task[] => {
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

const extractActiveTaskId = (value: unknown): number | null => {
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

const matchesSearch = (task: Task, query: string): boolean => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  return [task.id, task.name, task.gtin, task.description, task.batch].some((value) =>
    String(value ?? '').toLocaleLowerCase().includes(normalizedQuery),
  );
};

export const TaskSelectionScreen: React.FC<TaskSelectionScreenProps> = ({
                                                                          onTaskSelected,
                                                                        }) => {
  const [tasksInWork, setTasksInWork] = useState<Task[]>([]);
  const [unprocessedTasks, setUnprocessedTasks] = useState<Task[]>([]);
  const [historyTasks, setHistoryTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [searchText, setSearchText] = useState('');
  const [visibleActiveCount, setVisibleActiveCount] = useState(INITIAL_VISIBLE_COUNT);
  const [visibleUnprocessedCount, setVisibleUnprocessedCount] = useState(INITIAL_VISIBLE_COUNT);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startingTaskKey, setStartingTaskKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    setError('');

    try {
      const activeTaskPromise = ApiService.getActiveTask().catch((activeTaskError) => {
        console.warn('Не удалось определить активное задание:', activeTaskError);
        return null;
      });

      const [inWorkResponse, unprocessedResponse, historyResponse, activeTaskResponse] =
        await Promise.all([
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
        loadedHistoryTasks.some((task) => task.id === loadedActiveTaskId)
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
    () => tasksInWork.filter((task) => matchesSearch(task, searchText)),
    [tasksInWork, searchText],
  );

  const filteredUnprocessedTasks = useMemo(
    () => unprocessedTasks.filter((task) => matchesSearch(task, searchText)),
    [unprocessedTasks, searchText],
  );

  // Новые исторические задания показываются первыми, когда у них есть ID.
  const filteredHistoryTasks = useMemo(
    () => historyTasks
      .filter((task) => matchesSearch(task, searchText))
      .sort((a, b) => b.id - a.id),
    [historyTasks, searchText],
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

  const renderTaskInfo = (task: Task, isHistory = false) => (
    <>
      {task.id === activeTaskId && (
        <Text style={styles.taskSelectionCurrentTaskBadge}>
          {isHistory ? 'ОТКРЫТАЯ ИСТОРИЯ НА ЭТОМ ТСД' : 'ТЕКУЩЕЕ ЗАДАНИЕ НА ЭТОМ ТСД'}
        </Text>
      )}

      <Text style={styles.taskSelectionTaskTitle}>
        {task.name || `Задание #${task.id}`}
      </Text>
      <Text style={styles.taskSelectionTaskInfo}>ID: {task.id}</Text>
      {task.gtin ? <Text style={styles.taskSelectionTaskInfo}>GTIN: {task.gtin}</Text> : null}
      {task.batch ? <Text style={styles.taskSelectionTaskInfo}>Партия: {task.batch}</Text> : null}
      {task.description ? (
        <Text style={styles.taskSelectionTaskDescription} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}
    </>
  );

  const renderTaskCard = (task: Task, mode: 'continue' | 'start' | 'history') => {
    const isHistory = mode === 'history';
    const isCurrentTask = task.id === activeTaskId;
    const key = isHistory ? `history-${task.id}` : `task-${task.id}`;
    const isStarting = startingTaskKey === key;

    let buttonLabel = isCurrentTask ? 'Продолжить' : 'Начать';
    let buttonStyle = isCurrentTask
      ? styles.taskSelectionContinueButton
      : styles.taskSelectionStartButton;
    let onPress = () => void startTask(task.id);

    if (mode === 'continue') {
      buttonLabel = 'Продолжить';
      buttonStyle = styles.taskSelectionContinueButton;
    }

    if (isHistory) {
      buttonLabel = isCurrentTask ? 'Продолжить историю' : 'Открыть историю';
      buttonStyle = styles.taskSelectionHistoryButton;
      onPress = () => void startHistoryTask(task.id);
    }

    return (
      <View
        key={task.id}
        style={[
          styles.taskSelectionTaskCard,
          isCurrentTask && styles.taskSelectionCurrentTaskCard,
          isHistory && styles.taskSelectionHistoryCard,
        ]}
      >
        {renderTaskInfo(task, isHistory)}
        <TouchableOpacity
          style={buttonStyle}
          disabled={startingTaskKey !== null}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {isStarting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.taskSelectionButtonText}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.taskSelectionLoading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.taskSelectionLoadingText}>Загрузка заданий...</Text>
        </View>
      </View>
    );
  }

  const activeCount = tasksInWork.length + unprocessedTasks.length;

  return (
    <View style={styles.container}>
      <View style={styles.taskSelectionSearchContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Поиск по ID, названию, GTIN или партии"
          placeholderTextColor="#888"
          style={styles.taskSelectionSearchInput}
          clearButtonMode="while-editing"
          returnKeyType="search"
          autoCorrect={false}
        />

        <View style={styles.taskSelectionTabs}>
          <TouchableOpacity
            style={[
              styles.taskSelectionTab,
              activeTab === 'active' && styles.taskSelectionTabActive,
            ]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.taskSelectionTabText,
                activeTab === 'active' && styles.taskSelectionTabTextActive,
              ]}
            >
              Активные ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.taskSelectionTab,
              activeTab === 'history' && styles.taskSelectionTabActive,
            ]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.taskSelectionTabText,
                activeTab === 'history' && styles.taskSelectionTabTextActive,
              ]}
            >
              История ({historyTasks.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.taskSelectionContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadTasks(true)}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {error !== '' && (
          <View style={styles.taskSelectionError}>
            <Text style={styles.taskSelectionErrorText}>{error}</Text>
            <TouchableOpacity
              style={styles.taskSelectionRetryButton}
              onPress={() => void loadTasks(true)}
            >
              <Text style={styles.taskSelectionRetryText}>Повторить</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'active' ? (
          <>
            <View style={styles.taskSelectionSection}>
              <Text style={styles.taskSelectionSectionTitle}>В работе</Text>
              {filteredTasksInWork.length === 0 ? (
                <View style={styles.taskSelectionEmpty}>
                  <Text style={styles.taskSelectionEmptyText}>
                    {searchText.trim() ? 'Задания не найдены' : 'Нет заданий в работе'}
                  </Text>
                </View>
              ) : (
                filteredTasksInWork.slice(0, visibleActiveCount).map((task) =>
                  renderTaskCard(task, 'continue'),
                )
              )}
              {filteredTasksInWork.length > visibleActiveCount && (
                <TouchableOpacity
                  style={styles.taskSelectionMoreButton}
                  onPress={() => setVisibleActiveCount((count) => count + LOAD_MORE_COUNT)}
                >
                  <Text style={styles.taskSelectionMoreText}>
                    Показать ещё ({filteredTasksInWork.length - visibleActiveCount})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.taskSelectionSection}>
              <Text style={styles.taskSelectionSectionTitle}>Доступные задания</Text>
              {filteredUnprocessedTasks.length === 0 ? (
                <View style={styles.taskSelectionEmpty}>
                  <Text style={styles.taskSelectionEmptyText}>
                    {searchText.trim() ? 'Задания не найдены' : 'Нет доступных заданий'}
                  </Text>
                </View>
              ) : (
                filteredUnprocessedTasks.slice(0, visibleUnprocessedCount).map((task) =>
                  renderTaskCard(task, 'start'),
                )
              )}
              {filteredUnprocessedTasks.length > visibleUnprocessedCount && (
                <TouchableOpacity
                  style={styles.taskSelectionMoreButton}
                  onPress={() =>
                    setVisibleUnprocessedCount((count) => count + LOAD_MORE_COUNT)
                  }
                >
                  <Text style={styles.taskSelectionMoreText}>
                    Показать ещё ({filteredUnprocessedTasks.length - visibleUnprocessedCount})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <View style={styles.taskSelectionSection}>
            <Text style={styles.taskSelectionSectionTitle}>История заданий</Text>
            <Text style={styles.taskSelectionSectionHint}>
              Историческое задание, открытое на этом ТСД, отмечено зелёным.
            </Text>

            {filteredHistoryTasks.length === 0 ? (
              <View style={styles.taskSelectionEmpty}>
                <Text style={styles.taskSelectionEmptyText}>
                  {searchText.trim()
                    ? 'По заданным условиям история не найдена'
                    : 'Исторических заданий нет'}
                </Text>
              </View>
            ) : (
              filteredHistoryTasks.slice(0, visibleHistoryCount).map((task) =>
                renderTaskCard(task, 'history'),
              )
            )}

            {filteredHistoryTasks.length > visibleHistoryCount && (
              <TouchableOpacity
                style={styles.taskSelectionMoreButton}
                onPress={() => setVisibleHistoryCount((count) => count + LOAD_MORE_COUNT)}
              >
                <Text style={styles.taskSelectionMoreText}>
                  Показать ещё ({filteredHistoryTasks.length - visibleHistoryCount})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
