import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { buttonStyles } from './buttonStyles';

interface ContinueButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ContinueButton = ({
  onPress,
  disabled = false,
  loading = false,
}: ContinueButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        buttonStyles.continueButton, 
        (disabled || loading) && buttonStyles.continueButtonDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={buttonStyles.continueButtonText}>Продолжить</Text>
      )}
    </TouchableOpacity>
  );
};