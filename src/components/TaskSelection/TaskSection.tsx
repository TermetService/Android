import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';
import type { Task, TaskCardMode } from '../../types/task';
import { TaskCard } from './TaskCard';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  mode: TaskCardMode;
  activeTaskId: number | null;
  startingTaskKey: string | null;
  visibleCount: number;
  emptyText: string;
  hint?: string;
  onShowMore: () => void;
  onTaskPress: (task: Task, mode: TaskCardMode) => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  tasks,
  mode,
  activeTaskId,
  startingTaskKey,
  visibleCount,
  emptyText,
  hint,
  onShowMore,
  onTaskPress,
}) => (
  <View style={styles.taskSelectionSection}>
    <Text style={styles.taskSelectionSectionTitle}>{title}</Text>
    {hint ? (
      <Text style={styles.taskSelectionSectionHint}>{hint}</Text>
    ) : null}

    {tasks.length === 0 ? (
      <View style={styles.taskSelectionEmpty}>
        <Text style={styles.taskSelectionEmptyText}>{emptyText}</Text>
      </View>
    ) : (
      tasks
        .slice(0, visibleCount)
        .map(task => {
          const key =
            mode === 'history'
              ? `history-${task.id}`
              : `task-${task.id}`;

          return (
            <TaskCard
              key={task.id}
              task={task}
              mode={mode}
              isCurrent={task.id === activeTaskId}
              isStarting={startingTaskKey === key}
              disabled={startingTaskKey !== null}
              onPress={() => onTaskPress(task, mode)}
            />
          );
        })
    )}

    {tasks.length > visibleCount && (
      <TouchableOpacity
        style={styles.taskSelectionMoreButton}
        onPress={onShowMore}
      >
        <Text style={styles.taskSelectionMoreText}>
          Показать ещё ({tasks.length - visibleCount})
        </Text>
      </TouchableOpacity>
    )}
  </View>
);
