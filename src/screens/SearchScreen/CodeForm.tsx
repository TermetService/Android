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
  return (
    <>
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButtonPrint}
          onPress={PrintBox}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            Печать Коробки{' №-'}
            {palletNumber}
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
            {boxNumber}
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
