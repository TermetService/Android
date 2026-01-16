import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SearchResultDisplayProps } from './types';
import { styles } from './styles';

export const SearchResultDisplay: React.FC<SearchResultDisplayProps> = ({
  result,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={[styles.text, styles.loadingText, { marginTop: 8 }]}>
            Идет поиск...
          </Text>
        </View>
      </View>
    );
  }

  if (!result) {
    return null;
  }

  if (!result.success) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.row}>
            <Text style={styles.icon}>❌</Text>
            <Text style={[styles.text, styles.errorText]}>Код не найден</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.successContainer}>
        <View style={styles.row}>
          <Text style={styles.icon}>✅</Text>
          <Text style={[styles.text, styles.successText]}>
            Найдено в: коробка №{result.boxNumber}
          </Text>
        </View>
        
        {result.type && (
          <View style={[styles.row, styles.typeRow]}>
            <Text style={styles.icon}>🎯</Text>
            <Text style={styles.typeText}>Тип: {result.type}</Text>
          </View>
        )}
      </View>
    </View>
  );
};