// src/screens/HandWorkScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { styles } from './styles';
import { ApiService } from '../../services/api';
import Toast from 'react-native-toast-message';

export const HandWorkScreen = () => {
  const [showManualModal, setShowManualModal] = useState(false);


  const startHandWork = async () => {
    setShowManualModal(true)
    await ApiService.startPause();
  }

  const stopHandWork = async () => {
    setShowManualModal(false)
    await ApiService.continuedWork()
  }

  // Функция для подтверждения начала ручной работы
  const handleStartManualWork = () => {
    Alert.alert(
      'Начать ручную работу',
      'Вы уверены, что хотите перейти в режим ручной работы?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Начать',
          style: 'default',
          onPress: startHandWork,
        },
      ],
      { cancelable: true }
    );
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
            {/* Кнопка "Начать ручную работу" */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartManualWork}
              activeOpacity={0.7}
            >
              <Text style={styles.startButtonText}>Начать ручную работу</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Модальное окно "Режим ручной работы" */}
      <ManualWorkModal
        visible={showManualModal}
        onClose={stopHandWork}
      />
    </>
  );
};

// Компонент модального окна ручной работы
interface ManualWorkModalProps {
  visible: boolean;
  onClose: () => void;
}

const ManualWorkModal: React.FC<ManualWorkModalProps> = ({ visible, onClose }) => {
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Автофокус при открытии модального окна
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const a = () => {
    // Очищаем поле ввода после алерта
    setCode('');
    // Возвращаем фокус на поле ввода
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // Обработка отправки кода
  const handleSubmit = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    // Показываем алерт с введенным кодом    
    const result = await ApiService.handSave(trimmedCode);
    // console.log('++++++++++', result);


    const handleSaveResult = () => {
      if (result.success) {
        // Успех: показываем Toast на 2 секунды
        Toast.show({
          type: 'success',
          text1: '✅ Успешно сохранено',
          text2: result.message,
          position: 'bottom',
          visibilityTime: 2000,
          autoHide: true,
        });

        // Выполняем действие через 2 секунды
        setTimeout(() => {
          a();
        }, 2000);

      } else {
        // Ошибка: показываем Alert (требует ручного закрытия)
        Alert.alert(
          '❌ Ошибка сохранения',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                a();
              },
            },
          ]
        );
      }
    };

    // Вызываем
    handleSaveResult();
  };

  // Обработка нажатия Enter
  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Заголовок модального окна */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Режим ручной работы</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Основное содержимое - поле ввода по центру */}
        <View style={styles.modalContent}>
          <TextInput
            ref={inputRef}
            style={styles.manualWorkInput}
            value={code}
            onChangeText={setCode}
            onSubmitEditing={handleSubmit}
            onKeyPress={handleKeyPress}
            placeholder="Введите код"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus={true}
            returnKeyType="done"
            blurOnSubmit={false}
          />

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};