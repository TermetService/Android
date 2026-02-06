// src/screens/ActionsModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { ApiService } from '../../services/api';

interface ActionsModalProps {
    visible: boolean;
    onClose: () => void;
    searchData: any;
    onDeleteSuccess?: () => void; // Коллбек при успешном удалении
}

export const ActionsModal: React.FC<ActionsModalProps> = ({
    visible,
    onClose,
    searchData,
    onDeleteSuccess,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // Функция подтверждения удаления
    const confirmDeleteBox = () => {
        Alert.alert(
            'Удаление коробки',
            `Вы уверены, что хотите удалить коробку №${searchData.boxNumber}?`,
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                    onPress: () => console.log('Удаление отменено'),
                },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => handleDeleteBox(),
                },
            ],
            { cancelable: true }
        );
    };

    // Функция удаления коробки
    const handleDeleteBox = async () => {
        if (!searchData.boxLabel) {
            Alert.alert('Ошибка', 'У коробки нет метки для удаления');
            return;
        }

        setIsDeleting(true);

        try {
            console.log(`Попытка удаления коробки: ${searchData.boxNumber}`);

            // Вызываем метод API для удаления коробки

            const result = await ApiService.deleteBox(searchData.boxNumber);
           
            if (result.success) {
                console.log('Коробка успешно удалена:', result.message);

                // Закрываем модальное окно
                onClose();

                // Вызываем коллбек при успешном удалении
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }

                // Показываем сообщение об успехе
                Alert.alert('Успешно', result.message);
            } else {
                Alert.alert('Ошибка', result.message || 'Не удалось удалить коробку');
            }

        } catch (error) {
            console.error('Ошибка при удалении коробки:', error);
            Alert.alert(
                'Ошибка',
                error instanceof Error ? error.message : 'Неизвестная ошибка при удалении'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Действия с коробкой</Text>
                        <Text style={styles.modalSubtitle}>Коробка: {searchData.boxNumber}</Text>

                        {searchData.boxLabel && (
                            <Text style={styles.boxLabelText}>
                                Метка: {searchData.boxNumber}
                            </Text>
                        )}
                    </View>

                    <View style={styles.actionsContainer}>
                        {/* Кнопка удаления коробки */}
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={confirmDeleteBox}
                            disabled={isDeleting || !searchData.boxLabel}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.deleteButtonText}>
                                    {searchData.boxLabel ? '🗑️ Удалить коробку' : '❌ Нет метки для удаления'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {!searchData.boxLabel && (
                            <Text style={styles.warningText}>
                                Для удаления коробки необходима метка
                            </Text>
                        )}
                    </View>

                    {/* Кнопка отмены */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        disabled={isDeleting}
                    >
                        <Text style={styles.cancelButtonText}>
                            {isDeleting ? 'Отмена (загрузка...)' : 'Отмена'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    boxLabelText: {
        fontSize: 14,
        color: '#888',
        fontFamily: 'monospace',
        textAlign: 'center',
        marginTop: 4,
    },
    actionsContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        opacity: 1,
    },
    deleteButtonDisabled: {
        backgroundColor: '#FF9999',
        opacity: 0.6,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    warningText: {
        fontSize: 14,
        color: '#FF9500',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
});