import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  taskSelectionContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  taskSelectionSection: {
    marginBottom: 24,
  },

  taskSelectionSectionTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },

  taskSelectionTaskCard: {
    padding: 20,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  taskSelectionTaskTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },

  taskSelectionTaskInfo: {
    marginBottom: 4,
    fontSize: 15,
    color: '#555555',
  },

  taskSelectionTaskDescription: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#777777',
  },

  taskSelectionContinueButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },

  taskSelectionStartButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },

  taskSelectionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  taskSelectionEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },

  taskSelectionEmptyText: {
    fontSize: 16,
    color: '#777777',
  },

  taskSelectionError: {
    padding: 14,
    marginBottom: 20,
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 8,
  },

  taskSelectionErrorText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#721c24',
  },

  taskSelectionLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskSelectionLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
});