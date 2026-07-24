// styles.ts
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalOperatorTitle: {
    fontSize: 18,
    color: '#000000',
    marginLeft: 50,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },

  serverInfoButton: {
    marginTop: 4,
    padding: 2,
  },

  serverInfoText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },

  serverInfoTextOnline: {
    color: '#4CAF50', // Зеленый для онлайн статуса
  },

  serverInfoTextOffline: {
    color: '#F44336', // Красный для офлайн статуса
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  // Информация о коробке (вверху)
  boxInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boxIconWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  boxIcon: {
    width: 70,
    height: 70,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 8,
  },
  boxNumberText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  palletInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBarContainer: {
    width: '100%',
  },
  statusBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBarTitle: {
    fontSize: 14,
    color: '#666',
  },
  statusBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  // Поле ввода (по центру)
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  manualWorkInput: {
    width: '100%',
    height: 48, // Уменьшил высоту
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 18, // Уменьшил размер шрифта
    backgroundColor: '#fff',
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1, // Уменьшил межбуквенный интервал
  },
  stageBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  stageBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  stageBadgeActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stageBadgePending: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  stageBadgeDone: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  stageBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  stageBadgeTextActive: {
    color: '#fff',
  },
  stageBadgeArrow: {
    paddingHorizontal: 8,
  },
  stageBadgeArrowText: {
    fontSize: 18,
    color: '#999',
  },
  stageHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginTop: 8,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  manualWorkInputDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    color: '#aaa',
  },
  resetButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    gap: 12,
  },
  closeActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBoxButton: {
    backgroundColor: '#2196F3',
  },
  closePalletButton: {
    backgroundColor: '#FF9800',
  },
  closeActionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  productAddedBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  productAddedBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});