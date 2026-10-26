import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';

interface ActionsHeaderProps {
  disabled: boolean;
  onClose: () => void;
}

export const ActionsHeader: React.FC<ActionsHeaderProps> = ({
  disabled,
  onClose,
}) => (
  <View style={styles.header}>
    <View style={styles.headerText}>
      <Text style={styles.title}>Действия</Text>
    </View>

    <TouchableOpacity
      style={styles.headerCloseButton}
      onPress={onClose}
      disabled={disabled}
    >
      <Text style={styles.headerCloseText}>✕</Text>
    </TouchableOpacity>
  </View>
);
