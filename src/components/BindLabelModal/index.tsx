import React, { useState, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { BindLabelModalProps } from './types';
import { styles } from './styles';

export const BindLabelModal: React.FC<BindLabelModalProps> = ({
    visible,
    onClose,
    onBind,
    loading = false,
    boxNumber,
}) => {
    const [label, setLabel] = useState('');
    const inputRef = useRef<TextInput>(null);

    const handleSubmit = async () => {
        if (label.trim() && !loading) {
            await onBind(label.trim());
            setLabel(''); // Очищаем поле после отправки
        }
    };

    const handleClose = () => {
        setLabel(''); // Очищаем поле при закрытии
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
            onShow={() => {
                // Автофокус при открытии модалки
                setTimeout(() => inputRef.current?.focus(), 100);
            }}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>🏷️ Привязать этикетку</Text>

                            {boxNumber && (
                                <Text style={styles.boxNumberText}>
                                    Коробка №{boxNumber}
                                </Text>
                            )}

                            <View style={styles.inputContainer}>
                                <TextInput
                                    ref={inputRef}
                                    style={[styles.input, loading && { opacity: 0.6 }]}
                                    placeholder="Введите текст этикетки..."
                                    placeholderTextColor="#8E8E93"
                                    value={label}
                                    onChangeText={setLabel}
                                    onSubmitEditing={handleSubmit}
                                    editable={!loading}
                                    autoFocus={true}
                                    returnKeyType="done"
                                    blurOnSubmit={false}
                                    maxLength={100}
                                />

                                <Text style={styles.instruction}>
                                    Нажмите Enter для отправки
                                </Text>
                            </View>

                            {loading && (
                                <ActivityIndicator size="small" color="#007AFF" />
                            )}

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleClose}
                                disabled={loading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelText}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};