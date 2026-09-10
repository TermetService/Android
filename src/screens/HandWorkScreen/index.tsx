// src/screens/HandWorkScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { styles } from './styles';
import { ManualWorkModal } from './Modal/ManualWorkModal';
import { ManualWorkModalOld } from './Modal/ManualWorkModalOld';
import { ApiService } from '../../services/api.ts';


export const HandWorkScreen = () => {
  const [showManualModal, setShowManualModal] = useState(false);
  const [isUsingApi, setIsUsingApi] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setIsLoading(true);
    try {
      const status = await ApiService.getApiStatus();
      console.log('API Status:', status);

      setIsUsingApi(status.isUsingApi);
      setShowManualModal(true);
    } catch (error) {
      console.error('Ошибка при проверке статуса API:', error);
      // При ошибке показываем новую версию (isUsingApi = false)
      setIsUsingApi(false);
      setShowManualModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startHandWork = async () => {
    await checkApiStatus();
  };

  const stopHandWork = () => {
    setShowManualModal(false);
  };

  // Функция для рендеринга нужной модалки
  const renderModal = () => {
    if (isUsingApi === null) {
      return null;
    }

    if (isUsingApi === true) {
      return (
        <ManualWorkModalOld visible={showManualModal} onClose={stopHandWork} />
      );
    }
    return <ManualWorkModal visible={showManualModal} onClose={stopHandWork} />;
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Ручная работа</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            <TouchableOpacity
              style={[styles.startButton, isLoading && { opacity: 0.5 }]}
              onPress={startHandWork}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.startButtonText}>Начать ручную работу</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderModal()}
    </>
  );
};
