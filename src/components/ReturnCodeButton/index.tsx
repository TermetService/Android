// components/ReturnCodeButton/index.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ReturnCodeButtonProps } from './types';
import { styles } from './styles';

export const ReturnCodeButton: React.FC<ReturnCodeButtonProps> = ({
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
            <Text style={styles.icon}>↩️</Text>
            <Text style={styles.text}>Вернуть код</Text>
        </TouchableOpacity>
    );
};