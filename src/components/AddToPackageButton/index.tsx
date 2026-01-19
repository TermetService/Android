import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { AddToPackageButtonProps } from './types';
import { styles } from './styles';

export const AddToPackageButton: React.FC<AddToPackageButtonProps> = ({
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
      <Text style={styles.icon}>📦</Text>
      <Text style={styles.text}>Добавить в текущую упаковку</Text>
    </TouchableOpacity>
  );
};