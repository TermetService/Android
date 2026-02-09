// src/hooks/useCustomAlert.ts
import { useState } from 'react';

interface AlertOptions {
  title: string;
  message: string;
  type: 'success' | 'error';
  autoCloseTime?: number;
  onClose?: () => void;
}

export const useCustomAlert = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'success',
  });

  const showAlert = (options: AlertOptions) => {
    setAlertOptions(options);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
    if (alertOptions.onClose) {
      alertOptions.onClose();
    }
  };

  return {
    showAlert,
    hideAlert,
    alertVisible,
    alertOptions,
  };
};