import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';
import type { Task, TaskCardMode } from '../../types/task';

interface TaskCardProps {
  task: Task;
  mode: TaskCardMode;
  isCurrent: boolean;
  isStarting: boolean;
  disabled: boolean;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  mode,
  isCurrent,
  isStarting,
  disabled,
  onPress,
}) => {
  const isHistory = mode === 'history';

  let buttonLabel = isCurrent ? 'Продолжить' : 'Начать';
  let buttonStyle = isCurrent
    ? styles.taskSelectionContinueButton
    : styles.taskSelectionStartButton;

  if (mode === 'continue') {
    buttonLabel = 'Продолжить';
    buttonStyle = styles.taskSelectionContinueButton;
  }

  if (isHistory) {
    buttonLabel = 'Продолжить';
    buttonStyle = styles.taskSelectionHistoryButton;
  }

  return (
    <View
      style={[
        styles.taskSelectionTaskCard,
        isCurrent && styles.taskSelectionCurrentTaskCard,
        isHistory && styles.taskSelectionHistoryCard,
      ]}
    >
      {isCurrent && (
        <Text style={styles.taskSelectionCurrentTaskBadge}>
          ТЕКУЩЕЕ ЗАДАНИЕ НА ЭТОМ ТСД
        </Text>
      )}

      <Text style={styles.taskSelectionTaskTitle}>
        {task.name || `Задание #${task.id}`}
      </Text>
      {task.gtin ? (
        <Text style={styles.taskSelectionTaskInfo}>GTIN: {task.gtin}</Text>
      ) : null}
      {task.batch ? (
        <Text style={styles.taskSelectionTaskInfo}>Партия: {task.batch}</Text>
      ) : null}
      {task.description ? (
        <Text style={styles.taskSelectionTaskDescription} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <TouchableOpacity
        style={buttonStyle}
        disabled={disabled}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {isStarting ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.taskSelectionButtonText}>{buttonLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
