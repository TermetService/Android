import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';

interface TaskSelectionErrorProps {
  message: string;
  onRetry: () => void;
}

export const TaskSelectionError: React.FC<TaskSelectionErrorProps> = ({
  message,
  onRetry,
}) => (
  <View style={styles.taskSelectionError}>
    <Text style={styles.taskSelectionErrorText}>{message}</Text>
    <TouchableOpacity style={styles.taskSelectionRetryButton} onPress={onRetry}>
      <Text style={styles.taskSelectionRetryText}>Повторить</Text>
    </TouchableOpacity>
  </View>
);
