// src/components/CustomAlert.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoCloseTime?: number; // время авто-закрытия в мс
  closeDelay?: number; // задержка перед возможностью подтвердить/закрыть (в мс)
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type,
  onClose,
  autoCloseTime,
  closeDelay = 0,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
}) => {
  const [canClose, setCanClose] = useState(closeDelay === 0);
  const isConfirmation = Boolean(onConfirm);

  // Сброс/установка блокировки при каждом открытии
  useEffect(() => {
    if (!visible) {
      setCanClose(closeDelay === 0);
      return;
    }

    if (closeDelay > 0) {
      setCanClose(false);
      const delayTimer = setTimeout(() => {
        setCanClose(true);
      }, closeDelay);

      return () => clearTimeout(delayTimer);
    } else {
      setCanClose(true);
    }
  }, [visible, closeDelay]);

  // Автоматическое закрытие (стартует только после задержки)
  useEffect(() => {
    if (!visible || !canClose || isConfirmation) return;
    if (!autoCloseTime || type !== 'success') return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseTime);

    return () => clearTimeout(timer);
  }, [
    visible,
    canClose,
    autoCloseTime,
    type,
    onClose,
    isConfirmation,
  ]);

  const handleClose = () => {
    // В режиме подтверждения отмена доступна сразу.
    if (!canClose && !isConfirmation) return;
    onClose();
  };

  const handleConfirm = () => {
    if (!canClose || !onConfirm) return;
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.alertContainer,
            type === 'success' ? styles.successAlert : styles.errorAlert,
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {isConfirmation ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.actionButton,
                  styles.cancelButton,
                ]}
                onPress={handleClose}
              >
                <Text style={styles.buttonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!canClose}
                style={[
                  styles.button,
                  styles.actionButton,
                  type === 'success'
                    ? styles.successButton
                    : styles.errorButton,
                  !canClose && styles.buttonDisabled,
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>
                  {canClose ? confirmText : 'Подождите...'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              disabled={!canClose}
              style={[
                styles.button,
                type === 'success'
                  ? styles.successButton
                  : styles.errorButton,
                !canClose && styles.buttonDisabled,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>
                {canClose
                  ? type === 'success'
                    ? 'OK'
                    : 'Ошибка'
                  : 'Подождите...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
