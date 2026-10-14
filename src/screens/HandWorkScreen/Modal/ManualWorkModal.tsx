import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { styles } from './styles';
import { ApiService } from '../../../services/api';
import { CustomAlert } from '../../../components/CustomAlert';
import { Config } from '../../../config';

import { ExpectedScanType, getExpectedScanLabel } from '../expectedScan';

interface ManualWorkModalProps {
  expectedScan: ExpectedScanType | null;
  onExpectedScanChange: (expectedScan: ExpectedScanType) => void;
}

type AlertConfig = {
  title: string;
  message: string;
  type: 'success' | 'error';
};

const MAX_QUEUE_SIZE = 10;
const SCAN_DELAY = 200;

export const ManualWorkModal: React.FC<ManualWorkModalProps> = ({
  expectedScan,
  onExpectedScanChange,
}) => {
  const [code, setCode] = useState('');
  const [requestQueue, setRequestQueue] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'error',
  });

  const [serverStatus, setServerStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');

  const serverUrl = Config.SERVER_URL;

  const inputRef = useRef<TextInput>(null);
  const queueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const canScanRef = useRef(true);
  const mountedRef = useRef(false);
  const scanUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertCloseResolverRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (scanUnlockTimerRef.current) {
        clearTimeout(scanUnlockTimerRef.current);
      }

      alertCloseResolverRef.current?.();
      alertCloseResolverRef.current = null;
    };
  }, []);

  // Звуковая индикация ТСД.
  const playBeep = useCallback((type: 'success' | 'error') => {
    // Здесь можно подключить реальное воспроизведение звука.
    console.log(type === 'success' ? '✓' : '✗');
  }, []);

  // Проверка доступности сервера.
  const pingServer = useCallback(async () => {
    if (mountedRef.current) {
      setServerStatus('checking');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const startTime = Date.now();

    try {
      const response = await fetch(`${serverUrl}/aggregation`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!mountedRef.current) {
        return;
      }

      if (response.ok) {
        console.log(`Пинг сервера: ${Date.now() - startTime}ms`);
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      if (mountedRef.current) {
        console.log('Ошибка пинга сервера:', error);
        setServerStatus('offline');
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }, [serverUrl]);

  useEffect(() => {
    void pingServer();

    const intervalId = setInterval(() => {
      void pingServer();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [pingServer]);

  // Автофокус при открытии экрана и после обработки сканов.
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Показывает ошибку и ждёт, пока оператор её закроет.
  const showErrorAndWait = useCallback(
    (title: string, message: string): Promise<void> =>
      new Promise(resolve => {
        alertCloseResolverRef.current = resolve;

        setAlertConfig({
          title,
          message,
          type: 'error',
        });

        setShowCustomAlert(true);
      }),
    [],
  );

  /**
   * Последовательно отправляет запросы.
   *
   * Один код — один вызов handSave.
   * Следующий код отправляется после завершения предыдущего.
   * При ошибке очередь приостанавливается до закрытия уведомления.
   */
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || !mountedRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setIsSubmitting(true);

    try {
      while (queueRef.current.length > 0) {
        if (!mountedRef.current) {
          break;
        }

        const currentCode = queueRef.current[0];

        let failure: { title: string; message: string } | null = null;

        try {
          const result = await ApiService.handSave(currentCode);

          if (!mountedRef.current) {
            return;
          }

          playBeep(result.success ? 'success' : 'error');

          // Сервер определяет, что сканировать следующим.
          if (result.success && result.expectedScan) {
            onExpectedScanChange(result.expectedScan);
          }

          if (!result.success) {
            failure = {
              title: '⚠️ Ошибка обработки',
              message:
                result.message || `Не удалось обработать код ${currentCode}`,
            };
          }
        } catch (error) {
          if (!mountedRef.current) {
            return;
          }

          console.error(`Ошибка отправки кода ${currentCode}:`, error);
          playBeep('error');

          failure = {
            title: '❌ Ошибка соединения',
            message: `Не удалось отправить код ${currentCode}. Проверьте соединение с сервером.`,
          };
        } finally {
          // Завершённый запрос удаляется независимо от результата.
          queueRef.current = queueRef.current.slice(1);

          if (mountedRef.current) {
            setRequestQueue([...queueRef.current]);
          }
        }

        // Не затираем уведомления следующими ошибками.
        // Оператор закроет ошибку — после этого очередь продолжится.
        if (failure && mountedRef.current) {
          await showErrorAndWait(failure.title, failure.message);
        }
      }
    } finally {
      isProcessingRef.current = false;

      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [onExpectedScanChange, playBeep, showErrorAndWait]);

  // Добавляет новый код в очередь.
  const handleSubmit = () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      return;
    }

    if (!canScanRef.current) {
      playBeep('error');

      setAlertConfig({
        title: '⚠️ Слишком быстро',
        message: 'Подождите перед следующим сканированием',
        type: 'error',
      });

      setShowCustomAlert(true);
      setCode('');
      inputRef.current?.focus();
      return;
    }

    if (queueRef.current.length >= MAX_QUEUE_SIZE) {
      playBeep('error');

      setAlertConfig({
        title: '⚠️ Очередь переполнена',
        message: 'Дождитесь обработки текущих запросов',
        type: 'error',
      });

      setShowCustomAlert(true);
      setCode('');
      inputRef.current?.focus();
      return;
    }



    const updatedQueue = [...queueRef.current, trimmedCode];

    queueRef.current = updatedQueue;
    setRequestQueue(updatedQueue);
    setCode('');

    // Не сигнализируем об успехе до ответа сервера.
    inputRef.current?.focus();

    if (scanUnlockTimerRef.current) {
      clearTimeout(scanUnlockTimerRef.current);
    }

    scanUnlockTimerRef.current = setTimeout(() => {
      canScanRef.current = true;

      if (mountedRef.current) {
        inputRef.current?.focus();
      }
    }, SCAN_DELAY);

    void processQueue();
  };

  const handleAlertClose = () => {
    setShowCustomAlert(false);

    const resolve = alertCloseResolverRef.current;
    alertCloseResolverRef.current = null;
    resolve?.();
  };

  const getServerStatusIcon = () => {
    switch (serverStatus) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'checking':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <View style={styles.modalContainer}>
      {/* Статус сервера */}
      <View style={[styles.modalHeader, { paddingTop: 12 }]}>
        <View style={styles.infoContainer}>
          <TouchableOpacity
            onPress={() => void pingServer()}
            style={styles.serverInfoButton}
            disabled={serverStatus === 'checking'}
          >
            <Text
              style={[
                styles.serverInfoText,
                serverStatus === 'offline' && styles.serverInfoTextOffline,
                serverStatus === 'online' && styles.serverInfoTextOnline,
              ]}
            >
              {getServerStatusIcon()} Сервер: {serverUrl}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Основная информация */}
      <View style={styles.contentArea}>
        {/* Ожидаемый тип сканирования */}
        <View style={styles.expectedScanContainer}>
          <Text style={styles.expectedScanTitle}>Следующее сканирование</Text>

          <Text style={styles.expectedScanValue}>
            {getExpectedScanLabel(expectedScan)}
          </Text>
        </View>

        {/* Состояние очереди */}
        {requestQueue.length > 0 && (
          <View style={styles.infoContainer}>
            <Text style={[styles.modalOperatorTitle, { color: '#FF9800' }]}>
              📦 Запросов в очереди: {requestQueue.length}
              {isSubmitting ? ' · обработка' : ''}
            </Text>
          </View>
        )}

        {/* Здесь размещай дополнительные информационные блоки,
          например информацию о коробке и счётчики */}
      </View>

      {/* Поле сканирования */}
      <View style={styles.inputWrapper}>
        <TextInput
          autoFocus
          ref={inputRef}
          style={styles.manualWorkInput}
          value={code}
          onChangeText={setCode}
          onSubmitEditing={handleSubmit}
          placeholder={
            requestQueue.length > 0
              ? `Очередь: ${requestQueue.length} | Введите код...`
              : getExpectedScanLabel(expectedScan)
          }
          placeholderTextColor="#999"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          submitBehavior="submit"
          editable={requestQueue.length < MAX_QUEUE_SIZE}
        />
      </View>

      {/* Уведомления */}
      <CustomAlert
        visible={showCustomAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleAlertClose}
      />
    </View>
  );
};
