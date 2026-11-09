// styles.ts
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalOperatorTitle: {
    fontSize: 18,
    color: '#111827',
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
    color: '#666666',
    fontFamily: 'monospace',
  },

  serverInfoTextOnline: {
    color: '#16A34A',
  },

  serverInfoTextOffline: {
    color: '#DC2626',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },

  closeButton: {
    padding: 10,
  },

  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },

  // Информация о коробке

  boxInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000000',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 8,
  },

  boxNumberText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  palletInfo: {
    fontSize: 14,
    color: '#666666',
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
    color: '#666666',
  },

  statusBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  statusBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },

  statusBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },

  // Основная область

  contentArea: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // Текущее действие

  expectedScanContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#D97706',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },

  expectedScanTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 8,
  },

  expectedScanValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#D97706',
    textAlign: 'center',
  },

  expectedScanInstruction: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  expectedScanInstructionText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Поле сканирования

  inputWrapper: {
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 0,
    alignItems: 'center',
  },

  manualWorkInput: {
    width: '100%',
    height: 54,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 17,
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },

  fillProgressPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  fillProgressPanelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  fillProgressItem: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  fillProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fillProgressLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
  },

  fillProgressValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },

  fillProgressStatusRow: {
    flexDirection: 'row',
    marginTop: 7,
  },

  fillProgressStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  fillProgressStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  fillProgressStatusText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  fillProgressContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },

  fillProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  fillProgressTrack: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },

  fillProgressBar: {
    height: '100%',
    borderRadius: 5,
  },

  fillProgressPercent: {
    marginTop: 5,
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
});
