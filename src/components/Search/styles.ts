// src/screens/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  content: {
    flex: 1,
    padding: 14,
  },

  centerContainer: {
    marginBottom: 10,
    position: 'relative',
  },

  searchInput: {
    minHeight: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    color: '#333',
  },

  inputDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    opacity: 0.7,
  },

  loader: {
    position: 'absolute',
    right: 16,
    top: 20,
  },

  resultContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
  },

  resultSuccess: {
    backgroundColor: '#f0fff4',
    borderLeftColor: '#34C759',
  },

  resultError: {
    backgroundColor: '#fff5f5',
    borderLeftColor: '#FF3B30',
  },

  resultInfo: {
    backgroundColor: '#f0f8ff',
    borderLeftColor: '#007AFF',
  },

  resultMessage: {
    fontSize: 19,
    fontWeight: '500',
    color: '#333',
    lineHeight: 25,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },

  sectionSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },

  infoLabel: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    color: '#666',
  },

  infoValue: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    color: '#222',
    fontWeight: '600',
    textAlign: 'right',
  },

  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 9,
  },

  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 6,
  },

  clearButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 10,
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
});
