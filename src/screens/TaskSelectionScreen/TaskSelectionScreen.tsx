import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

export const TaskSelectionScreen: React.FC<
  TaskSelectionScreenProps
> = ({ onTaskSelected }) => {
  const [tasksInWork, setTasksInWork] =
    useState<Task[]>([]);

  const [unprocessedTasks, setUnprocessedTasks] =
    useState<Task[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [startingTaskId, setStartingTaskId] =
    useState<number | null>(null);

  const [error, setError] =
    useState('');

  useEffect(() => {
    void loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [
        inWorkResponse,
        unprocessedResponse,
      ] = await Promise.all([
        ApiService.getTaskInWorkForTsd(),
        ApiService.getTaskUnprocessedForTsd(),
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
    } catch (error) {
      console.error(
        'Ошибка загрузки заданий:',
        error,
      );

      setError(
        'Не удалось загрузить задания',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openTask = (taskId: number) => {
    onTaskSelected(taskId);
  };

  const startTask = async (
    taskId: number,
  ) => {
    try {
      setStartingTaskId(taskId);
      setError('');

      await ApiService.startTask(taskId);

      openTask(taskId);
    } catch (error) {
      console.error(
        'Ошибка запуска задания:',
        error,
      );

      setError(
        'Не удалось начать задание',
      );
    } finally {
      setStartingTaskId(null);
    }
  };

  const renderTaskInfo = (
    task: Task,
  ) => {
    return (
      <>
        <Text
          style={
            styles.taskSelectionTaskTitle
          }
        >
          {task.name ||
            `Задание #${task.id}`}
        </Text>

        <Text
          style={
            styles.taskSelectionTaskInfo
          }
        >
          ID: {task.id}
        </Text>

        {task.gtin && (
          <Text
            style={
              styles.taskSelectionTaskInfo
            }
          >
            GTIN: {task.gtin}
          </Text>
        )}

        {task.batch && (
          <Text
            style={
              styles.taskSelectionTaskInfo
            }
          >
            Партия: {task.batch}
          </Text>
        )}

        {task.description && (
          <Text
            style={
              styles.taskSelectionTaskDescription
            }
          >
            {task.description}
          </Text>
        )}
      </>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>
            Выбор задания
          </Text>
        </View>

        <View
          style={
            styles.taskSelectionLoading
          }
        >
          <ActivityIndicator
            size="large"
          />

          <Text
            style={
              styles.taskSelectionLoadingText
            }
          >
            Загрузка заданий...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>
          Выбор задания
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.taskSelectionContent
        }
        keyboardShouldPersistTaps="handled"
      >
        {error !== '' && (
          <View
            style={
              styles.taskSelectionError
            }
          >
            <Text
              style={
                styles.taskSelectionErrorText
              }
            >
              {error}
            </Text>
          </View>
        )}

        {tasksInWork.length > 0 && (
          <View
            style={
              styles.taskSelectionSection
            }
          >
            <Text
              style={
                styles.taskSelectionSectionTitle
              }
            >
              Задания в работе
            </Text>

            {tasksInWork.map((task) => (
              <View
                key={task.id}
                style={
                  styles.taskSelectionTaskCard
                }
              >
                {renderTaskInfo(task)}

                <TouchableOpacity
                  style={
                    styles.taskSelectionContinueButton
                  }
                  onPress={() =>
                    openTask(task.id)
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      styles.taskSelectionButtonText
                    }
                  >
                    Продолжить
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View
          style={
            styles.taskSelectionSection
          }
        >
          <Text
            style={
              styles.taskSelectionSectionTitle
            }
          >
            Доступные задания
          </Text>

          {unprocessedTasks.length ===
          0 ? (
            <View
              style={
                styles.taskSelectionEmpty
              }
            >
              <Text
                style={
                  styles.taskSelectionEmptyText
                }
              >
                Нет доступных заданий
              </Text>
            </View>
          ) : (
            unprocessedTasks.map(
              (task) => {
                const isStarting =
                  startingTaskId ===
                  task.id;

                return (
                  <View
                    key={task.id}
                    style={
                      styles.taskSelectionTaskCard
                    }
                  >
                    {renderTaskInfo(task)}

                    <TouchableOpacity
                      style={
                        styles.taskSelectionStartButton
                      }
                      disabled={
                        isStarting
                      }
                      onPress={() =>
                        startTask(
                          task.id,
                        )
                      }
                      activeOpacity={0.7}
                    >
                      {isStarting ? (
                        <ActivityIndicator
                          color="#ffffff"
                        />
                      ) : (
                        <Text
                          style={
                            styles.taskSelectionButtonText
                          }
                        >
                          Начать
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              },
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};