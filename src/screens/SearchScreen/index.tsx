import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ApiService } from '../../services/api';
import { Config } from '../../config';
import { AutoSearchInput } from '../../components/AutoSearchInput';
import { LastCodeDisplay } from '../../components/LastCodeDisplay';
import { SearchResultDisplay } from '../../components/SearchResultDisplay';
import { styles } from './styles';
import { globalStyles } from '../../styles/global';

export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSentCode, setLastSentCode] = useState('');
  const [lastTimestamp, setLastTimestamp] = useState<Date>();
  const [searchResult, setSearchResult] = useState<any>(null);

  // Функция для парсинга ответа сервера
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

      // Добавляем type если есть в data.code
      if (data.code.type) {
        result.type = data.code.type;
      }
      // Или если type в корне data
      else if (data.type) {
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
    setLastSentCode(query);
    setLastTimestamp(new Date());
    setSearchResult(null); // Очищаем предыдущий результат

    ApiService.searchCode(query)
      .then(data => {
        const parsedResult = parseServerResponse(data);
        setSearchResult(parsedResult);
      })
      .catch((error: any) => {
        setSearchResult({
          success: false,
          message: 'Код не найден',
        });
      })
      .finally(() => {
        setLoading(false);
        setQuery(''); // Очищаем поле ввода после поиска
      });
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
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Поиск кода</Text>
          <Text style={styles.subtitle}>
            Сервер: {Config.SERVER_URL}
          </Text>
        </View>

        {/* Поле ввода */}
        <AutoSearchInput
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSubmit}
          loading={loading}
          placeholder="Введите код и нажмите Enter"
        />

        {/* Результат поиска */}
        <SearchResultDisplay
          result={searchResult}
          loading={loading}
        />

        {/* Последний введенный код */}
        <LastCodeDisplay
          code={lastSentCode}
          timestamp={lastTimestamp}
          showPlaceholder={true}
        />

        {/* Статус сервера */}
        <View style={styles.serverStatus}>
          <View style={[styles.statusIndicator, { 
            backgroundColor: loading ? globalStyles.colors.warning : globalStyles.colors.success 
          }]} />
          <Text style={styles.statusText}>
            {loading ? 'Идет поиск...' : 'Готово к поиску'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};