import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  taskSelectionContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },

  taskSelectionSection: {
    marginBottom: 16,
  },

  taskSelectionSectionTitle: {
    marginBottom: 8,
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },

  taskSelectionTaskCard: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  taskSelectionCurrentTaskCard: {
    backgroundColor: '#f0f9f1',
    borderColor: '#4caf50',
    borderWidth: 2,
  },

  taskSelectionCurrentTaskBadge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: '#d9f0dd',
    color: '#24783a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  taskSelectionTaskTitle: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  taskSelectionTaskInfo: {
    marginBottom: 2,
    fontSize: 13,
    color: '#555',
  },

  taskSelectionTaskDescription: {
    marginTop: 5,
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#777',
  },

  taskSelectionContinueButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },

  taskSelectionStartButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },

  taskSelectionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  taskSelectionEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },

  taskSelectionEmptyText: {
    fontSize: 14,
    color: '#777',
  },

  taskSelectionError: {
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 8,
  },

  taskSelectionErrorText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#721c24',
  },

  taskSelectionLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskSelectionLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
