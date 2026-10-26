import React from 'react';
import { Text, View } from 'react-native';

import { getExpectedScanLabel } from '../../utils/expectedScan';
import type { ExpectedScanType } from '../../types/aggregation';
import { styles } from './styles';

interface ExpectedScanCardProps {
  expectedScan: ExpectedScanType | null;
}

export const ExpectedScanCard: React.FC<ExpectedScanCardProps> = ({
  expectedScan,
}) => (
  <View style={styles.expectedScanContainer}>
    <Text style={styles.expectedScanTitle}>Следующее сканирование</Text>

    <Text style={styles.expectedScanValue}>
      {getExpectedScanLabel(expectedScan)}
    </Text>
  </View>
);
