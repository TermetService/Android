import { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { Config } from '../config';
import { ApiService } from '../services/api';
import type { AggregationResponse } from '../services/api';
import type { ExpectedScanType } from '../types/aggregation';
import type {
  FillProgress,
  ServerStatus,
  TaskPackagingStats,
} from '../types/handWork';
import { unwrapAggregationResponse } from '../utils/aggregation';
import { useCustomAlert } from './useCustomAlert';

const MAX_QUEUE_SIZE = 10;

interface HandWorkScreenProps {
  onTaskCompleted: () => void;
}

export const useHandWorkScreen = ({ onTaskCompleted }: HandWorkScreenProps) => {
  const {
    showAlert,
    hideAlert,
    alertVisible,
    alertOptions,
  } = useCustomAlert();

  const [expectedScan, setExpectedScan] = useState<ExpectedScanType | null>(
    null,
  );

  const [code, setCode] = useState('');
  const [requestQueue, setRequestQueue] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [isValidatingTask, setIsValidatingTask] = useState(false);

  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskPackagingStats, setTaskPackagingStats] =
    useState<TaskPackagingStats | null>(null);

  const [fillProgress, setFillProgress] = useState<FillProgress>({
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
    alertVisible ||
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

        showAlert({
          title,
          message,
          type: 'error',
          onClose: () => {
            alertCloseResolverRef.current = null;
            resolve();
          },
        });
      }),
    [showAlert],
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

        const result = unwrapAggregationResponse(responseData);

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

  // Первый пинг и последующие проверки раз в 5 секунд.
  useEffect(() => {
    void pingServer();

    const intervalId = setInterval(() => {
      void pingServer();
    }, 5000);

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
          const result = unwrapAggregationResponse(responseData);

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
      alertVisible ||
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
      showAlert({
        title: '⚠️ Очередь переполнена',
        message: 'Код оставлен в поле. Дождитесь обработки текущих запросов.',
        type: 'error',
      });

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

  // Проверка задания перед открытием окна результатов.
  const handleOpenCompletion = async () => {
    if (alertVisible || isValidatingTask || isCompletingTask) {
      return;
    }

    const hasPendingScans =
      queueRef.current.length > 0 ||
      isProcessingRef.current ||
      codeRef.current.trim().length > 0;

    if (hasPendingScans) {
      showAlert({
        title: 'Обработка не завершена',
        message:
          'Сначала отправьте введённый код и дождитесь обработки всех кодов из очереди.',
        type: 'error',
      });

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

      showAlert({
        title: 'Ошибка проверки',
        message: 'Не удалось получить результат проверки задания.',
        type: 'error',
      });
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

      showAlert({
        title: 'Обработка не завершена',
        message: 'Нельзя завершить задание, пока остаются необработанные коды.',
        type: 'error',
      });

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

      showAlert({
        title: 'Ошибка завершения',
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось завершить задание.',
        type: 'error',
      });
    } finally {
      if (mountedRef.current) {
        setIsCompletingTask(false);
      }
    }
  };

  return {
    alertOptions,
    alertVisible,
    code,
    expectedScan,
    fillProgress,
    handleCodeChange,
    handleCompleteTask,
    handleOpenCompletion,
    handleSubmit,
    hideAlert,
    inputRef,
    isCompletingTask,
    isInputBlocked,
    isSubmitting,
    isValidatingTask,
    requestQueue,
    serverStatus,
    serverUrl,
    showCompletionModal,
    taskPackagingStats,
    closeCompletionModal: () => setShowCompletionModal(false),
  };
};

export type HandWorkScreenModel = ReturnType<typeof useHandWorkScreen>;
