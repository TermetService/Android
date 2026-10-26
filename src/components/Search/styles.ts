// src/screens/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  centerContainer: {
    marginBottom: 16,
    position: 'relative',
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
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
    top: 18,
  },

  resultContainer: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
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
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },

  sectionSubtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },

  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },

  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    textAlign: 'right',
  },

  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },

  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },

  clearButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 2,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
