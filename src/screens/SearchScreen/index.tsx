// src/screens/SearchScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { formatSearchResponse, formatNetworkError, FormattedResponse } from './responseFormatter';
import { ApiService } from '../../services/api.ts';
import { SearchFrom } from '../../services/types.ts';
import { ActionsModal } from '../../components/ActionsModal';


export const SearchScreen = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formattedResponse, setFormattedResponse] = useState<FormattedResponse | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [boxNumber, setBoxNumber] = useState<number | undefined>();
  const [palletNumber, setPalletNumber] = useState<number | undefined>();
  const [lastSearchResult, setLastSearchResult] = useState<any>(null);
  const inputRef = useRef<TextInput>(null);
  const [codeForDel, setCodeForDel] = useState<any[]>([]);
  const [showCodeActions, setShowCodeActions] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  const [addToBoxNumber, setAddToBoxNumber] = useState('');
  const [addToPalletNumber, setAddToPalletNumber] = useState('');

  // Состояния для дополнительного поля сканирования нового кода
  const [newCodeInput, setNewCodeInput] = useState('');
  const newCodeInputRef = useRef<TextInput>(null);
  const [isAddingCode, setIsAddingCode] = useState(false);

  const clearAllStates = () => {
    setInputValue('');
    setIsLoading(false);
    setFormattedResponse(null);
    setShowActionsModal(false);
    setBoxNumber(undefined);
    setPalletNumber(undefined);
    setCodeForDel([]);
    setLastSearchResult(null);
    setShowCodeActions(false);
    setAddToBoxNumber('');
    setAddToPalletNumber('');
    setNewCodeInput('');
    setScanKey(prev => prev + 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [scanKey]);

  const handleSubmit = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    setInputValue('');
    setIsLoading(true);
    setFormattedResponse(null);
    setLastSearchResult(null);
    setShowCodeActions(false);

    try {
      const result = await ApiService.searchCode(trimmedValue);
      console.log('Результат поиска:', JSON.stringify(result, null, 2));

      setLastSearchResult(result);

      const formatted = formatSearchResponse(result);
      setFormattedResponse(formatted);

      if (result && result.code && !result.message) {
        const codeEntity = result.code;

        if (codeEntity.box_number) {
          setBoxNumber(codeEntity.box_number);
          setAddToBoxNumber(codeEntity.box_number.toString());
        }
        if (codeEntity.pallet_number) {
          setPalletNumber(codeEntity.pallet_number);
          setAddToPalletNumber(codeEntity.pallet_number.toString());
        }

        if ((result.from === SearchFrom.Code || result.from === 'code') && codeEntity.code) {
          setCodeForDel([{
            code: codeEntity.code,
            boxNumber: codeEntity.box_number || 0,
          }]);
        }
      } else {
        setBoxNumber(undefined);
        setPalletNumber(undefined);
        setCodeForDel([]);
      }

      Toast.show({
        type: formatted.type || 'info',
        text1: formatted.title || 'Результат',
        text2: formatted.message || 'Нет данных',
        position: 'bottom',
        visibilityTime: formatted.type === 'error' ? 3000 : 5000,
        text1Style: { fontSize: 16, fontWeight: 'bold' },
        text2Style: { fontSize: 14, lineHeight: 18 },
      });

    } catch (error) {
      console.log('Ошибка поиска:', error);

      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

      if (errorMessage.includes('таблица') && errorMessage.includes('не существует')) {
        const formatted: FormattedResponse = {
          title: 'ℹ️ Информация',
          message: 'Фасовка не начата. Обратитесь к оператору для начала фасовки.',
          type: 'info',
          showActionButton: false,
        };
        setFormattedResponse(formatted);

        Toast.show({
          type: 'info',
          text1: 'ℹ️ Информация',
          text2: 'Фасовка не начата',
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        const formatted = formatNetworkError();
        setFormattedResponse(formatted);

        Toast.show({
          type: 'error',
          text1: '❌ Ошибка',
          text2: errorMessage,
          position: 'bottom',
          visibilityTime: 3000,
        });
      }

      setBoxNumber(undefined);
      setPalletNumber(undefined);
      setCodeForDel([]);
      setLastSearchResult(null);

    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Добавление нового кода в текущую коробку
  const handleAddNewCode = async () => {
    const newCode = newCodeInput.trim();
    if (!newCode) {
      Alert.alert('Ошибка', 'Введите или отсканируйте код');
      return;
    }

    const targetBox = boxNumber || parseInt(addToBoxNumber, 10);
    if (!targetBox) {
      Alert.alert('Ошибка', 'Не указан номер коробки');
      return;
    }

    const targetPallet = palletNumber || (addToPalletNumber ? parseInt(addToPalletNumber, 10) : null);

    setIsAddingCode(true);
    try {
      const result = await ApiService.addCodeToBox(
        newCode,
        targetBox,
        targetPallet,
      );

      console.log('Результат добавления нового кода:', result);

      if (
        result.success !== false &&
        result.message !== 'Код уже существует' &&
        result.message !== 'Достигнут лимит коробки'
      ) {
        setNewCodeInput('');

        Alert.alert(
          '✅ Успешно',
          `Код добавлен в коробку №${targetBox}${
            targetPallet ? `, паллета №${targetPallet}` : ''
          }`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  if (newCodeInputRef.current) {
                    newCodeInputRef.current.focus();
                  }
                }, 300);
              },
            },
          ],
        );
      } else {
        setNewCodeInput('');
        Alert.alert('❌ Ошибка', result.message || 'Не удалось добавить код', [
          {
            text: 'OK',
            onPress: () => {
              setTimeout(() => {
                if (newCodeInputRef.current) {
                  newCodeInputRef.current.focus();
                }
              }, 300);
            },
          },
        ]);
      }
    } catch (error) {
      setNewCodeInput('');
      console.error('Ошибка добавления кода:', error);
      Alert.alert('❌ Ошибка', 'Не удалось добавить код');
    } finally {
      setIsAddingCode(false);
    }
  };

  const handleActionButtonPress = () => {
    if (formattedResponse?.searchData) {
      setShowActionsModal(true);
    }
  };

  const handleDeleteSuccess = () => {
    setFormattedResponse(null);
    setLastSearchResult(null);
    setShowCodeActions(false);
    setShowActionsModal(false);
    setNewCodeInput('');

    Toast.show({
      type: 'success',
      text1: '✅ Операция выполнена',
      text2: 'Операция успешно завершена',
      position: 'bottom',
      visibilityTime: 4000,
    });

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  };

  const handlePrintBox = async () => {
    const currentBoxNumber = boxNumber || parseInt(addToBoxNumber, 10);
    if (!currentBoxNumber) {
      Alert.alert('Ошибка', 'Номер коробки не найден');
      return;
    }

    try {
      const boxData = await ApiService.searchByBoxNumber(currentBoxNumber);
      if (boxData && boxData.length > 0) {
        await ApiService.PrintBox(currentBoxNumber, boxData.length);
        Alert.alert('✅ Успешно', 'Этикетка коробки отправлена на печать');
      } else {
        Alert.alert('❌ Ошибка', 'Не удалось получить данные коробки');
      }
    } catch (error) {
      console.error('Ошибка печати коробки:', error);
      Alert.alert('❌ Ошибка', 'Не удалось напечатать этикетку коробки');
    }
  };

  const handlePrintPallet = async () => {
    const currentPalletNumber = palletNumber || (addToPalletNumber ? parseInt(addToPalletNumber, 10) : undefined);
    if (!currentPalletNumber) {
      Alert.alert('Ошибка', 'Номер паллеты не найден');
      return;
    }

    try {
      const productCountResult = await ApiService.getProductCountInPallet(currentPalletNumber);
      const allPallets = await ApiService.getAllPallets();

      let boxCount = 0;
      if (allPallets && allPallets.data) {
        const palletData = allPallets.data.find(
          (el: any) => el.pallet_number === currentPalletNumber,
        );
        if (palletData) {
          boxCount = parseInt(palletData.box_count, 10) || 0;
        }
      }

      await ApiService.PrintPallet(
        currentPalletNumber,
        boxCount,
        productCountResult.count || 0,
      );

      Alert.alert('✅ Успешно', 'Этикетка паллеты отправлена на печать');
    } catch (error) {
      console.error('Ошибка печати паллеты:', error);
      Alert.alert('❌ Ошибка', 'Не удалось напечатать этикетку паллеты');
    }
  };

  const handlePrintBoxPallet = async () => {
    if (!lastSearchResult) return;

    const searchFrom = lastSearchResult.from;

    if (searchFrom === SearchFrom.Box || searchFrom === 'box') {
      await handlePrintBox();
    } else if (searchFrom === SearchFrom.Pallet || searchFrom === 'pallet') {
      await handlePrintPallet();
    } else {
      Alert.alert('Ошибка', 'Неизвестный тип для печати');
    }
  };

  const handleDeleteCode = () => {
    if (!codeForDel || codeForDel.length === 0) {
      Alert.alert('Ошибка', 'Нет кодов для удаления');
      return;
    }

    Alert.alert(
      '🗑️ Удаление кода',
      'Вы уверены, что хотите удалить этот код?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await ApiService.deleteCodes(codeForDel);
              Alert.alert('Результат', res.message || 'Операция завершена');
              clearAllStates();
            } catch (error) {
              console.error('Ошибка удаления кодов:', error);
              Alert.alert('Ошибка', 'Не удалось удалить коды');
            }
          },
        },
      ],
    );
  };

  const searchFrom = lastSearchResult?.from;
  const isCodeType = searchFrom === SearchFrom.Code || searchFrom === 'code';
  const isBoxType = searchFrom === SearchFrom.Box || searchFrom === 'box';
  const isPalletType = searchFrom === SearchFrom.Pallet || searchFrom === 'pallet';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Поиск</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Основное поле ввода для поиска */}
          <View style={styles.centerContainer}>
            <TextInput
              key={scanKey}
              ref={inputRef}
              style={[styles.searchInput, isLoading && styles.searchInputDisabled]}
              onChangeText={setInputValue}
              value={inputValue}
              onSubmitEditing={handleSubmit}
              placeholder={isLoading ? 'Поиск...' : 'Отсканируйте или введите код'}
              placeholderTextColor="#999"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={true}
              returnKeyType="done"
              blurOnSubmit={false}
              editable={!isLoading}
            />
            {isLoading && (
              <ActivityIndicator
                style={styles.loader}
                size="small"
                color="#007AFF"
              />
            )}
          </View>

          {/* Информация о результате */}
          {formattedResponse && (
            <View style={[
              styles.resultContainer,
              formattedResponse.type === 'success' && styles.resultSuccess,
              formattedResponse.type === 'error' && styles.resultError,
              formattedResponse.type === 'info' && styles.resultInfo,
            ]}>
              <Text style={styles.resultTitle}>{formattedResponse.title}</Text>
              <Text style={styles.resultMessage}>{formattedResponse.message}</Text>
            </View>
          )}

          {/* Кнопки действий */}
          {formattedResponse?.searchData && (
            <>
              {/* Действия с кодом */}
              {isCodeType && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setShowCodeActions(!showCodeActions);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>
                      {showCodeActions ? 'Скрыть действия' : 'Действия с кодом'}
                    </Text>
                  </TouchableOpacity>

                  {showCodeActions && (
                    <View style={styles.codeActionsContainer}>
                      {/* Дополнительное поле для сканирования нового кода */}
                      <View style={styles.addCodeSection}>
                        <Text style={styles.addCodeSectionTitle}>
                          Добавить код в коробку
                          {boxNumber ? ` №${boxNumber}` : ''}
                          {palletNumber ? `, паллета №${palletNumber}` : ''}
                        </Text>

                        <View style={styles.addCodeInputContainer}>
                          <TextInput
                            ref={newCodeInputRef}
                            style={styles.addCodeInput}
                            value={newCodeInput}
                            onChangeText={setNewCodeInput}
                            placeholder="Отсканируйте новый код"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={handleAddNewCode}
                            editable={!isAddingCode}
                          />
                          <TouchableOpacity
                            style={[
                              styles.addCodeButton,
                              (!newCodeInput.trim() || isAddingCode) && styles.addCodeButtonDisabled,
                            ]}
                            onPress={handleAddNewCode}
                            disabled={!newCodeInput.trim() || isAddingCode}
                          >
                            {isAddingCode ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Text style={styles.addCodeButtonText}>+</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Печать этикетки коробки */}
                      {boxNumber && (
                        <TouchableOpacity
                          style={styles.secondaryButton}
                          onPress={handlePrintBox}
                        >
                          <Text style={styles.actionButtonText}>
                            Печать этикетки коробки
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Печать этикетки паллеты */}
                      {palletNumber && (
                        <TouchableOpacity
                          style={styles.secondaryButton}
                          onPress={handlePrintPallet}
                        >
                          <Text style={styles.actionButtonText}>
                            Печать этикетки паллеты
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Удаление кода */}
                      <TouchableOpacity
                        style={styles.dangerButton}
                        onPress={handleDeleteCode}
                      >
                        <Text style={styles.actionButtonText}>
                          Удалить код
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* Действия с коробкой */}
              {isBoxType && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleActionButtonPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>
                      {formattedResponse.actionButtonText || 'Действия с коробкой'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.printButton}
                    onPress={handlePrintBoxPallet}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>
                      Печать этикетки коробки
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Действия с паллетой */}
              {isPalletType && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleActionButtonPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>
                      {formattedResponse.actionButtonText || 'Действия с паллетой'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.printButton}
                    onPress={handlePrintBoxPallet}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>
                      Печать этикетки паллеты
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Кнопка очистки */}
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setNewCodeInput('');
                  clearAllStates();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>✕ Очистить</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Модальное окно действий */}
      {formattedResponse?.searchData && (
        <ActionsModal
          visible={showActionsModal}
          onClose={() => setShowActionsModal(false)}
          searchData={formattedResponse.searchData}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
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
    marginBottom: 20,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#007AFF',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputDisabled: {
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
    padding: 16,
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
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  printButton: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  codeActionsContainer: {
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  // Стили для секции добавления нового кода
  addCodeSection: {
    backgroundColor: '#f0fff4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  addCodeSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d8a4e',
    marginBottom: 8,
  },
  addCodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCodeInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#34C759',
    color: '#333',
    marginRight: 8,
  },
  addCodeButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCodeButtonDisabled: {
    backgroundColor: '#a0d8b0',
  },
  addCodeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Стили для формы изменения коробки
  addToBoxForm: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});