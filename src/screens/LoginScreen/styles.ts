import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loginContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  loginCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  loginTitle: {
    marginBottom: 6,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },

  loginSubtitle: {
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#777',
  },

  loginForm: {
    marginBottom: 8,
  },

  loginLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },

  loginInput: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 8,
    fontSize: 15,
    color: '#333',
  },

  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 8,
    paddingVertical: 11,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  loginError: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 8,
  },

  loginErrorText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#721c24',
  },

  loginLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },

  loginLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
