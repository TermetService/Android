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

export const ManualWorkModal: React.FC<ManualWorkModalProps> = ({ visible, onClose }) => {
    const [code, setCode] = useState('');
    const [boxInfo, setBoxInfo] = useState<BoxInfo | null>(null);
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error',
    });
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const title = Config.USER_ID;
    const serverUrl = Config.SERVER_URL;

    const inputRef = useRef<TextInput>(null);

    const pingServer = async () => {
        try {
            setServerStatus('checking');
            const startTime = Date.now();

            // Создаем контроллер для отмены запроса
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            const response = await fetch(`${serverUrl}/code/ping`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });

            // Очищаем таймаут, если запрос выполнился раньше
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
                        limitProductsInBox: parseInt(result.data.limitProductsInBox) || 2
                    });
                }
            }
        }
        get()

    }, []);

    // Обработка отправки кода
    const handleSubmit = async () => {
        const trimmedCode = code.trim();
        if (!trimmedCode) return;

        // Мгновенная очистка поля и возврат фокуса
        setCode('');
        inputRef.current?.focus();

        try {
            const result = await ApiService.handSave(trimmedCode);
            console.log(`Ручное сохранение кода: ----============= ${JSON.stringify(result)}`);

            // Обновляем информацию о коробке из ответа
            if (result.success && result.data?.result) {
                setBoxInfo({
                    boxNumber: result.data.result.boxNumber,
                    palletNumber: result.data.result.palletNumber,
                    productsInBox: result.data.result.productsInBox,
                    limitProductsInBox: parseInt(result.data.result.limitProductsInBox) || 2
                });
            }

            // Настраиваем кастомный алерт в зависимости от результата
            if (result.success) {
                setAlertConfig({
                    title: '✅ Успешно',
                    message: result.message,
                    type: 'success',
                });
            } else {
                setAlertConfig({
                    title: '⚠️ Ошибка',
                    message: result.message,
                    type: 'error',
                });
            }

            setShowCustomAlert(true);

        } catch (error) {
            setAlertConfig({
                title: '❌ Ошибка',
                message: 'Произошла ошибка при сохранении кода',
                type: 'error',
            });
            setShowCustomAlert(true);
        }
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
        // Не нужно очищать и фокусить, так как это уже сделано в handleSubmit
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
                        <Text style={styles.modalOperatorTitle}>
                            Оператор №{title}
                        </Text>
                        <TouchableOpacity
                            onPress={pingServer}
                            style={styles.serverInfoButton}
                            disabled={serverStatus === 'checking'}
                        >
                            <Text style={[
                                styles.serverInfoText,
                                serverStatus === 'offline' && styles.serverInfoTextOffline,
                                serverStatus === 'online' && styles.serverInfoTextOnline,
                            ]}>
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
                                <Text style={styles.statusBarTitle}>
                                    Заполнение коробки
                                </Text>
                                <Text style={styles.statusBarValue}>
                                    {boxInfo.productsInBox} из {boxInfo.limitProductsInBox}
                                </Text>
                            </View>
                            <View style={styles.statusBar}>
                                <View
                                    style={[
                                        styles.statusBarFill,
                                        { width: `${getFillPercentage()}%` }
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
                        value={code}
                        onChangeText={setCode}
                        onSubmitEditing={handleSubmit}
                        onKeyPress={handleKeyPress}
                        placeholder="Введите код"
                        placeholderTextColor="#999"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        autoFocus={true}
                        returnKeyType="done"
                        blurOnSubmit={false}
                    />
                </View>

                {/* Кастомный алерт */}
                <CustomAlert
                    visible={showCustomAlert}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                    onClose={handleAlertClose}
                    autoCloseTime={alertConfig.type === 'success' ? 50 : undefined}
                />
            </KeyboardAvoidingView>
        </Modal>
    );
};