import React from 'react';
import { Text, View } from 'react-native';

import { getExpectedScanLabel } from '../../utils/expectedScan';
import type { ExpectedScanType } from '../../types/aggregation';
import { styles } from './styles';

interface ExpectedScanCardProps {
  expectedScan: ExpectedScanType | null;
}

const getScanColor = (expectedScan: ExpectedScanType | null): string => {
  if (expectedScan === 'PRODUCT') {
    return '#2563EB';
  }

  return '#D97706';
};

export const ExpectedScanCard: React.FC<ExpectedScanCardProps> = ({
  expectedScan,
}) => {
  const scanColor = getScanColor(expectedScan);

  return (
    <View
      style={[styles.expectedScanContainer, { borderLeftColor: scanColor }]}
    >
      <Text style={[styles.expectedScanValue, { color: scanColor }]}>
        {getExpectedScanLabel(expectedScan)}
      </Text>
    </View>
  );
};
