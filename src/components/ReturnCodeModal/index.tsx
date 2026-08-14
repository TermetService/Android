// components/ReturnCodeModal/index.tsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import { ReturnCodeModalProps } from './types';

export const ReturnCodeModal: React.FC<ReturnCodeModalProps> = ({
    visible,
    code,
    onConfirm,
    onCancel,
    loading = false,
}) => {
    const [confirmEnabled, setConfirmEnabled] = useState(false);
    const [timer, setTimer] = useState(3);

    useEffect(() => {
        if (visible) {
            setConfirmEnabled(false);
            setTimer(3);

            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setConfirmEnabled(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setConfirmEnabled(false);
            setTimer(3);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>⚠️ Подтверждение возврата</Text>

                    <Text style={styles.message}>
                        Вы уверены, что хотите вернуть код?
                    </Text>

                    <Text style={styles.warning}>
                        После возврата код можно будет использовать для перепечати
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Отмена</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                (!confirmEnabled || loading) && styles.disabledButton
                            ]}
                            onPress={onConfirm}
                            disabled={!confirmEnabled || loading}
                        >
                            <Text style={styles.confirmButtonText}>
                                {loading ? 'Возврат...' :
                                    confirmEnabled ? '✅ Да, вернуть' :
                                        `⏳ Подождите ${timer}с`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: globalStyles.borderRadius.large || 20,
        padding: 24,
        width: '85%',
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginBottom: 16,
    },
    message: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 12,
    },
    codeText: {
        fontSize: 14,
        color: '#666',
        backgroundColor: '#F5F5F5',
        padding: 8,
        borderRadius: 8,
        width: '100%',
        textAlign: 'center',
        marginBottom: 12,
    },
    warning: {
        fontSize: 14,
        color: '#FF9500',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: globalStyles.borderRadius.medium || 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    confirmButton: {
        backgroundColor: '#34C759',
    },
    disabledButton: {
        opacity: 0.5,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});