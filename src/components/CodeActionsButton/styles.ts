import { StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: globalStyles.spacing.md,
    paddingHorizontal: globalStyles.spacing.lg,
    borderRadius: globalStyles.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: globalStyles.spacing.lg,
    flexDirection: 'row',
    gap: globalStyles.spacing.sm,
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});