import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { CodeActionsModalProps } from './types';
import { styles } from './styles';

export const CodeActionsModal: React.FC<CodeActionsModalProps> = ({
  visible,
  onClose,
  onActionPress,
}) => {
  const handleAction = (action: 'delete' | 'add' | 'label') => {
    onActionPress(action);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Действия с кодом</Text>

              {/* Кнопка удалить */}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleAction('delete')}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionIcon, styles.deleteText]}>🗑️</Text>
                <Text style={[styles.actionText, styles.deleteText]}>
                  Удалить код
                </Text>
              </TouchableOpacity>

              {/* Кнопка добавить */}
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton]}
                onPress={() => handleAction('add')}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionIcon, styles.addText]}>📦</Text>
                <Text style={[styles.actionText, styles.addText]}>
                  Добавить в эту упаковку
                </Text>
              </TouchableOpacity>

              {/* Кнопка этикетка */}
              <TouchableOpacity
                style={[styles.actionButton, styles.labelButton]}
                onPress={() => handleAction('label')}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionIcon, styles.labelText]}>🏷️</Text>
                <Text style={[styles.actionText, styles.labelText]}>
                  Привязать этикетку
                </Text>
              </TouchableOpacity>

              {/* Кнопка отмены */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
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