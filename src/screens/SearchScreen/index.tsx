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
} from 'react-native';
import Toast from 'react-native-toast-message';
import { styles } from './styles';
import { formatSearchResponse, formatNetworkError } from './responseFormatter';
import { ApiService } from '../../services/api';
import { ActionsModal } from '../../components/ActionsModal';
import { CodeForm } from './CodeForm';
export const SearchScreen = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formattedResponse, setFormattedResponse] = useState<any>(null);
  const [showActionButton, setShowActionButton] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [boxNumber, setBoxNumber] = useState<number | undefined>();
  const [palletNumber, setPalletNumber] = useState<number | undefined>();
  const inputRef = useRef<TextInput>(null);
  const [CodeForDel, setCodeForDel] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const clearAllStates = () => {
    setCode(() => '');
    setIsLoading(false);
    setFormattedResponse(null);
    setShowActionButton(false);
    setShowActionsModal(false);
    setBoxNumber(undefined);
    setPalletNumber(undefined);
    setCodeForDel([]);

    // Опционально: очистить input поле
    if (inputRef.current) {
      inputRef.current.clear();
      // или inputRef.current.setNativeProps({ text: '' });
    }
  };
  // Автофокус при загрузке экрана
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Обработка отправки кода при нажатии Enter
  const handleSubmit = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setCode('');
    setIsLoading(true);
    setShowActionButton(false);
    setFormattedResponse(null);
    if (inputRef.current) {
      inputRef.current.setNativeProps({ text: '' });
    }
    try {
      const result = await ApiService.searchCode(trimmedCode);
      setBoxNumber(result.data?.box_number);
      setPalletNumber(result.data?.pallet_number);
      setCodeForDel([
        { code: result.data?.code, boxNumber: result.data?.box_number },
      ]);
      //            ^ без spread, просто объект в массиве
      const formatted = formatSearchResponse(result);
      console.log(formattedResponse, ']]]]]]]]]]]]', result);
      setFormattedResponse(formatted);

      setShowActionButton(formatted.showActionButton || false);

      Toast.show({
        type: formatted.type,
        text1: formatted.title,
        text2: formatted.message,
        position: 'bottom',
        visibilityTime: 5000,
        text1Style: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        text2Style: {
          fontSize: 14,
          lineHeight: 18,
        },
      });
    } catch (error) {
      console.log(error, '..............');
      const formatted = formatNetworkError();
      Toast.show({
        type: formatted.type,
        text1: formatted.title,
        text2: formatted.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionButtonPress = () => {
    if (formattedResponse?.searchData) {
      setShowActionsModal(true);
    }
    console.log(showActionsModal, 12412412141, formattedResponse.searchData);
  };

  // Коллбек при успешном удалении коробки
  const handleDeleteSuccess = () => {
    // Скрываем кнопку действия после удаления
    setShowActionButton(false);
    setFormattedResponse(null);

    // Показываем сообщение в Toast
    Toast.show({
      type: 'success',
      text1: '✅ Коробка удалена',
      text2: 'Коробка успешно удалена из системы',
      position: 'bottom',
      visibilityTime: 4000,
    });
  };
  const PrintBox = async () => {
    const countinbox = await ApiService.searchByBoxNumber(boxNumber);
    console.log(countinbox, '}]]]]]]]]]]]]]]]');
    ApiService.PrintBox(boxNumber, countinbox.length);
    console.log(formattedResponse, boxNumber);
  };
  const PrintBoxPallet = async () => {
    if (formattedResponse.searchData.type === 'box') {
      PrintBox();
    } else if (formattedResponse.searchData.type === 'pallet') {
      PrintPallet();
    }
  };
  const PrintPallet = async () => {
    if (!palletNumber) {
      Alert.alert('Ошибка', 'Пожалуйста, укажите номер паллеты');
      return;
    }
    const countinbPallet = await ApiService.getProductCountInPallet(
      palletNumber,
    );
    const allPallet = await ApiService.getAllPallets();
    const countIn = allPallet.data.find((el: any) => {
      if (el.pallet_number === palletNumber) {
        return el.box_count;
      }
    });
    console.log(countinbPallet, '}]]]]]]]]]]]]]]]');
    ApiService.PrintPallet(
      palletNumber,
      +countIn.box_count,
      countinbPallet.count,
    );
    console.log(formattedResponse, boxNumber);
  };

  const deleteCod = async () => {
    console.log(CodeForDel, 'yyyyyyyyyyyyyyyyyyyyyyyyyyyy');
    clearAllStates();
    const res = await ApiService.deleteCodes(CodeForDel);
    Alert.alert(res.message);
    setCodeForDel([]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Поиск</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.centerContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.searchInput,
                isLoading && styles.searchInputDisabled,
              ]}
              value=""
              onChangeText={setCode}
              onSubmitEditing={handleSubmit}
              placeholder={isLoading ? 'Поиск...' : 'Введите код'}
              placeholderTextColor="#999"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={true}
              returnKeyType="done"
              blurOnSubmit={false}
              editable={!isLoading}
            />
          </View>
          {formattedResponse?.searchData?.type === 'code' ? (
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setOpen(prev => !prev);
                }}
                activeOpacity={0.7}
                accessible={false}
              >
                <Text style={styles.actionButtonText}>Действия с кодом</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {showActionButton && formattedResponse && (
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleActionButtonPress}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>
                  {formattedResponse.actionButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {showActionButton && formattedResponse && (
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.actionButtonPrint}
                onPress={PrintBoxPallet}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>Печать Этикетки</Text>
              </TouchableOpacity>
            </View>
          )}
          {formattedResponse?.searchData?.type === 'code' && open ? (
            <CodeForm
              PrintBox={PrintBox}
              PrintPallet={PrintPallet}
              deleteCod={deleteCod}
              palletNumber={palletNumber}
              boxNumber={boxNumber}
            />
          ) : null}
        </View>
      </ScrollView>

      {formattedResponse?.searchData && (
        <ActionsModal
          visible={showActionsModal}
          onClose={() => setShowActionsModal(false)}
          searchData={formattedResponse.searchData}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </KeyboardAvoidingView>
  );
};
