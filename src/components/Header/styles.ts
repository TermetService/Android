// src/components/BurgerMenu/styles.ts
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
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
});