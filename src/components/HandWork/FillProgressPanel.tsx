import React from 'react';
import { Text, View } from 'react-native';

import type { AggregationResponse } from '../../services/api';
import { styles } from './styles';
import type { FillProgress } from '../../types/handWork';

interface FillProgressItemProps {
  label: string;
  progress: AggregationResponse['smallBox'];
}

const FillProgressItem: React.FC<FillProgressItemProps> = ({
  label,
  progress,
}) => {
  if (progress === null) {
    return null;
  }

  const fillPercent =
    progress.limit > 0
      ? Math.min(100, Math.max(0, (progress.current / progress.limit) * 100))
      : 0;

  const fillColor =
    progress.current > progress.limit
      ? '#DC2626'
      : fillPercent >= 100
      ? '#16A34A'
      : '#007AFF';

  return (
    <View style={styles.fillProgressContainer}>
      <View style={styles.fillProgressHeader}>
        <Text style={styles.fillProgressLabel}>{label}</Text>

        <Text
          style={[
            styles.fillProgressValue,
            {
              color: fillColor,
            },
          ]}
        >
          {progress.current} / {progress.limit}
        </Text>
      </View>

      <View style={styles.fillProgressTrack}>
        <View
          style={[
            styles.fillProgressBar,
            {
              width: `${fillPercent}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>

      <Text style={styles.fillProgressPercent}>
        {Math.round(fillPercent)}%
      </Text>
    </View>
  );
};

interface FillProgressPanelProps {
  progress: FillProgress;
}

export const FillProgressPanel: React.FC<FillProgressPanelProps> = ({
  progress,
}) => {
  const hasProgress =
    progress.smallBox !== null ||
    progress.bigBox !== null ||
    progress.pallet !== null;

  if (!hasProgress) {
    return null;
  }

  return (
    <View style={{ marginTop: 4 }}>
      <FillProgressItem
        label="Заполнение малой коробки"
        progress={progress.smallBox}
      />
      <FillProgressItem
        label="Заполнение большой коробки"
        progress={progress.bigBox}
      />
      <FillProgressItem label="Заполнение палеты" progress={progress.pallet} />
    </View>
  );
};
