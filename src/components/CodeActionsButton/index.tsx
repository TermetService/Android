import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { CodeActionsButtonProps } from './types';
import { styles } from './styles';

export const CodeActionsButton: React.FC<CodeActionsButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>⚙️</Text>
      <Text style={styles.text}>Действия</Text>
    </TouchableOpacity>
  );
};