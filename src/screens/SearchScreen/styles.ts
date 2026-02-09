// src/screens/styles.ts
import { StyleSheet, Platform } from 'react-native';

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
    paddingTop: 40, 
    flexGrow: 1,
  },
  
  content: {
    flex: 1,
    paddingTop: 40, // Добавим отступ сверху для поля ввода
  },
  
  // Контейнер по центру экрана
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 30, // Отступ для кнопки действия
  },
  
  // Поле ввода поиска
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
  
  // Стиль для disabled состояния
  searchInputDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    color: '#999',
  },
  
  // Контейнер для кнопки действия
  actionButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  // Кнопка действия
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