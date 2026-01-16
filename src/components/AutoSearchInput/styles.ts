import { StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

export const styles = StyleSheet.create({
  container: {
    marginBottom: globalStyles.spacing.lg,
    position: 'relative',
  },
  input: {
    backgroundColor: globalStyles.colors.card,
    borderWidth: 2,
    borderColor: globalStyles.colors.primary,
    borderRadius: globalStyles.borderRadius.medium,
    padding: globalStyles.spacing.md,
    fontSize: 18,
    color: globalStyles.colors.text,
    minHeight: 55,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
  loaderContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: globalStyles.spacing.sm,
    gap: globalStyles.spacing.sm,
  },
  loaderText: {
    fontSize: 14,
    color: globalStyles.colors.secondary,
  },
  disabled: {
    opacity: 0.6,
  },
});