import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';
import type { ServerStatus } from '../../types/handWork';

interface ServerStatusBarProps {
  status: ServerStatus;
  serverUrl: string;
}

const getServerStatusIcon = (status: ServerStatus): string => {
  switch (status) {
    case 'online':
      return '🟢';
    case 'offline':
      return '🔴';
    case 'checking':
      return '🟡';
    default:
      return '⚪';
  }
};

export const ServerStatusBar: React.FC<ServerStatusBarProps> = ({
  status,
  serverUrl,
}) => (
  <TouchableOpacity>
    <View style={[styles.modalHeader, { paddingTop: 12 }]}>
    <View style={styles.infoContainer}>
      <View style={styles.serverInfoButton}>
        <Text
          style={[
            styles.serverInfoText,
            status === 'offline' && styles.serverInfoTextOffline,
            status === 'online' && styles.serverInfoTextOnline,
          ]}
        >
          {getServerStatusIcon(status)} Сервер: {serverUrl}
        </Text>
      </View>
    </View>
  </View>
</TouchableOpacity>
);
