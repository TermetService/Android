import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { AggregationInfo } from '../../types/aggregation';
import { styles } from './styles';
import { extractContainerNumber } from '../../utils/aggregation';
import { scanTypeNames } from '../../utils/search';
import type { ParentKey } from '../../utils/search';

interface InfoRowProps {
  label: string;
  value: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

interface SearchResultCardProps {
  scanResult: AggregationInfo;
  isProduct: boolean;
  availableParents: ReadonlyArray<readonly [ParentKey, string]>;
  onActions: () => void;
  onClear: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  scanResult,
  isProduct,
  availableParents,
  onActions,
  onClear,
}) => (
  <View style={styles.infoCard}>
    <Text style={styles.sectionTitle}>{scanTypeNames[scanResult.scanType]}</Text>

    {!isProduct && (
      <>
        <InfoRow
          label="Номер упаковки"
          value={extractContainerNumber(scanResult.label) ?? 'Не указан'}
        />

        <View style={styles.separator} />

        <InfoRow
          label="Полная этикетка"
          value={scanResult.label ?? 'Не указана'}
        />
      </>
    )}

    {availableParents.length > 0 && (
      <>
        <View style={styles.separator} />

        <Text style={styles.sectionSubtitle}>Расположение</Text>

        {availableParents.map(([key, title]) => {
          const fullLabel = scanResult.parents[key];
          const number = extractContainerNumber(fullLabel);

          return (
            <InfoRow
              key={key}
              label={title}
              value={number !== null ? `№${number}` : 'Не указан'}
            />
          );
        })}
      </>
    )}

    {!isProduct && (
      <>
        <View style={styles.separator} />

        <Text style={styles.sectionSubtitle}>Содержимое</Text>

        <InfoRow
          label="Количество"
          value={
            scanResult.contentsCount == null
              ? 'Неизвестно'
              : String(scanResult.contentsCount)
          }
        />

        <InfoRow
          label="Тип содержимого"
          value={
            scanResult.contentsType
              ? scanTypeNames[scanResult.contentsType]
              : 'Не указан'
          }
        />
      </>
    )}

    <TouchableOpacity
      style={styles.actionButton}
      onPress={onActions}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>Действия</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.clearButton}
      onPress={onClear}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>Очистить</Text>
    </TouchableOpacity>
  </View>
);
