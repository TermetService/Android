import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface CheckTaskButtonProps {
  isValidating: boolean;
  onPress: () => void;
}

export const CheckTaskButton: React.FC<CheckTaskButtonProps> = ({
  isValidating,
  onPress,
}) => (
  <TouchableOpacity
    style={{
      backgroundColor: '#007AFF',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginTop: 10,
    }}
    onPress={onPress}
    disabled={isValidating}
  >
    <Text
      style={{
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
      }}
    >
      {isValidating ? 'Проверка задания...' : 'Проверить задание'}
    </Text>
  </TouchableOpacity>
);
