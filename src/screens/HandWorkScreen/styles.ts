// src/screens/styles.ts
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Заголовок экрана
  screenHeader: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    minHeight: height * 0.7,
  },
  
  // Кнопка "Начать ручную работу"
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 48,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Стили для модального окна ручной работы
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  
  // Поле ввода для ручной работы
  manualWorkInput: {
    width: '100%',
    maxWidth: 300,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  inputHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Старые стили (оставляем для SearchScreen)
  content: {
    flex: 1,
    paddingTop: 40,
  },
  
  searchInput: {
    width: '100%',
    height: 60,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  searchInputDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    color: '#999',
  },
  
  actionButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});