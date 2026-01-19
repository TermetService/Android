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
    marginBottom: globalStyles.spacing.lg,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: globalStyles.spacing.md,
    paddingHorizontal: globalStyles.spacing.sm,
    borderRadius: globalStyles.borderRadius.small,
    marginBottom: globalStyles.spacing.sm,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  addButton: {
    backgroundColor: '#E8F5E9',
  },
  labelButton: {
    backgroundColor: '#E3F2FD',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: globalStyles.spacing.sm,
    width: 30,
    textAlign: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteText: {
    color: '#D32F2F',
  },
  addText: {
    color: '#388E3C',
  },
  labelText: {
    color: '#1976D2',
  },
  cancelButton: {
    marginTop: globalStyles.spacing.lg,
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