// src/screens/SearchScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { styles } from './styles';
import { formatSearchResponse, formatNetworkError } from './responseFormatter';
import { ApiService } from '../../services/api';

export const SearchScreen = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // Автофокус при загрузке экрана
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Обработка отправки кода при нажатии Enter
  const handleSubmit = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setIsLoading(true);

    try {
      // Отправляем код на поиск
      const result = await ApiService.searchCode(trimmedCode);

      // Форматируем ответ
      const formatted = formatSearchResponse(result);

      // Показываем результат
      Toast.show({
        type: formatted.type,
        text1: formatted.title,
        text2: formatted.message,
        position: 'bottom',
        visibilityTime: 5000,
        text1Style: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        text2Style: {
          fontSize: 14,
          lineHeight: 18,
        },
      });

    } catch (error) {
      // Ошибка сети
      const formatted = formatNetworkError();

      Toast.show({
        type: formatted.type,
        text1: formatted.title,
        text2: formatted.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
      setCode('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Заголовок экрана */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Поиск</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          {/* Поле ввода по центру */}
          <View style={styles.centerContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.searchInput,
                isLoading && styles.searchInputDisabled
              ]}
              value={code}
              onChangeText={setCode}
              onSubmitEditing={handleSubmit}
              placeholder={isLoading ? "Поиск..." : "Введите код"}
              placeholderTextColor="#999"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={true}
              returnKeyType="done"
              blurOnSubmit={false}
              editable={!isLoading}
            />
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};