import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { AddToBoxModalProps } from './types';
import { styles } from './styles';

export const AddToBoxModal: React.FC<AddToBoxModalProps> = ({
  visible,
  onClose,
  onAddCode,
  loading = false,
  boxNumber,
}) => {
  const [productCode, setProductCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (productCode.trim() && !loading) {
      await onAddCode(productCode.trim());
      setProductCode(''); // Очищаем поле после отправки
    }
  };

  const handleClose = () => {
    setProductCode(''); // Очищаем поле при закрытии
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      onShow={() => {
        // Автофокус при открытии модалки
        setTimeout(() => inputRef.current?.focus(), 100);
      }}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>📦 Добавить код в упаковку</Text>
              
              {boxNumber && (
                <Text style={styles.boxNumberText}>
                  Упаковка №{boxNumber}
                </Text>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={[styles.input, loading && { opacity: 0.6 }]}
                  placeholder="Сканируйте код продукта..."
                  placeholderTextColor="#8E8E93"
                  value={productCode}
                  onChangeText={setProductCode}
                  onSubmitEditing={handleSubmit}
                  editable={!loading}
                  autoFocus={true}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  maxLength={100}
                />
                
                <Text style={styles.instruction}>
                  Нажмите Enter для отправки
                </Text>
              </View>

              {loading && (
                <ActivityIndicator size="small" color="#007AFF" />
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};