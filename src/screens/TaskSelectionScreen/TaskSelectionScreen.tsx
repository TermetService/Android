import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ApiService } from '../../services/api';
import { styles } from './styles';

interface Task {
  id: number;
  gtin?: string;
  name?: string;
  description?: string;
  batch?: string;
}

interface TaskSelectionScreenProps {
  onTaskSelected: (taskId: number) => void;
}

const parseTaskId = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return null;
  }

  if (typeof value === 'string' && !value.trim()) {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * Поддерживает ответ в виде ID, объекта задания
 * или объекта активной задачи с вложенным task.
 */
const extractActiveTaskId = (value: unknown): number | null => {
  const primitiveId = parseTaskId(value);

  if (primitiveId !== null) {
    return primitiveId;
  }

  if (value === null || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;

  // Сначала проверяем именно ID задания, а не ID записи активной задачи.
  const directId = parseTaskId(record.taskId) ?? parseTaskId(record.task_id);

  if (directId !== null) {
    return directId;
  }

  for (const key of ['task', 'data', 'activeTask', 'active_task']) {
    const nestedId = extractActiveTaskId(record[key]);

    if (nestedId !== null) {
      return nestedId;
    }
  }

  return parseTaskId(record.id);
};

export const TaskSelectionScreen: React.FC<TaskSelectionScreenProps> = ({
  onTaskSelected,
}) => {
  const [tasksInWork, setTasksInWork] = useState<Task[]>([]);
  const [unprocessedTasks, setUnprocessedTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startingTaskId, setStartingTaskId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

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

      const [inWorkResponse, unprocessedResponse, activeTaskResponse] =
        await Promise.all([
          ApiService.getTaskInWorkForTsd(),
          ApiService.getTaskUnprocessedForTsd(),
          activeTaskPromise,
        ]);

      setTasksInWork(
        Array.isArray(inWorkResponse)
          ? inWorkResponse
          : inWorkResponse?.data || [],
      );

      setUnprocessedTasks(
        Array.isArray(unprocessedResponse)
          ? unprocessedResponse
          : unprocessedResponse?.data || [],
      );

      setActiveTaskId(extractActiveTaskId(activeTaskResponse));
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

  const openTask = (taskId: number) => {
    onTaskSelected(taskId);
  };

  const startTask = async (taskId: number) => {
    try {
      setStartingTaskId(taskId);
      setError('');

      await ApiService.startTask(taskId);
      openTask(taskId);
    } catch (startError) {
      console.error('Ошибка запуска задания:', startError);
      setError('Не удалось начать задание');
    } finally {
      setStartingTaskId(null);
    }
  };

  const renderTaskInfo = (task: Task) => (
    <>
      {task.id === activeTaskId && (
        <Text style={styles.taskSelectionCurrentTaskBadge}>ТЕКУЩЕЕ</Text>
      )}

      <Text style={styles.taskSelectionTaskTitle}>
        {task.name || `Задание #${task.id}`}
      </Text>

      {task.gtin && (
        <Text style={styles.taskSelectionTaskInfo}>GTIN: {task.gtin}</Text>
      )}

      {task.batch && (
        <Text style={styles.taskSelectionTaskInfo}>Партия: {task.batch}</Text>
      )}
    </>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.taskSelectionLoading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.taskSelectionLoadingText}>
            Загрузка заданий...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          </View>
        )}

        {tasksInWork.length > 0 && (
          <View style={styles.taskSelectionSection}>
            <Text style={styles.taskSelectionSectionTitle}>
              Задания в работе
            </Text>

            {tasksInWork.map(task => {
              const isStarting = startingTaskId === task.id;
              const isCurrentTask = task.id === activeTaskId;

              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskSelectionTaskCard,
                    isCurrentTask && styles.taskSelectionCurrentTaskCard,
                  ]}
                >
                  {renderTaskInfo(task)}

                  <TouchableOpacity
                    style={styles.taskSelectionContinueButton}
                    disabled={startingTaskId !== null}
                    onPress={() => void startTask(task.id)}
                    activeOpacity={0.7}
                  >
                    {isStarting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.taskSelectionButtonText}>
                        Продолжить
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.taskSelectionSection}>
          <Text style={styles.taskSelectionSectionTitle}>
            Доступные задания
          </Text>

          {unprocessedTasks.length === 0 ? (
            <View style={styles.taskSelectionEmpty}>
              <Text style={styles.taskSelectionEmptyText}>
                Нет доступных заданий
              </Text>
            </View>
          ) : (
            unprocessedTasks.map(task => {
              const isStarting = startingTaskId === task.id;
              const isCurrentTask = task.id === activeTaskId;

              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskSelectionTaskCard,
                    isCurrentTask && styles.taskSelectionCurrentTaskCard,
                  ]}
                >
                  {renderTaskInfo(task)}

                  <TouchableOpacity
                    style={styles.taskSelectionStartButton}
                    disabled={startingTaskId !== null}
                    onPress={() => void startTask(task.id)}
                    activeOpacity={0.7}
                  >
                    {isStarting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.taskSelectionButtonText}>
                        {isCurrentTask ? 'Продолжить' : 'Начать'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};
