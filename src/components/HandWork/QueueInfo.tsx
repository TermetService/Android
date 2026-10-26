import React from 'react';
import { Text, View } from 'react-native';

import { styles } from './styles';

interface QueueInfoProps {
  queueLength: number;
  isSubmitting: boolean;
}

export const QueueInfo: React.FC<QueueInfoProps> = ({
  queueLength,
  isSubmitting,
}) => (
  <View style={styles.infoContainer}>
    <Text
      style={[
        styles.modalOperatorTitle,
        {
          color: '#FF9800',
        },
      ]}
    >
      📦 Запросов в очереди: {queueLength}
      {isSubmitting ? ' · обработка' : ''}
    </Text>
  </View>
);
