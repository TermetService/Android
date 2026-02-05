import { StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: globalStyles.spacing.lg,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: globalStyles.borderRadius.large,
        padding: globalStyles.spacing.lg,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: globalStyles.spacing.md,
        textAlign: 'center',
    },
    boxNumberText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: globalStyles.spacing.lg,
    },
    inputContainer: {
        marginBottom: globalStyles.spacing.lg,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: globalStyles.borderRadius.medium,
        padding: globalStyles.spacing.md,
        fontSize: 16,
        color: '#1C1C1E',
        minHeight: 50,
        textAlign: 'center',
    },
    instruction: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: globalStyles.spacing.sm,
        fontStyle: 'italic',
    },
    cancelButton: {
        marginTop: globalStyles.spacing.md,
        paddingVertical: globalStyles.spacing.md,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    cancelText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
});