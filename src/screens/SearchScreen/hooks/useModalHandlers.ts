import { Alert } from 'react-native';
import { ApiService } from '../../../services/api';

interface UseModalHandlersProps {
    lastSearchedCode?: string;
    foundCodeData?: any;
    stopTimer?: () => void;
    resetSearch?: () => void;
    setModalVisible: (visible: boolean) => void;
    setLabelModalVisible: (visible: boolean) => void;
    setAddToBoxModalVisible: (visible: boolean) => void;
}

export const useModalHandlers = ({
    lastSearchedCode,
    foundCodeData,
    stopTimer,
    resetSearch,
    setModalVisible,
    setLabelModalVisible,
    setAddToBoxModalVisible,
}: UseModalHandlersProps) => {
    const handleAddToPackage = async () => {
        // Останавливаем таймер если он есть
        if (stopTimer) {
            stopTimer();
        }

        if (!lastSearchedCode || lastSearchedCode.trim() === '') {
            Alert.alert('Ошибка', 'Нет кода для добавления');
            return;
        }

        try {
            console.log('Отправка кода на ручное сохранение:', lastSearchedCode);

            // Отправляем код на сервер
            const result = await ApiService.handSave(lastSearchedCode);

            console.log('Результат ручного сохранения:', result);

            // ПРИОРИТЕТ: сначала message с сервера, потом стандартные сообщения
            if (result.success === true) {
                // Если есть message от сервера - используем его
                const successMessage = result.message || 'Код добавлен в упаковку';
                Alert.alert('✅ Успешно', successMessage);
            } else {
                // Если есть message от сервера - используем его
                const errorMessage = result.message ||
                    (result.data?.isAddCode === false
                        ? 'Код не был добавлен'
                        : 'Не удалось добавить код');

                Alert.alert('❌ Не удалось', errorMessage);
            }
        } catch (error: any) {
            Alert.alert('❌ Ошибка', error.message || 'Не удалось отправить код на сервер');
        }
    };

    const handleDeleteCode = async (code: string): Promise<boolean> => {
        try {
            console.log('Удаление кода:', code);

            const result = await ApiService.deleteCode(code);

            console.log('Результат удаления:', result);

            if (result.success === true || result.message === 'Код успешно удален') {
                Alert.alert('✅ Успешно', 'Код удален');
                // Сбрасываем поиск если функция есть
                if (resetSearch) {
                    resetSearch();
                }
                return true;
            } else {
                Alert.alert('❌ Ошибка', result.message || 'Не удалось удалить код');
                return false;
            }
        } catch (error: any) {
            console.error('Ошибка при удалении:', error);
            Alert.alert('❌ Ошибка', error.message || 'Не удалось удалить код');
            return false;
        }
    };

    const handleBindLabel = async (boxLabel: string) => {
        try {
            // Получаем номер коробки из найденных данных
            const boxNumber = foundCodeData?.code?.box_number;

            if (!boxNumber) {
                Alert.alert('Ошибка', 'Не найден номер упаковки');
                setLabelModalVisible(false);
                return;
            }

            console.log('Привязка этикетки:', { boxLabel, boxNumber });

            // Отправляем запрос
            const result = await ApiService.bindLabelToBox(boxLabel, boxNumber);

            console.log('Результат привязки этикетки:', result);

            // Проверяем успешность
            if (result.success === true || result.message?.toLowerCase().includes('успешно')) {
                Alert.alert('✅ Успешно', 'Этикетка привязана');
                setLabelModalVisible(false);
            } else {
                Alert.alert('❌ Ошибка', result.message || 'Не удалось привязать этикетку');
            }
        } catch (error: any) {
            console.error('Ошибка привязки этикетки:', error);
            Alert.alert('❌ Ошибка', error.message || 'Не удалось привязать этикетку');
        }
    };

    const handleActionPress = async (action: 'delete' | 'add' | 'label') => {
        if (action === 'delete') {
            const codeToDelete = foundCodeData?.code?.code || lastSearchedCode;

            if (!codeToDelete) {
                Alert.alert('Ошибка', 'Не найден код для удаления');
                return;
            }

            Alert.alert(
                'Подтверждение удаления',
                'Вы уверены, что хотите удалить этот код?',
                [
                    {
                        text: 'Отмена',
                        style: 'cancel',
                    },
                    {
                        text: 'Удалить',
                        style: 'destructive',
                        onPress: async () => {
                            await handleDeleteCode(codeToDelete);
                            setModalVisible(false);
                        }
                    }
                ]
            );
        } else if (action === 'add') {
            // Открываем модальное окно для добавления кода в коробку
            setModalVisible(false); // Закрываем основное модальное окно
            setTimeout(() => setAddToBoxModalVisible(true), 300);
        } else if (action === 'label') {
            setModalVisible(false);
            setTimeout(() => setLabelModalVisible(true), 300);
        }
    };

    const handleAddToBox = async (productCode: string) => {
        try {
            // Получаем номер коробки из найденных данных
            const boxNumber = foundCodeData?.code?.box_number;

            if (!boxNumber) {
                Alert.alert('Ошибка', 'Не найден номер упаковки');
                setAddToBoxModalVisible(false);
                return;
            }

            console.log('Добавление кода в упаковку:', { productCode, boxNumber });

            // Отправляем запрос на сервер
            const result = await ApiService.addCodeToBox(productCode, boxNumber);

            console.log('Результат добавления в упаковку:', result);
            Alert.alert('-----------add code', `Response: ${JSON.stringify(result)}`);

            // Проверяем успешность на основе нового формата ответа
            // Если есть data с code и id, считаем операцию успешной
            if (result.data && result.data.code && result.data.id) {
                Alert.alert('✅ Успешно', 'Код добавлен в упаковку');
                setAddToBoxModalVisible(false);
            }
            // Оставляем старую проверку для обратной совместимости
            else if (result.success === true || result.message?.toLowerCase().includes('успешно')) {
                Alert.alert('✅ Успешно', 'Код добавлен в упаковку');
                setAddToBoxModalVisible(false);
            } else {
                Alert.alert('❌ Ошибка', result.message || 'Не удалось добавить код в упаковку');
            }
        } catch (error: any) {
            console.error('Ошибка при добавлении в упаковку:', error);
            Alert.alert('❌ Ошибка', error.message || 'Не удалось добавить код в упаковку');
        }
    };

    const shouldShowActions = (searchResult: any, loading: boolean, foundCodeData: any): boolean => {
        if (!searchResult?.success || loading) return false;

        // Если from: 'box' - не показываем кнопку действий
        if (foundCodeData?.from === 'box') return false;

        // Старая логика проверки типа кода
        if (foundCodeData?.code?.type) {
            return foundCodeData.code.type.toLowerCase().includes('код') ||
                foundCodeData.code.type === 'code';
        }

        if (foundCodeData?.type) {
            return foundCodeData.type.toLowerCase().includes('код') ||
                foundCodeData.type === 'code';
        }

        return !!(foundCodeData?.code?.code);
    };

    return {
        handleAddToPackage,
        handleDeleteCode,
        handleBindLabel,
        handleActionPress,
        handleAddToBox,
        shouldShowActions,
    };
};