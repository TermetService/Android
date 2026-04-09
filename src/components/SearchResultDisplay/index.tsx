import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SearchResultDisplayProps } from './types';
import { styles } from './styles';

// SearchResultDisplay.tsx
export const SearchResultDisplay: React.FC<SearchResultDisplayProps> = ({
  result,
  loading = false,
}) => {
  // ДОБАВИТЬ отладочный вывод
  console.log('🔍 SearchResultDisplay получил:', {
    result,
    loading,
    success: result?.success,
    boxNumber: result?.boxNumber,
    boxLabel: result?.boxLabel
  });

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

  // ДОБАВИТЬ проверку
  console.log('✅ result.success =', result.success);

  if (result.success) {
    // Если from: 'box' показываем специальное сообщение
    if (result.from === 'box') {
      return (
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <View style={styles.row}>
              <Text style={styles.icon}>📦</Text>
              <Text style={[styles.text, styles.successText]}>
                Найдена упаковка №{result.boxNumber} {result.boxLabel || "без этикетки"}
              </Text>
            </View>
            {result.type && (
              <View style={[styles.row, styles.typeRow]}>
                <Text style={styles.typeText}>
                  Этикетка: {result.type}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    // Обычный успех для from: 'code'
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.row}>
            <Text style={styles.icon}>✅</Text>
            <Text style={[styles.text, styles.successText]}>
              Найдено в: упаковка №{result.boxNumber} {result.boxLabel || "без этикетки"}
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
  }

  // Только если success = false
  console.log('❌ result.success = false, показываем ошибку');
  return (
    <View style={styles.container}>
      <View style={{
        backgroundColor: '#FFE5E5',
        borderWidth: 1,
        borderColor: '#FF3B30',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
      }}>
        <View style={styles.row}>
          <Text style={styles.icon}>❌</Text>
          <Text style={[styles.text, {
            fontSize: 16,
            fontWeight: '500',
            color: '#D70015',
          }]}>
            {result.message || 'Код не найден'}
          </Text>
        </View>
      </View>
    </View>
  );
};