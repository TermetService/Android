import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import type { AggregationResponse } from '../../services/api';
import { styles } from './styles';
import { ApiService } from '../../services/api';
import { CustomAlert } from '../../components/CustomAlert';
import { Config } from '../../config';
import { ExpectedScanType, getExpectedScanLabel } from './expectedScan';
import { TaskCompletionModal } from './TaskCompletionModal';
import type { TaskPackagingStats } from './TaskCompletionModal';

interface AlertConfig {
  title: string;
  message: string;
  type: 'success' | 'error';
}

const MAX_QUEUE_SIZE = 10;

interface HandWorkScreenProps {
  onTaskCompleted: () => void;
}

export const HandWorkScreen: React.FC<HandWorkScreenProps> = ({
  onTaskCompleted,
}) => {
  const [expectedScan, setExpectedScan] = useState<ExpectedScanType | null>(
    null,
  );

  const [code, setCode] = useState('');
  const [requestQueue, setRequestQueue] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [isValidatingTask, setIsValidatingTask] = useState(false);

  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'error',
  });

  const [serverStatus, setServerStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskPackagingStats, setTaskPackagingStats] =
    useState<TaskPackagingStats | null>(null);

  const [fillProgress, setFillProgress] = useState<
    Pick<AggregationResponse, 'smallBox' | 'bigBox' | 'pallet'>
  >({
    smallBox: null,
    bigBox: null,
    pallet: null,
  });

  const serverUrl = Config.SERVER_URL;

  // Ссылка на нативное поле ввода.
  const inputRef = useRef<TextInput>(null);

  // Актуальное значение поля без ожидания следующего рендера.
  const codeRef = useRef('');

  // Рабочая очередь кодов.
  const queueRef = useRef<string[]>([]);

  // Защита от параллельной обработки очереди.
  const isProcessingRef = useRef(false);

  // Проверка, что экран ещё смонтирован.
  const mountedRef = useRef(false);

  const stateRevisionRef = useRef(0);

  const currentStateRequestRef = useRef<Promise<AggregationResponse> | null>(
    null,
  );

  // Продолжение обработки очереди после закрытия уведомления.
  const alertCloseResolverRef = useRef<(() => void) | null>(null);

  // Блокировка поля при отображении модальных окон и переполнении очереди.
  const isInputBlocked =
    showCustomAlert ||
    showCompletionModal ||
    isValidatingTask ||
    isCompletingTask ||
    requestQueue.length >= MAX_QUEUE_SIZE;

  const handleCodeChange = (value: string) => {
    codeRef.current = value;
    setCode(value);
  };

  // Очищаем и нативное поле, и React state.
  const clearCodeInput = () => {
    codeRef.current = '';
    inputRef.current?.clear();
    setCode('');
  };

  // Звуковая индикация ТСД.
  const playBeep = useCallback((type: 'success' | 'error') => {
    console.log(type === 'success' ? '✓' : '✗');
  }, []);

  // Показать уведомление и дождаться его закрытия.
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

  // Загрузка текущего состояния при открытии экрана.
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const initialRevision = stateRevisionRef.current;

    const loadCurrentState = async () => {
      try {
        // Повторное выполнение эффекта использует тот же запрос.
        const request =
          currentStateRequestRef.current ??
          (currentStateRequestRef.current = ApiService.getCurrentState());

        const responseData = await request;

        // Не применяем устаревший ответ.
        if (
          cancelled ||
          !mountedRef.current ||
          stateRevisionRef.current !== initialRevision
        ) {
          return;
        }

        const response = responseData as AggregationResponse & {
          data?: AggregationResponse;
        };

        const result = response.data ?? response;

        setExpectedScan(result.expectedScan);

        setFillProgress({
          smallBox: result.smallBox ?? null,
          bigBox: result.bigBox ?? null,
          pallet: result.pallet ?? null,
        });
      } catch (error) {
        if (!cancelled && mountedRef.current) {
          console.error('Ошибка получения текущего состояния:', error);
        }
      }
    };

    void loadCurrentState();

    return () => {
      cancelled = true;
      mountedRef.current = false;

      alertCloseResolverRef.current?.();
      alertCloseResolverRef.current = null;
    };
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

  // Первый пинг и последующие проверки раз в 30 секунд.
  useEffect(() => {
    void pingServer();

    const intervalId = setInterval(() => {
      void pingServer();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [pingServer]);

  // Единое управление фокусом поля.
  useEffect(() => {
    if (isInputBlocked) {
      inputRef.current?.blur();
      return;
    }

    const timer = setTimeout(() => {
      if (mountedRef.current && !isInputBlocked) {
        inputRef.current?.focus();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isInputBlocked]);

  // Последовательная обработка очереди.
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

        let failure: {
          title: string;
          message: string;
        } | null = null;

        try {
          const responseData = await ApiService.handSave(currentCode);

          if (!mountedRef.current) {
            return;
          }

          playBeep('success');

          // Следующий тип сканирования извлекаем из ответа сервера.
          // Обновляем ожидаемый тип сканирования и заполненность.
          const response = responseData as AggregationResponse & {
            data?: AggregationResponse;
          };

          const result = response.data ?? response;

          stateRevisionRef.current += 1;

          setExpectedScan(result.expectedScan);

          setFillProgress({
            smallBox: result.smallBox ?? null,
            bigBox: result.bigBox ?? null,
            pallet: result.pallet ?? null,
          });
        } catch (error) {
          if (!mountedRef.current) {
            return;
          }

          playBeep('error');

          failure = {
            title: '⚠️ Ошибка обработки',
            message:
              error instanceof Error
                ? error.message
                : `Не удалось обработать код ${currentCode}`,
          };
        } finally {
          // Удаляем обработанный элемент независимо от результата.
          queueRef.current = queueRef.current.slice(1);

          if (mountedRef.current) {
            setRequestQueue([...queueRef.current]);
          }
        }

        // При ошибке ждём закрытия уведомления.
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
  }, [playBeep, showErrorAndWait]);

  // Принимает одно завершённое сканирование.
  const handleSubmit = () => {
    if (
      showCustomAlert ||
      showCompletionModal ||
      isValidatingTask ||
      isCompletingTask
    ) {
      return;
    }

    // Enter — только разделитель. Сам код берём из поля.
    const trimmedCode = codeRef.current.trim();

    if (!trimmedCode) {
      console.warn('[SCAN] Enter получен, поле пустое');
      return;
    }

    // Не теряем введённый код при заполненной очереди.
    if (queueRef.current.length >= MAX_QUEUE_SIZE) {
      setAlertConfig({
        title: '⚠️ Очередь переполнена',
        message: 'Код оставлен в поле. Дождитесь обработки текущих запросов.',
        type: 'error',
      });

      setShowCustomAlert(true);
      return;
    }

    // Добавляем код в очередь синхронно.
    const updatedQueue = [...queueRef.current, trimmedCode];

    queueRef.current = updatedQueue;
    setRequestQueue(updatedQueue);

    // Очищаем поле сразу после принятия кода.
    clearCodeInput();

    // Сохраняем фокус для следующего сканирования.
    inputRef.current?.focus();

    // Отправка идёт независимо от нового ввода.
    void processQueue();
  };

  const renderFillProgress = (
    label: string,
    progress: AggregationResponse['smallBox'],
  ) => {
    if (progress === null) {
      return null;
    }

    const fillPercent =
      progress.limit > 0
        ? Math.min(100, Math.max(0, (progress.current / progress.limit) * 100))
        : 0;

    const fillColor =
      progress.current > progress.limit
        ? '#DC2626'
        : fillPercent >= 100
        ? '#16A34A'
        : '#007AFF';

    return (
      <View key={label} style={styles.fillProgressContainer}>
        <View style={styles.fillProgressHeader}>
          <Text style={styles.fillProgressLabel}>{label}</Text>

          <Text
            style={[
              styles.fillProgressValue,
              {
                color: fillColor,
              },
            ]}
          >
            {progress.current} / {progress.limit}
          </Text>
        </View>

        <View style={styles.fillProgressTrack}>
          <View
            style={[
              styles.fillProgressBar,
              {
                width: `${fillPercent}%`,
                backgroundColor: fillColor,
              },
            ]}
          />
        </View>

        <Text style={styles.fillProgressPercent}>
          {Math.round(fillPercent)}%
        </Text>
      </View>
    );
  };

  // Проверка задания перед открытием окна результатов.
  const handleOpenCompletion = async () => {
    if (showCustomAlert || isValidatingTask || isCompletingTask) {
      return;
    }

    const hasPendingScans =
      queueRef.current.length > 0 ||
      isProcessingRef.current ||
      codeRef.current.trim().length > 0;

    if (hasPendingScans) {
      setAlertConfig({
        title: 'Обработка не завершена',
        message:
          'Сначала отправьте введённый код и дождитесь обработки всех кодов из очереди.',
        type: 'error',
      });

      setShowCustomAlert(true);
      return;
    }

    setIsValidatingTask(true);

    try {
      const stats = await ApiService.validateTaskCompletion();

      if (!mountedRef.current) {
        return;
      }

      setTaskPackagingStats(stats);
      setShowCompletionModal(true);
    } catch (error) {
      console.error('Ошибка проверки задания:', error);

      if (!mountedRef.current) {
        return;
      }

      setAlertConfig({
        title: 'Ошибка проверки',
        message: 'Не удалось получить результат проверки задания.',
        type: 'error',
      });

      setShowCustomAlert(true);
    } finally {
      if (mountedRef.current) {
        setIsValidatingTask(false);
      }
    }
  };

  // Завершение задания.
  const handleCompleteTask = async () => {
    if (isCompletingTask || isValidatingTask) {
      return;
    }

    const hasPendingScans =
      queueRef.current.length > 0 ||
      isProcessingRef.current ||
      codeRef.current.trim().length > 0;

    if (hasPendingScans) {
      setShowCompletionModal(false);

      setAlertConfig({
        title: 'Обработка не завершена',
        message: 'Нельзя завершить задание, пока остаются необработанные коды.',
        type: 'error',
      });

      setShowCustomAlert(true);
      return;
    }

    setIsCompletingTask(true);

    try {
      await ApiService.completeTask();

      if (!mountedRef.current) {
        return;
      }

      setShowCompletionModal(false);
      onTaskCompleted();
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      console.error('Ошибка завершения задания:', error);

      setShowCompletionModal(false);

      setAlertConfig({
        title: 'Ошибка завершения',
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось завершить задание.',
        type: 'error',
      });

      setShowCustomAlert(true);
    } finally {
      if (mountedRef.current) {
        setIsCompletingTask(false);
      }
    }
  };

  // Закрытие уведомления и возобновление очереди.
  const handleAlertClose = () => {
    setShowCustomAlert(false);

    const resolve = alertCloseResolverRef.current;
    alertCloseResolverRef.current = null;

    resolve?.();
  };

  // Индикатор статуса сервера.
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
      <View
        style={[
          styles.modalHeader,
          {
            paddingTop: 12,
          },
        ]}
      >
        <View style={styles.infoContainer}>
          <View style={styles.serverInfoButton}>
            <Text
              style={[
                styles.serverInfoText,
                serverStatus === 'offline' && styles.serverInfoTextOffline,
                serverStatus === 'online' && styles.serverInfoTextOnline,
              ]}
            >
              {getServerStatusIcon()} Сервер: {serverUrl}
            </Text>
          </View>
        </View>
      </View>

      {/* Основная информация */}
      <View style={styles.contentArea}>
        <View style={styles.expectedScanContainer}>
          <Text style={styles.expectedScanTitle}>Следующее сканирование</Text>

          <Text style={styles.expectedScanValue}>
            {getExpectedScanLabel(expectedScan)}
          </Text>
        </View>

        {requestQueue.length > 0 && (
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.modalOperatorTitle,
                {
                  color: '#FF9800',
                },
              ]}
            >
              📦 Запросов в очереди: {requestQueue.length}
              {isSubmitting ? ' · обработка' : ''}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 12,
            alignItems: 'center',
            marginTop: 10,
          }}
          onPress={() => void handleOpenCompletion()}
          disabled={isValidatingTask}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            {isValidatingTask ? 'Проверка задания...' : 'Проверить задание'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Поле сканирования */}
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.manualWorkInput}
          value={code}
          onChangeText={handleCodeChange}
          onSubmitEditing={handleSubmit}
          placeholder={
            requestQueue.length > 0
              ? `Очередь: ${requestQueue.length} | Введите код...`
              : `Введите код`
          }
          placeholderTextColor="#999"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          submitBehavior="submit"
          editable={!isInputBlocked}
        />
      </View>
      {(fillProgress.smallBox !== null ||
        fillProgress.bigBox !== null ||
        fillProgress.pallet !== null) && (
        <View
          style={{
            marginTop: 4,
          }}
        >
          {renderFillProgress('Малый короб', fillProgress.smallBox)}
          {renderFillProgress('Большой короб', fillProgress.bigBox)}
          {renderFillProgress('Палета', fillProgress.pallet)}
        </View>
      )}

      {/* Уведомления */}
      <CustomAlert
        visible={showCustomAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleAlertClose}
      />
      <TaskCompletionModal
        visible={showCompletionModal}
        stats={taskPackagingStats}
        onClose={() => setShowCompletionModal(false)}
        onComplete={handleCompleteTask}
        isCompleting={isCompletingTask}
      />
    </View>
  );
};
