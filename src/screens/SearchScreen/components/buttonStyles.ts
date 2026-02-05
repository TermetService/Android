import { StyleSheet } from 'react-native';

export const buttonStyles = StyleSheet.create({
  continueButton: {
    backgroundColor: '#007AFF', // primary color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  continueButtonDisabled: {
    backgroundColor: '#8E8E93', // disabled color
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
});