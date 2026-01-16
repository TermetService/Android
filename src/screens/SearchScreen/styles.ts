import { StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.background,
  },
  scrollContent: {
    padding: globalStyles.spacing.lg,
    paddingBottom: globalStyles.spacing.xl,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    marginBottom: globalStyles.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...globalStyles.typography.title,
    color: globalStyles.colors.text,
    marginBottom: globalStyles.spacing.sm,
  },
  subtitle: {
    ...globalStyles.typography.subtitle,
    color: globalStyles.colors.secondary,
    textAlign: 'center',
    marginBottom: globalStyles.spacing.xs,
  },
  serverStatus: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: globalStyles.spacing.sm,
    marginTop: globalStyles.spacing.xl,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    ...globalStyles.typography.caption,
    color: globalStyles.colors.secondary,
  },
});