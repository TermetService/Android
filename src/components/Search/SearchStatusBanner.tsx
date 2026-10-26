import React from 'react';
import { Text, View } from 'react-native';

import { styles } from './styles';
import type { SearchStatusType } from '../../utils/search';

interface SearchStatusBannerProps {
  message: string;
  statusType: SearchStatusType;
}

export const SearchStatusBanner: React.FC<SearchStatusBannerProps> = ({
  message,
  statusType,
}) => (
  <View
    style={[
      styles.resultContainer,
      statusType === 'success' && styles.resultSuccess,
      statusType === 'error' && styles.resultError,
      statusType === 'info' && styles.resultInfo,
    ]}
  >
    <Text style={styles.resultMessage}>{message}</Text>
  </View>
);
