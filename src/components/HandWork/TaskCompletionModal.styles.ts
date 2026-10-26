import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    modal: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
},

header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
},

headerText: {
    flex: 1,
    paddingRight: 10,
},

title: {
    color: '#222',
    fontSize: 25,
    fontWeight: '700',
},

subtitle: {
    color: '#666',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
},

headerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
},

headerCloseText: {
    color: '#333',
    fontSize: 28,
    fontWeight: '600',
},

scrollView: {
    flex: 1,
    marginTop: 12,
},

content: {
    paddingBottom: 14,
},

summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
},

summaryLabel: {
    color: '#555',
    fontSize: 16,
},

summaryValue: {
    color: '#222',
    fontSize: 22,
    fontWeight: '700',
},

groupTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
    marginTop: 10,
    marginBottom: 12,
},

section: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
},

sectionHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f7f7f7',
},

sectionHeaderText: {
    flex: 1,
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 8,
},

countBadge: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
},

countBadgeError: {
    backgroundColor: '#ffebe9',
},

countText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '700',
},

countTextError: {
    color: '#d93025',
},

expandIcon: {
    width: 24,
    textAlign: 'right',
    marginLeft: 8,
    color: '#666',
    fontSize: 21,
},

sectionBody: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
},

codeRow: {
    color: '#333',
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
},

itemLast: {
    borderBottomWidth: 0,
},

containerItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
},

containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
},

itemLabel: {
    flex: 1,
    color: '#244b91',
    fontSize: 18,
    fontWeight: '700',
    paddingRight: 8,
},

itemValue: {
    color: '#222',
    fontSize: 17,
    fontWeight: '700',
},

progressTrack: {
    height: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
},

progressFillBase: {
    height: 8,
    borderRadius: 4,
},

progressFill: {
    backgroundColor: '#218838',
},

progressFillIncomplete: {
    backgroundColor: '#e0a126',
},

progressFillOverfilled: {
    backgroundColor: '#d93025',
},

fillStatus: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 7,
},

fillStatusFull: {
    color: '#218838',
},

fillStatusIncomplete: {
    color: '#b7791f',
},

fillStatusOverfilled: {
    color: '#d93025',
},

contentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
},

contentsButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
},

contentsList: {
    marginTop: 6,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e5e5',
},

emptyText: {
    color: '#218838',
    fontSize: 15,
    paddingVertical: 8,
},

result: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#edf7ed',
},

resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#218838',
},

resultTitleError: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a15c00',
},

resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginTop: 5,
},

footer: {
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
},

completeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
},

buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
},

disabledButton: {
    opacity: 0.55,
},

// Полные коды товаров: вертикальный список.
productCodesList: {
    gap: 10,
    paddingTop: 6,
},

codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: '#F5F6F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
},

codeIndex: {
    width: 30,
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
},

codeText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#1F2937',
},

// Номера коробок: сетка бейджей.
packageNumbersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 6,
},

packageNumberItem: {
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF1F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
},

packageNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B42318',
    fontVariant: ['tabular-nums'],
},
});