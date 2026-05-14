// src/components/CodeForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ApiService } from '../../services/api.ts';

interface CodeFormProps {
  PrintBox: () => void;
  PrintPallet: () => void;
  deleteCod: () => void;
  palletNumber?: number;
  boxNumber?: number;
}

export const CodeForm: React.FC<CodeFormProps> = ({
  PrintBox,
  PrintPallet,
  deleteCod,
  palletNumber,
  boxNumber,
}) => {
  const [moveBoxNumber, setMoveBoxNumber] = useState('');
  const [movePalletNumber, setMovePalletNumber] = useState('');

  const handleMoveBox = async () => {
    const boxNum = parseInt(moveBoxNumber, 10);
    const palletNum = movePalletNumber ? parseInt(movePalletNumber, 10) : null;

    if (!boxNum) {
      Alert.alert('Ошибка', 'Введите корректный номер коробки');
      return;
    }

    try {
      const result = await ApiService.moveBoxToPallet(boxNum, palletNum || 0);
      Alert.alert('Успешно', 'Коробка перемещена');
      setMoveBoxNumber('');
      setMovePalletNumber('');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось переместить коробку');
    }
  };

  const confirmDeleteCode = () => {
    Alert.alert('Удаление кода', 'Вы уверены, что хотите удалить этот код?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: deleteCod },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Действия с кодом</Text>

      {boxNumber && (
        <TouchableOpacity style={styles.button} onPress={PrintBox}>
          <Text style={styles.buttonText}>Печать этикетки коробки #{boxNumber}</Text>
        </TouchableOpacity>
      )}

      {palletNumber && (
        <TouchableOpacity style={styles.button} onPress={PrintPallet}>
          <Text style={styles.buttonText}>Печать этикетки паллеты #{palletNumber}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.moveSection}>
        <Text style={styles.subtitle}>Переместить коробку</Text>
        <TextInput
          style={styles.input}
          placeholder="Номер коробки"
          value={moveBoxNumber}
          onChangeText={setMoveBoxNumber}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Номер паллеты (необязательно)"
          value={movePalletNumber}
          onChangeText={setMovePalletNumber}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.moveButton} onPress={handleMoveBox}>
          <Text style={styles.buttonText}>Переместить</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteCode}>
        <Text style={styles.buttonText}>Удалить код</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  moveSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  moveButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
