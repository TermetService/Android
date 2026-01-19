import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ApiService } from '../../services/api';
import { Config } from '../../config';
import { AutoSearchInput } from '../../components/AutoSearchInput';
import { SearchResultDisplay } from '../../components/SearchResultDisplay';
import { AddToPackageButton } from '../../components/AddToPackageButton';
import { CodeActionsButton } from '../../components/CodeActionsButton';
import { CodeActionsModal } from '../../components/CodeActionsModal';
import { styles } from './styles';
import { globalStyles } from '../../styles/global';

export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [foundCodeData, setFoundCodeData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  
  // Используем number вместо NodeJS.Timeout для React Native
  const timerRef = useRef<number | null>(null);
  const lastSearchTimeRef = useRef<number>(0);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Запуск 60-секундного таймера для кнопки добавления
  const startTimer = () => {
    setShowAddButton(true);
    setTimerActive(true);
    
    // Очищаем предыдущий таймер
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Запускаем новый таймер на 60 секунд
    timerRef.current = setTimeout(() => {
      setShowAddButton(false);
      setTimerActive(false);
      timerRef.current = null;
    }, 60000) as unknown as number; // Приведение типа для RN
  };

  // Остановка таймера
  const stopTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowAddButton(false);
    setTimerActive(false);
  };

  // Сброс состояния при начале нового ввода
  const handleQueryChange = (text: string) => {
    setQuery(text);
    
    // Если поле не пустое, сбрасываем всё
    if (text.length > 0) {
      stopTimer();
      setSearchResult(null);
      setFoundCodeData(null);
      setShowAddButton(false);
    }
  };

  const parseServerResponse = (data: any) => {
    if (data.message && data.message.includes('Ошибка')) {
      return {
        success: false,
        message: 'Код не найден',
      };
    }

    if (data.code) {
      const result: any = {
        success: true,
        boxNumber: data.code.box_number || 'не указан',
      };

      // Сохраняем полные данные кода для использования в кнопках
      // Важно: сохраняем весь объект data, а не только data.code
      setFoundCodeData(data);

      // Добавляем type из data.code или из корня data
      if (data.code.type) {
        result.type = data.code.type;
      } else if (data.type) {
        result.type = data.type;
      }

      return result;
    }

    return {
      success: false,
      message: 'Код не найден',
    };
  };

  const handleSubmit = () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setSearchResult(null);
    setFoundCodeData(null);
    stopTimer(); // Останавливаем предыдущий таймер
    
    // Запоминаем время поиска
    lastSearchTimeRef.current = Date.now();

    ApiService.searchCode(query)
      .then(data => {
        console.log('Ответ сервера:', data); // Для отладки
        const parsedResult = parseServerResponse(data);
        setSearchResult(parsedResult);
        
        // Запускаем таймер только если код не найден
        if (!parsedResult.success) {
          startTimer();
        }
      })
      .catch((error: any) => {
        console.error('Ошибка поиска:', error);
        setSearchResult({
          success: false,
          message: 'Код не найден',
        });
        startTimer(); // Запускаем таймер при ошибке
      })
      .finally(() => {
        setLoading(false);
        setQuery('');
      });
  };

  const handleAddToPackage = () => {
    stopTimer(); // Останавливаем таймер при нажатии
    Alert.alert('Добавление', 'Код будет добавлен в текущую упаковку');
    // Здесь будет логика добавления в упаковку
  };

  const handleActionPress = (action: 'delete' | 'add' | 'label') => {
    const actions = {
      delete: 'Удалить код',
      add: 'Добавить в эту упаковку',
      label: 'Привязать этикетку',
    };
    Alert.alert('Действие', `Выбрано: ${actions[action]}`);
    // Здесь будет логика для каждого действия
  };

  // Проверка, является ли найденный код типом "код"
  // Проверяем несколько возможных полей где может быть type
  const isCodeType = () => {
    if (!foundCodeData) return false;
    
    // Вариант 1: type в code
    if (foundCodeData.code && foundCodeData.code.type) {
      return foundCodeData.code.type.toLowerCase().includes('код') || 
             foundCodeData.code.type === 'code';
    }
    
    // Вариант 2: type в корне
    if (foundCodeData.type) {
      return foundCodeData.type.toLowerCase().includes('код') || 
             foundCodeData.type === 'code';
    }
    
    // Вариант 3: проверяем по структуре
    if (foundCodeData.code && foundCodeData.code.code) {
      return true; // Если есть поле code в code, вероятно это код
    }
    
    return false;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Поиск кода</Text>
          <Text style={styles.subtitle}>
            Сервер: {Config.SERVER_URL}
          </Text>
        </View>

        <AutoSearchInput
          value={query}
          onChangeText={handleQueryChange}
          onSubmit={handleSubmit}
          loading={loading}
          placeholder="Введите код и нажмите Enter"
        />

        <SearchResultDisplay
          result={searchResult}
          loading={loading}
        />

        {/* Кнопка для НЕ найденного кода (показываем только если таймер активен) */}
        {showAddButton && searchResult && !searchResult.success && !loading && (
          <AddToPackageButton
            onPress={handleAddToPackage}
            disabled={loading}
          />
        )}

        {/* Кнопка для найденного кода типа "код" */}
        {/* Изменено условие: проверяем через функцию isCodeType() */}
        {searchResult?.success && isCodeType() && !loading && (
          <>
            <CodeActionsButton
              onPress={() => setModalVisible(true)}
              disabled={loading}
            />
            <CodeActionsModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onActionPress={handleActionPress}
            />
          </>
        )}

        <View style={styles.serverStatus}>
          <View style={[styles.statusIndicator, { 
            backgroundColor: loading ? globalStyles.colors.warning : 
                          timerActive ? globalStyles.colors.warning : 
                          globalStyles.colors.success 
          }]} />
          <Text style={styles.statusText}>
            {loading ? 'Идет поиск...' : 
             timerActive ? 'Таймер активен (60 сек)' : 
             'Готово к поиску'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};