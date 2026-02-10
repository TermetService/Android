import { StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

export const styles = StyleSheet.create({
  container: {
    marginTop: globalStyles.spacing.lg,
    marginBottom: globalStyles.spacing.lg,
  },
  successContainer: {
    backgroundColor: '#E8F7EF',
    padding: globalStyles.spacing.lg,
    borderRadius: globalStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  // errorContainer: {
  //   backgroundColor: '#FFEEEE',
  //   padding: globalStyles.spacing.lg,
  //   borderRadius: globalStyles.borderRadius.medium,
  //   borderWidth: 1,
  //   borderColor: '#FF3B30',
  // },
  loadingContainer: {
    backgroundColor: globalStyles.colors.card,
    padding: globalStyles.spacing.lg,
    borderRadius: globalStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: globalStyles.spacing.sm,
  },
  icon: {
    marginRight: globalStyles.spacing.sm,
    fontSize: 18,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  successText: {
    color: '#1C1C1E',
  },
  // errorText: {
  //   color: '#1C1C1E',
  // },
  loadingText: {
    color: globalStyles.colors.secondary,
  },
  typeRow: {
    marginTop: globalStyles.spacing.sm,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },

  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D70015',
  },
});