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

type ScanStage = 'barcode' | 'qr';
type LastSaved = 'barcode' | 'qr' | null;

interface QueueItem {
  code: string;
  stage: ScanStage;
}

export const ManualWorkModal: React.FC<ManualWorkModalProps> = ({
  visible,
  onClose,
}) => {
  const [barcodeValue, setBarcodeValue] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [stage, setStage] = useState<ScanStage>('barcode');
  const [lastSaved, setLastSaved] = useState<LastSaved>(null);
  const [boxInfo, setBoxInfo] = useState<BoxInfo | null>(null);
  const [productAddedBanner, setProductAddedBanner] = useState<string | null>(
    null,
  );
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [serverStatus, setServerStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestQueue, setRequestQueue] = useState<QueueItem[]>([]);
  const [isClosingBox, setIsClosingBox] = useState(false);
  const [isClosingPallet, setIsClosingPallet] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const MAX_QUEUE_SIZE = 10;

  const serverUrl = Config.SERVER_URL;

  const barcodeInputRef = useRef<TextInput>(null);
  const qrInputRef = useRef<TextInput>(null);
  const productBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const pingServer = async () => {
    try {
      setServerStatus('checking');
      const startTime = Date.now();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${serverUrl}/code/ping`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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

  const playBeep = (type: 'success' | 'error') => {
    console.log(`${type === 'success' ? '✓' : '✗'}`);
  };

  useEffect(() => {
    if (visible) {
      pingServer();
      const intervalId = setInterval(pingServer, 30000);
      return () => clearInterval(intervalId);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setBoxInfo(null);
      setBarcodeValue('');
      setQrValue('');
      setStage('barcode');
      setLastSaved(null);
      setProductAddedBanner(null);
      setServerStatus('checking');
      setRequestQueue([]);
      if (productBannerTimerRef.current) {
        clearTimeout(productBannerTimerRef.current);
        productBannerTimerRef.current = null;
      }
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (productBannerTimerRef.current) {
        clearTimeout(productBannerTimerRef.current);
      }
    };
  }, []);

  const showProductAddedBanner = (text: string) => {
    setProductAddedBanner(text);
    if (productBannerTimerRef.current) {
      clearTimeout(productBannerTimerRef.current);
    }
    productBannerTimerRef.current = setTimeout(() => {
      setProductAddedBanner(null);
      productBannerTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    const processQueue = async () => {
      if (requestQueue.length > 0 && !isSubmitting) {
        setIsSubmitting(true);
        const current = requestQueue[0];

        try {
          // ВАЖНО: Очищаем буфер перед каждым bar-кодом
          if (current.stage === 'barcode') {
            console.log(
              'Очистка буфера перед обработкой bar-кода:',
              current.code,
            );
            await ApiService.clearBuffer();
          }

          const result = await ApiService.handSave(current.code);

          console.log('resultresultresultresultresultresultresult', result);

          setRequestQueue(prev => prev.slice(1));
          playBeep(result.success ? 'success' : 'error');

          const save = result.data?.result?.save;

          if (!result.success) {
            setLastSaved(null);
            setAlertConfig({
              title: '⚠️ Ошибка',
              message: result.message,
              type: 'error',
            });

            setBarcodeValue('');
            setQrValue('');
            // Очищаем буфер после ошибки
            await ApiService.clearBuffer();
            setShowCustomAlert(true);
          } else if (save === 'BAR') {
            // штрихкод принят, бэк ждёт QR с массой
            setLastSaved('barcode');
            setStage('qr');
            setAlertConfig({
              title: '✓ Штрихкод сохранён',
              message: 'Теперь отсканируйте QR-код с массой',
              type: 'success',
            });
            setShowCustomAlert(true);
          } else if (save === 'BARanqQR') {
            // пара сохранена полностью — продукт добавлен в коробку
            setLastSaved('qr');
            setStage('barcode');

            setBarcodeValue('');
            setQrValue('');

            let newBoxNumber = boxInfo?.boxNumber;
            let newProductsInBox = boxInfo?.productsInBox;

            if (result.data?.result?.boxNumber) {
              newBoxNumber = result.data.result.boxNumber;
              newProductsInBox = result.data.result.productsInBox;
              setBoxInfo({
                boxNumber: result.data.result.boxNumber,
                palletNumber: result.data.result.palletNumber,
                productsInBox: result.data.result.productsInBox,
                limitProductsInBox:
                  parseInt(result.data.result.limitProductsInBox) || 2,
              });
            }

            showProductAddedBanner(
              newBoxNumber
                ? `✓ Продукт добавлен в коробку №${newBoxNumber} (${newProductsInBox})`
                : '✓ Продукт успешно добавлен',
            );

            setAlertConfig({
              title: '✓ Код сохранён',
              message:
                'Вы можете перейти в отгрузку и увидеть текущий вес коробки',
              type: 'success',
            });

            // Очищаем буфер после успешного сохранения пары
            await ApiService.clearBuffer();

            setShowCustomAlert(true);
          } else if (save === 'QR') {
            setStage('barcode');
            setLastSaved(null);

            setQrValue('');
            // Очищаем буфер, если QR пришел без пары
            await ApiService.clearBuffer();
          }
        } catch (error) {
          playBeep('error');
          setLastSaved(null);
          setAlertConfig({
            title: '❌ Ошибка',
            message: 'Ошибка соединения с сервером',
            type: 'error',
          });
          // Очищаем буфер при ошибке соединения
          await ApiService.clearBuffer();
          setShowCustomAlert(true);
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    processQueue();
  }, [requestQueue, isSubmitting]);

  useEffect(() => {
    if (stage === 'qr') {
      const timer = setTimeout(() => qrInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => barcodeInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const [canScan, setCanScan] = useState(true);
  const SCAN_DELAY = 100;

  const submitStage = (rawValue: string, expectedStage: ScanStage) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;

    if (!canScan) {
      playBeep('error');
      setAlertConfig({
        title: '⚠️ Слишком быстро',
        message: 'Подождите перед следующим сканированием',
        type: 'error',
      });
      setShowCustomAlert(true);
      return;
    }

    if (requestQueue.length >= MAX_QUEUE_SIZE) {
      playBeep('error');
      setAlertConfig({
        title: '⚠️ Переполнение',
        message: 'Очередь переполнена. Дождитесь обработки',
        type: 'error',
      });
      setShowCustomAlert(true);
      return;
    }

    // Для bar-кодов сразу очищаем буфер перед добавлением в очередь
    if (expectedStage === 'barcode') {
      ApiService.clearBuffer().catch(err =>
        console.log('Ошибка при очистке буфера:', err),
      );
    }

    setRequestQueue(prev => [...prev, { code: trimmed, stage: expectedStage }]);
    setCanScan(false);

    if (expectedStage === 'barcode') {
      setBarcodeValue('');
    } else {
      setQrValue('');
    }

    setTimeout(() => setCanScan(true), SCAN_DELAY);
    playBeep('success');
  };

  const handleBarcodeSubmit = () => submitStage(barcodeValue, 'barcode');
  const handleQrSubmit = () => submitStage(qrValue, 'qr');

  const handleBarcodeKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') handleBarcodeSubmit();
  };
  const handleQrKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') handleQrSubmit();
  };

  const handleResetBuffer = async () => {
    setIsResetting(true);
    try {
      const result = await ApiService.clearBuffer();
      setStage('barcode');
      setLastSaved(null);
      setBarcodeValue('');
      setQrValue('');
      setRequestQueue([]);
      setAlertConfig({
        title: result.success === false ? '⚠️ Ошибка' : '✓ Сброшено',
        message:
          result.success === false
            ? result.message || 'Не удалось сбросить буфер'
            : 'Буфер очищен, начните сканирование заново',
        type: result.success === false ? 'error' : 'success',
      });
      setShowCustomAlert(true);
    } catch (error) {
      setAlertConfig({
        title: '❌ Ошибка',
        message: 'Не удалось сбросить буфер',
        type: 'error',
      });
      setShowCustomAlert(true);
    } finally {
      setIsResetting(false);
    }
  };

  const handleAlertClose = () => setShowCustomAlert(false);

  const getFillPercentage = (): number => {
    if (!boxInfo) return 0;
    return (boxInfo.productsInBox / boxInfo.limitProductsInBox) * 100;
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
        <View style={styles.modalHeader}>
          <View style={styles.infoContainer}>
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

        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Режим ручной работы</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {renderQueueStatus()}

        {/* Баннер подтверждения добавления продукта в коробку */}
        {productAddedBanner && (
          <View style={styles.productAddedBanner}>
            <Text style={styles.productAddedBannerText}>
              {productAddedBanner}
            </Text>
          </View>
        )}

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

        {/* Индикатор стадии сканирования с отметкой что сохранено */}
        <View style={styles.stageBadgeContainer}>
          <View
            style={[
              styles.stageBadge,
              stage === 'barcode'
                ? styles.stageBadgeActive
                : styles.stageBadgeDone,
            ]}
          >
            <Text
              style={[
                styles.stageBadgeText,
                stage === 'barcode' && styles.stageBadgeTextActive,
              ]}
            >
              {stage !== 'barcode' ? '✓ ' : ''}1. Код товара
            </Text>
          </View>
          <View style={styles.stageBadgeArrow}>
            <Text style={styles.stageBadgeArrowText}>→</Text>
          </View>
          <View
            style={[
              styles.stageBadge,
              stage === 'qr'
                ? styles.stageBadgeActive
                : styles.stageBadgePending,
            ]}
          >
            <Text
              style={[
                styles.stageBadgeText,
                stage === 'qr' && styles.stageBadgeTextActive,
              ]}
            >
              2. Код массы (QR)
            </Text>
          </View>
        </View>

        <Text style={styles.stageHint}>
          {stage === 'barcode'
            ? 'Ожидается: штрихкод товара'
            : 'Ожидается: QR-код с массой'}
        </Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.fieldLabel}>Код товара</Text>
          <TextInput
            ref={barcodeInputRef}
            style={[
              styles.manualWorkInput,
              stage !== 'barcode' && styles.manualWorkInputDisabled,
            ]}
            value={barcodeValue}
            onChangeText={setBarcodeValue}
            onSubmitEditing={handleBarcodeSubmit}
            onKeyPress={handleBarcodeKeyPress}
            placeholder="Отсканируйте штрихкод"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            blurOnSubmit={false}
            editable={
              stage === 'barcode' && requestQueue.length < MAX_QUEUE_SIZE
            }
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
            Код массы (QR)
          </Text>
          <TextInput
            ref={qrInputRef}
            style={[
              styles.manualWorkInput,
              stage !== 'qr' && styles.manualWorkInputDisabled,
            ]}
            value={qrValue}
            onChangeText={setQrValue}
            onSubmitEditing={handleQrSubmit}
            onKeyPress={handleQrKeyPress}
            placeholder="Отсканируйте QR с массой"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            blurOnSubmit={false}
            editable={stage === 'qr' && requestQueue.length < MAX_QUEUE_SIZE}
          />

          {stage === 'qr' && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetBuffer}
              disabled={isResetting}
            >
              <Text style={styles.resetButtonText}>
                {isResetting ? 'Сброс...' : '↺ Сбросить и начать заново'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <CustomAlert
          visible={showCustomAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={handleAlertClose}
          autoCloseTime={alertConfig.type === 'success' ? 2000 : undefined}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};
