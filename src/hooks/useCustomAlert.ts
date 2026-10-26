// src/hooks/useCustomAlert.ts
import { useCallback, useState } from 'react';

interface AlertOptions {
  title: string;
  message: string;
  type: 'success' | 'error';
  autoCloseTime?: number;
  closeDelay?: number;
  confirmText?: string;
  cancelText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}

export type { AlertOptions };

export const useCustomAlert = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'success',
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions(options);
    setAlertVisible(true);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

  const onClose = alertOptions.onClose;

  const hideAlert = useCallback(() => {
    closeAlert();
    onClose?.();
  }, [closeAlert, onClose]);

  return {
    alertOptions,
    alertVisible,
    closeAlert,
    hideAlert,
    showAlert,
  };
};
