// src/components/CustomAlert.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoCloseTime?: number; // мс
  closeDelay?: number; // мс
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

const TICK_MS = 100; // шаг обновления таймера

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
  const [delayLeft, setDelayLeft] = useState(closeDelay);
  const [autoCloseLeft, setAutoCloseLeft] = useState(autoCloseTime ?? 0);
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmingRef = useRef(false);
  const isConfirmation = Boolean(onConfirm);

  // Сброс/установка блокировки + обратный отсчёт closeDelay
  useEffect(() => {
    if (!visible) {
      setCanClose(closeDelay === 0);
      setDelayLeft(closeDelay);
      setAutoCloseLeft(autoCloseTime ?? 0);
      return;
    }

    if (closeDelay <= 0) {
      setCanClose(true);
      setDelayLeft(0);
      return;
    }

    setCanClose(false);
    setDelayLeft(closeDelay);
    const startedAt = Date.now();

    const timer = setInterval(() => {
      const left = Math.max(0, closeDelay - (Date.now() - startedAt));
      setDelayLeft(left);
      if (left <= 0) {
        clearInterval(timer);
        setCanClose(true);
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [visible, closeDelay, autoCloseTime]);

  // Авто-закрытие с видимым обратным отсчётом
  useEffect(() => {
    if (!visible || !canClose || isConfirmation) return;
    if (!autoCloseTime || type !== 'success') return;

    setAutoCloseLeft(autoCloseTime);
    const startedAt = Date.now();

    const timer = setInterval(() => {
      const left = Math.max(0, autoCloseTime - (Date.now() - startedAt));
      setAutoCloseLeft(left);
      if (left <= 0) {
        clearInterval(timer);
        onClose();
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [visible, canClose, autoCloseTime, type, onClose, isConfirmation]);

  // Сброс подтверждения при закрытии
  useEffect(() => {
    if (!visible) {
      confirmingRef.current = false;
      setIsConfirming(false);
    }
  }, [visible]);

  const handleClose = () => {
    // В режиме подтверждения отмена доступна сразу.
    if (!canClose && !isConfirmation) return;
    onClose();
  };

  const handleConfirm = () => {
    if (!canClose || !onConfirm || confirmingRef.current) return;

    confirmingRef.current = true;
    setIsConfirming(true);
    onConfirm();
  };

  const isConfirmDisabled = !canClose || isConfirming;

  // Секунды для отображения (ceil, чтобы показывать «3с», а не «2с» на 3.0–2.01)
  const delaySeconds = Math.ceil(delayLeft / 1000);
  const autoCloseSeconds = Math.ceil(autoCloseLeft / 1000);

  const showAutoCloseCountdown =
    !isConfirmation &&
    type === 'success' &&
    !!autoCloseTime &&
    canClose &&
    autoCloseLeft > 0;

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

          {showAutoCloseCountdown && (
            <Text style={styles.message}>
              Закроется через {autoCloseSeconds} с
            </Text>
          )}

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
                disabled={isConfirmDisabled}
                style={[
                  styles.button,
                  styles.actionButton,
                  type === 'success'
                    ? styles.successButton
                    : styles.errorButton,
                  isConfirmDisabled && styles.buttonDisabled,
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>
                  {canClose ? confirmText : `Подождите ${delaySeconds}с`}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              disabled={!canClose}
              style={[
                styles.button,
                type === 'success' ? styles.successButton : styles.errorButton,
                !canClose && styles.buttonDisabled,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>
                {canClose
                  ? type === 'success'
                    ? 'OK'
                    : 'Ошибка'
                  : `Подождите ${delaySeconds}с`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
