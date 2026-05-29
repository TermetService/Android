import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { styles } from './styles';
import React, { useState, useRef, useEffect } from 'react';
import { ApiService } from '../../../services/api';
import { CustomAlert } from '../../../components/CustomAlert';
import { Config } from '../../../config';

// Компонент модального окна ручной работы
interface ManualWorkModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BoxInfo {
  boxNumber: number;
  palletNumber: number;
  productsInBox: number;
  limitProductsInBox: number;
}

export const ManualWorkModal: React.FC<ManualWorkModalProps> = ({
  visible,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [boxInfo, setBoxInfo] = useState<BoxInfo | null>(null);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [serverStatus, setServerStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');

  // Очередь с ограничением
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestQueue, setRequestQueue] = useState<string[]>([]);
  const MAX_QUEUE_SIZE = 10; // Максимальный размер очереди

  // const title = Config.USER_ID;
  const serverUrl = Config.SERVER_URL;

  const inputRef = useRef<TextInput>(null);

  const pingServer = async () => {
    try {
      setServerStatus('checking');
      const startTime = Date.now();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${serverUrl}/code/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const pingTime = Date.now() - startTime;
        console.log(`Пинг сервера: ${pingTime}ms`);
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      console.log('Ошибка пинга сервера:', error);
      setServerStatus('offline');
    }
  };

  // Звуковая индикация (для ТСД)
  const playBeep = (type: 'success' | 'error') => {
    // Здесь код для воспроизведения звукового сигнала ТСД
    console.log(`🔊 ${type === 'success' ? '✓' : '✗'}`);
  };

  useEffect(() => {
    if (visible) {
      pingServer();

      const intervalId = setInterval(pingServer, 30000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setBoxInfo(null);
      setCode('');
      setServerStatus('checking');
      setRequestQueue([]); // Очищаем очередь при закрытии
    }
  }, [visible]);

  useEffect(() => {
    const get = async () => {
      const result = await ApiService.getCounts();
      if (result) {
        console.log('--------------------res', result.data);
        if (result.data) {
          setBoxInfo({
            boxNumber: +result.data.lastBoxNumber,
            palletNumber: +result.data.lastPalletNumber,
            productsInBox: +result.data.productsInBox,
            limitProductsInBox: parseInt(result.data.limitProductsInBox) || 2,
          });
        }
      }
    };
    get();
  }, []);

  // Обработка очереди
  useEffect(() => {
    const processQueue = async () => {
      if (requestQueue.length > 0 && !isSubmitting) {
        setIsSubmitting(true);
        const currentCode = requestQueue[0];

        try {
          const result = await ApiService.handSave(currentCode);

          // Убираем обработанный запрос
          setRequestQueue(prev => prev.slice(1));

          // Звуковой сигнал
          playBeep(result.success ? 'success' : 'error');

          // Показываем алерт только для ошибок
          if (!result.success) {
            setAlertConfig({
              title: '⚠️ Ошибка',
              message: result.message,
              type: 'error',
            });
            setShowCustomAlert(true);
          }

          // Обновляем информацию о коробке из ответа
          if (result.success && result.data?.result) {
            setBoxInfo({
              boxNumber: result.data.result.boxNumber,
              palletNumber: result.data.result.palletNumber,
              productsInBox: result.data.result.productsInBox,
              limitProductsInBox:
                parseInt(result.data.result.limitProductsInBox) || 2,
            });
          }
        } catch (error) {
          playBeep('error');
          setAlertConfig({
            title: '❌ Ошибка',
            message: 'Ошибка соединения с сервером',
            type: 'error',
          });
          setShowCustomAlert(true);
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    processQueue();
  }, [requestQueue, isSubmitting]);
  const [canScan, setCanScan] = useState(true);
  const SCAN_DELAY = 100; // 100 мс задержка между сканами

  const handleSubmit = () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    if (!canScan) {
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

    // Проверка размера очереди
    if (requestQueue.length >= MAX_QUEUE_SIZE) {
      playBeep('error');
      setAlertConfig({
        title: '⚠️ Переполнение',
        message: 'Очередь переполнена. Дождитесь обработки',
        type: 'error',
      });
      setShowCustomAlert(true);
      setCode('');
      inputRef.current?.focus();
      return;
    }

    // Добавляем в очередь
    setRequestQueue(prev => [...prev, trimmedCode]);
    setCanScan(false);
    // Очищаем поле для следующего скана
    setCode('');
    inputRef.current?.focus();
    setTimeout(() => {
      setCanScan(true);
      inputRef.current?.focus();
    }, SCAN_DELAY);
    // Короткий сигнал подтверждения сканирования
    playBeep('success');
  };

  // Обработка нажатия Enter
  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSubmit();
    }
  };

  // Обработчик закрытия кастомного алерта
  const handleAlertClose = () => {
    setShowCustomAlert(false);
  };

  // Вычисление процента заполнения коробки
  const getFillPercentage = (): number => {
    if (!boxInfo) return 0;
    return (boxInfo.productsInBox / boxInfo.limitProductsInBox) * 100;
  };

  // Получение цвета и иконки для статуса сервера
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

  // Отображение статуса очереди (используем существующие стили)
  const renderQueueStatus = () => {
    if (requestQueue.length > 0) {
      return (
        <View style={styles.infoContainer}>
          <Text style={[styles.modalOperatorTitle, { color: '#FF9800' }]}>
            📦 В очереди: {requestQueue.length}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Информация об операторе и сервере */}
        <View style={styles.modalHeader}>
          <View style={styles.infoContainer}>
            {/* <Text style={styles.modalOperatorTitle}>
                            Оператор №{title}
                        </Text> */}
            <TouchableOpacity
              onPress={pingServer}
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

        {/* Заголовок модального окна */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Режим ручной работы</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Статус очереди */}
        {renderQueueStatus()}

        {/* Информация о коробке (вверху экрана) */}
        {boxInfo && (
          <View style={styles.boxInfoContainer}>
            <View style={styles.boxIconWrapper}>
              <View style={styles.boxIcon}>
                <Text style={styles.boxNumberText}>{boxInfo.boxNumber}</Text>
              </View>
              <Text style={styles.palletInfo}>
                Паллета {boxInfo.palletNumber}
              </Text>
            </View>

            <View style={styles.statusBarContainer}>
              <View style={styles.statusBarHeader}>
                <Text style={styles.statusBarTitle}>Заполнение коробки</Text>
                <Text style={styles.statusBarValue}>
                  {boxInfo.productsInBox} из {boxInfo.limitProductsInBox}
                </Text>
              </View>
              <View style={styles.statusBar}>
                <View
                  style={[
                    styles.statusBarFill,
                    { width: `${getFillPercentage()}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Поле ввода по центру оставшейся части экрана */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.manualWorkInput}
            value=""
            onChangeText={setCode}
            onSubmitEditing={handleSubmit}
            onKeyPress={handleKeyPress}
            placeholder={
              requestQueue.length > 0
                ? `Очередь: ${requestQueue.length} | Введите код...`
                : 'Введите код'
            }
            placeholderTextColor="#999"
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus={true}
            returnKeyType="done"
            blurOnSubmit={false}
            editable={requestQueue.length < MAX_QUEUE_SIZE}
          />
        </View>

        {/* Кастомный алерт */}
        <CustomAlert
          visible={showCustomAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={handleAlertClose}
          autoCloseTime={alertConfig.type === 'success' ? 100 : undefined}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};
