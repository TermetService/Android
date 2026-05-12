export const globalStyles = {
  colors: {
    primary: '#007AFF',
    secondary: '#8E8E93',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1C1C1E',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    border: '#E5E5EA',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    max: 50
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
  typography: {
    title: {
      fontSize: 28,
      fontWeight: 'bold' as const,
    },
    subtitle: {
      fontSize: 14,
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 12,
    },
  },
};