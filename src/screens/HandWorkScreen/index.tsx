// src/screens/SearchScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { styles } from './styles';
import { formatSearchResponse, formatNetworkError } from './responseFormatter';
import { ApiService } from '../../services/api';
import { ActionsModal } from '../../components/ActionsModal';

export const SearchScreen = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formattedResponse, setFormattedResponse] = useState<any>(null);
  const [showActionButton, setShowActionButton] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

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
    setShowActionButton(false);
    setFormattedResponse(null);

    try {
      const result = await ApiService.searchCode(trimmedCode);
      const formatted = formatSearchResponse(result);
      setFormattedResponse(formatted);
      setShowActionButton(formatted.showActionButton || false);

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

  const handleActionButtonPress = () => {
    if (formattedResponse?.searchData) {
      setShowActionsModal(true);
    }
  };

  // Коллбек при успешном удалении коробки
  const handleDeleteSuccess = () => {
    // Скрываем кнопку действия после удаления
    setShowActionButton(false);
    setFormattedResponse(null);

    // Показываем сообщение в Toast
    Toast.show({
      type: 'success',
      text1: '✅ Коробка удалена',
      text2: 'Коробка успешно удалена из системы',
      position: 'bottom',
      visibilityTime: 4000,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Поиск</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

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

          {showActionButton && formattedResponse && (
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleActionButtonPress}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>
                  {formattedResponse.actionButtonText || 'Действия с коробкой'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>

      {formattedResponse?.searchData && (
        <ActionsModal
          visible={showActionsModal}
          onClose={() => setShowActionsModal(false)}
          searchData={formattedResponse.searchData}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </KeyboardAvoidingView>
  );
};