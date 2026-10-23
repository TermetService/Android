import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,

  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ApiService } from '../../services/api';
import {
  SearchActionsModal,
  type AggregationInfo,
} from '../../components/ActionsModal';
import {styles} from './styles.ts';

type StatusType = 'info' | 'success' | 'error';

const DEFAULT_STATUS_MESSAGE = 'Отсканируйте товар или этикетку упаковки';

const scanTypeNames: Record<AggregationInfo['scanType'], string> = {
  PRODUCT: 'Товар',
  SMALL_BOX_LABEL: 'Малая коробка',
  BIG_BOX_LABEL: 'Коробка',
  PALLET_LABEL: 'Паллета',
};

const parentRows = [
  ['smallBox', 'Малая коробка'],
  ['bigBox', 'Коробка'],
  ['pallet', 'Паллета'],
] as const;

const extractContainerNumber = (
  sscc: string | null | undefined,
): string | null => {
  if (!sscc?.trim()) {
    return null;
  }

  const serialReference = sscc.substring(12, 19);

  return serialReference.replace(/^0+/, '') || '0';
};

export const SearchScreen: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [scanResult, setScanResult] = useState<AggregationInfo | null>(null);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS_MESSAGE);
  const [statusType, setStatusType] = useState<StatusType>('info');
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

  const isProduct = scanResult?.scanType === 'PRODUCT';

  const availableParents = scanResult
    ? parentRows.filter(([key]) => {
        const value = scanResult.parents?.[key];

        return value != null && String(value).trim() !== '';
      })
    : [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.centerContainer}>
            <TextInput
              key={scanKey}
              ref={inputRef}
              style={[styles.searchInput, isLoading && styles.inputDisabled]}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={() => void handleSubmit()}
              placeholder={
                isLoading ? 'Поиск...' : 'Отсканируйте товар или упаковку'
              }
              placeholderTextColor="#999"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              blurOnSubmit={false}
              editable={!isLoading && !showActionsModal}
            />

            {isLoading && (
              <ActivityIndicator
                style={styles.loader}
                size="small"
                color="#007AFF"
              />
            )}
          </View>

          <View
            style={[
              styles.resultContainer,
              statusType === 'success' && styles.resultSuccess,
              statusType === 'error' && styles.resultError,
              statusType === 'info' && styles.resultInfo,
            ]}
          >
            <Text style={styles.resultMessage}>{statusMessage}</Text>
          </View>

          {scanResult && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                {scanTypeNames[scanResult.scanType]}
              </Text>

              {!isProduct && (
                <>
                  <InfoRow
                    label="Номер упаковки"
                    value={
                      extractContainerNumber(scanResult.label) ?? 'Не указан'
                    }
                  />

                  <View style={styles.separator} />

                  <InfoRow
                    label="Полная этикетка"
                    value={scanResult.label ?? 'Не указана'}
                  />
                </>
              )}

              {availableParents.length > 0 && (
                <>
                  <View style={styles.separator} />

                  <Text style={styles.sectionSubtitle}>Расположение</Text>

                  {availableParents.map(([key, title]) => {
                    const fullLabel = scanResult.parents[key];
                    const number = extractContainerNumber(fullLabel);

                    return (
                      <InfoRow
                        key={key}
                        label={title}
                        value={number !== null ? `№${number}` : 'Не указан'}
                      />
                    );
                  })}
                </>
              )}

              {!isProduct && (
                <>
                  <View style={styles.separator} />

                  <Text style={styles.sectionSubtitle}>Содержимое</Text>

                  <InfoRow
                    label="Количество"
                    value={
                      scanResult.contentsCount == null
                        ? 'Неизвестно'
                        : String(scanResult.contentsCount)
                    }
                  />

                  <InfoRow
                    label="Тип содержимого"
                    value={
                      scanResult.contentsType
                        ? scanTypeNames[scanResult.contentsType]
                        : 'Не указан'
                    }
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowActionsModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Действия</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllStates}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Очистить</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {scanResult && (
        <SearchActionsModal
          visible={showActionsModal}
          scanResult={scanResult}
          onClose={closeActionsModal}
          onDeleteSuccess={handleDeleteSuccess}
          onRefresh={updated => setScanResult(updated)}
        />
      )}
    </View>
  );
};

type InfoRowProps = {
  label: string;
  value: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

