import { StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F4FF',
    padding: globalStyles.spacing.lg,
    borderRadius: globalStyles.borderRadius.medium,
    alignItems: 'center' as const,
    marginBottom: globalStyles.spacing.lg,
    borderWidth: 1,
    borderColor: globalStyles.colors.primary,
  },
  placeholderContainer: {
    backgroundColor: globalStyles.colors.card,
    padding: globalStyles.spacing.lg,
    borderRadius: globalStyles.borderRadius.medium,
    alignItems: 'center' as const,
    marginBottom: globalStyles.spacing.lg,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    borderStyle: 'dashed' as const,
  },
  label: {
    fontSize: 13,
    color: '#7c7c7c',
    marginBottom: globalStyles.spacing.xs,
  },
  code: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: globalStyles.colors.primary,
    letterSpacing: 2,
  },
  timestamp: {
    fontSize: 12,
    color: globalStyles.colors.secondary,
    marginTop: globalStyles.spacing.xs,
  },
  placeholderText: {
    fontSize: 14,
    color: globalStyles.colors.secondary,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
});