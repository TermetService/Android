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
import { InputModal } from '../HandWorkScreen/Modal/InputModal';
import { ApiService } from '../../services/api';
import { Config } from '../../config';
export const CodeForm = ({
  PrintBox,
  PrintPallet,
  deleteCod,
  palletNumber,
  boxNumber,
}: any) => {
  const confirmDeleteBox = () => {
    Alert.alert(
      'Удаление коробки',
      `Вы уверены, что хотите удалить код?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
          onPress: () => console.log('Удаление отменено'),
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => deleteCod(),
        },
      ],
      { cancelable: true },
    );
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    placeholder: '',
    onConfirm: (value: string) => {},
  });
  const addInBox = () => {
    // Пример использования для добавления кода
    setModalConfig({
      title: 'Добавление кода',
      placeholder: 'Введите код продукта',
      onConfirm: async (code: string) => {
        console.log('Добавляем код:', code);
        // Ваша логика добавления
        const resalt = await ApiService.addCodeToBox(
          code,
          boxNumber,
          palletNumber,
          Config.USER_ID,
        );
        Toast.show({
          type: 'success',
          text1: `${resalt.message}`,

          position: 'bottom',
          visibilityTime: 4000,
        });
      },
    });
    setModalVisible(true);
  };
  return (
    <>
      <InputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={modalConfig.onConfirm}
        title={modalConfig.title}
        placeholder={modalConfig.placeholder}
      />
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButtonPrint}
          onPress={PrintBox}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            Печать Коробки{' №-'}
            {boxNumber}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButtonPrint}
          onPress={PrintPallet}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            Печать Паллеты {' №-'}
            {palletNumber}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButtonPrint}
          onPress={addInBox}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            Добавить код в текущую коробку
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButtonDelete}
          onPress={confirmDeleteBox}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>Удалить код</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
