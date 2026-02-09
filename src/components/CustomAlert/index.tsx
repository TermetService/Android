// src/components/CustomAlert.tsx
import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { styles } from './styles';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoCloseTime?: number; // время авто-закрытия в мс
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type,
  onClose,
  autoCloseTime,
}) => {
  // Автоматическое закрытие
  useEffect(() => {
    if (visible && autoCloseTime && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseTime, type, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.alertContainer,
          type === 'success' ? styles.successAlert : styles.errorAlert
        ]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity
            style={[
              styles.button,
              type === 'success' ? styles.successButton : styles.errorButton
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>
              {type === 'success' ? 'OK' : 'Ошибка'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

