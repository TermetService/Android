import React from 'react';
import { Text, View } from 'react-native';

import type { AggregationResponse } from '../../services/api';
import type { FillProgress } from '../../types/handWork';
import type { ExpectedScanType } from '../../types/aggregation';
import { styles } from './styles';

type ProgressType = AggregationResponse['smallBox'];

interface FillProgressItemProps {
  label: string;
  progress: ProgressType;
  isWaitingForLabel: boolean;
}

const FillProgressItem: React.FC<FillProgressItemProps> = ({
  label,
  progress,
  isWaitingForLabel,
}) => {
  if (progress === null) {
    return null;
  }

  const isOverfilled = progress.current > progress.limit;
  const isFull = progress.current >= progress.limit;

  let status = 'ЗАПОЛНЕНИЕ';
  let statusColor = '#2563EB';
  let statusBackground = '#EFF6FF';

  if (isOverfilled) {
    status = 'ПЕРЕПОЛНЕНИЕ';
    statusColor = '#DC2626';
    statusBackground = '#FEF2F2';
  } else if (isWaitingForLabel) {
    status = 'НУЖНА ЭТИКЕТКА';
    statusColor = '#D97706';
    statusBackground = '#FFF7ED';
  } else if (isFull) {
    status = 'ЗАПОЛНЕНО';
    statusColor = '#16A34A';
    statusBackground = '#F0FDF4';
  }

  return (
    <View style={styles.fillProgressItem}>
      <View style={styles.fillProgressInfo}>
        <Text style={styles.fillProgressLabel}>{label}</Text>

        <Text style={styles.fillProgressValue}>
          {progress.current} / {progress.limit}
        </Text>
      </View>

      <View style={styles.fillProgressStatusRow}>
        <View
          style={[
            styles.fillProgressStatus,
            { backgroundColor: statusBackground },
          ]}
        >
          <View
            style={[
              styles.fillProgressStatusDot,
              { backgroundColor: statusColor },
            ]}
          />

          <Text style={[styles.fillProgressStatusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface FillProgressPanelProps {
  progress: FillProgress;
  expectedScan: ExpectedScanType | null;
}

export const FillProgressPanel: React.FC<FillProgressPanelProps> = ({
  progress,
  expectedScan,
}) => {
  const hasProgress =
    progress.smallBox !== null ||
    progress.bigBox !== null ||
    progress.pallet !== null;

  if (!hasProgress) {
    return null;
  }

  return (
    <View style={styles.fillProgressPanel}>
      <Text style={styles.fillProgressPanelTitle}>СОСТОЯНИЕ УПАКОВКИ</Text>

      <FillProgressItem
        label="Малая коробка"
        progress={progress.smallBox}
        isWaitingForLabel={expectedScan === 'SMALL_BOX_LABEL'}
      />

      <FillProgressItem
        label="Большая коробка"
        progress={progress.bigBox}
        isWaitingForLabel={expectedScan === 'BIG_BOX_LABEL'}
      />

      <FillProgressItem
        label="Палета"
        progress={progress.pallet}
        isWaitingForLabel={expectedScan === 'PALLET_LABEL'}
      />
    </View>
  );
};
