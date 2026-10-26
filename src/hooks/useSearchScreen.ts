import { useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { ApiService } from '../services/api';
import type { AggregationInfo } from '../types/aggregation';
import {
  DEFAULT_STATUS_MESSAGE,
  getAvailableParents,
} from '../utils/search';
import type { SearchStatusType } from '../utils/search';

export const useSearchScreen = () => {
  const [inputValue, setInputValue] = useState('');
  const [scanResult, setScanResult] = useState<AggregationInfo | null>(null);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS_MESSAGE);
  const [statusType, setStatusType] = useState<SearchStatusType>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  const inputRef = useRef<TextInput>(null);

  const focusInput = (delay = 100) => {
    setTimeout(() => inputRef.current?.focus(), delay);
  };

  const clearAllStates = () => {
    setInputValue('');
    setScanResult(null);
    setStatusMessage(DEFAULT_STATUS_MESSAGE);
    setStatusType('info');
    setShowActionsModal(false);
    setScanKey(previous => previous + 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);

    return () => clearTimeout(timer);
  }, [scanKey]);

  const handleSubmit = async () => {
    const code = inputValue.trim();

    if (!code || isLoading) {
      return;
    }

    setInputValue('');
    setScanResult(null);
    setShowActionsModal(false);
    setIsLoading(true);
    setStatusMessage('Поиск...');
    setStatusType('info');

    try {
      const response = await ApiService.searchInfo(code);

      if (!response?.scanType) {
        throw new Error('По этому коду ничего не найдено');
      }

      setScanResult(response as AggregationInfo);
      setStatusMessage('Информация найдена');
      setStatusType('success');
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Не удалось выполнить поиск',
      );
      setStatusType('error');
    } finally {
      setIsLoading(false);
      focusInput();
    }
  };

  const handleDeleteSuccess = () => {
    setStatusMessage('Объект удалён');
    setStatusType('success');
    setScanResult(null);
    setShowActionsModal(false);
    setScanKey(previous => previous + 1);
  };

  const closeActionsModal = () => {
    setShowActionsModal(false);
    focusInput(300);
  };

  const handleRefresh = (updated: AggregationInfo) => {
    setScanResult(updated);
  };

  return {
    availableParents: getAvailableParents(scanResult),
    clearAllStates,
    closeActionsModal,
    handleDeleteSuccess,
    handleRefresh,
    handleSubmit,
    inputRef,
    inputValue,
    isProduct: scanResult?.scanType === 'PRODUCT',
    isLoading,
    scanKey,
    scanResult,
    setInputValue,
    setShowActionsModal,
    showActionsModal,
    statusMessage,
    statusType,
  };
};

export type SearchScreenModel = ReturnType<typeof useSearchScreen>;
