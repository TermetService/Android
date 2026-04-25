// src/screens/ActionsModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ApiService } from '../../services/api';

interface ActionsModalProps {
  visible: boolean;
  onClose: () => void;
  searchData: any;
  onDeleteSuccess?: () => void; // Коллбек при успешном удалении
}
interface Pallet {
  pallet_number: number;
  box_count: string | number;
}

export const ActionsModal: React.FC<ActionsModalProps> = ({
  visible,
  onClose,
  searchData,
  onDeleteSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingPallet, setIsDeletingPallet] = useState(false);
  const [boxNumber, setBoxNumber] = useState<number | undefined>();
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [open, setOpen] = useState(false);

  const handleTransfer = async () => {
    console.log(selectedPallet?.pallet_number, 'safsfasa');
    const res = await ApiService.MoveBoxToPallet(
      searchData.boxNumber,
      selectedPallet?.pallet_number,
    );
    console.log(res.ok);
    if (res.ok) {
      setOpen(false);
      Alert.alert('Успешно перещена');
    }
  };
  const Transfer = async () => {
    const res = await ApiService.getAllPallets();
    setOpen(true);
    setPallets(res.data);
    console.log(res);

    // const result = await ApiService.MoveBoxToPallet(searchData.boxNumber, 1);
  };
  // Функция подтверждения удаления
const confirmDeleteBox = () => {
  Alert.alert(
    'Удаление коробки',
    `Вы уверены, что хотите удалить коробку №${searchData.boxNumber}?`,
    [
      {
        text: 'Отмена',
        style: 'cancel',
        onPress: () => console.log('Удаление отменено'),
      },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => handleDeleteBox(),
      },
    ],
    { cancelable: true },
  );
};
  const confirmDeletePallet = () => {
    console.log(searchData, 'q22222222222222222222222222');
    Alert.alert(
      'Удаление паллеты',
      `Вы уверены, что хотите удалить паллету №${searchData.palletNumber}?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
          onPress: () => console.log('Удаление отменено'),
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => handleDeletePallet(),
        },
      ],
      { cancelable: true },
    );
  };
  // Функция удаления коробки
  const handleDeleteBox = async () => {
    if (!searchData.boxNumber) {
      Alert.alert('Ошибка', 'У коробки нет метки для удаления');
      return;
    }

    setIsDeleting(true);

    try {
      console.log(`Попытка удаления коробки: ${searchData.boxNumber}`);

      // Вызываем метод API для удаления коробки

      const result = await ApiService.deleteBox(searchData.boxNumber);

      if (result.success) {
        console.log('Коробка успешно удалена:', result.message);

        // Закрываем модальное окно
        onClose();

        // Вызываем коллбек при успешном удалении
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }

        // Показываем сообщение об успехе
        Alert.alert('Успешно', result.message);
      } else {
        Alert.alert('Ошибка', result.message || 'Не удалось удалить коробку');
      }
    } catch (error) {
      console.error('Ошибка при удалении коробки:', error);
      Alert.alert(
        'Ошибка',
        error instanceof Error
          ? error.message
          : 'Неизвестная ошибка при удалении',
      );
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeletePallet = async () => {
    setIsDeleting(true);

    try {
      console.log(`Попытка удаления Паллеты: ${searchData.palletNumber}`);

      // Вызываем метод API для удаления коробки

      const result = await ApiService.deletePallet(searchData.palletNumber);

      if (result.success) {
        console.log('Паллета успешно удалена:', result.message);

        // Закрываем модальное окно
        onClose();

        // Вызываем коллбек при успешном удалении
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }

        // Показываем сообщение об успехе
        Alert.alert('Успешно', result.message);
      } else {
        Alert.alert('Ошибка', result.message || 'Не удалось удалить паллету');
      }
    } catch (error) {
      console.error('Ошибка при удалении паллеты:', error);
      Alert.alert(
        'Ошибка',
        error instanceof Error
          ? error.message
          : 'Неизвестная ошибка при удалении',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {!open ? (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Действия с коробкой</Text>
              <Text style={styles.modalSubtitle}>
                Коробка: {searchData.boxNumber}
              </Text>

              {searchData.boxNumber && searchData.type === 'box' && (
                <Text style={styles.boxLabelText}>
                  Метка: {searchData.boxNumber}
                </Text>
              )}
            </View>

            <View style={styles.actionsContainer}>
              {/* Кнопка удаления коробки */}
              {/* Кнопка удаления - для коробки или паллеты */}
              {searchData.boxNumber && searchData.type === 'box' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={confirmDeleteBox}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.deleteButtonText}>
                      🗑️ Удалить коробку #{searchData.boxNumber}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {searchData.palletNumber && searchData.type === 'pallet' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={confirmDeletePallet}
                  disabled={isDeletingPallet}
                >
                  {isDeletingPallet ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.deleteButtonText}>
                      🗑️ Удалить паллету #{searchData.palletNumber}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              {searchData.type === 'box' ? (
                <>
                  <TouchableOpacity
                    style={styles.TransferButton}
                    onPress={Transfer}
                    disabled={isDeleting || !searchData.boxNumber}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.deleteButtonText}>
                        Переместить коробку
                      </Text>
                    )}
                  </TouchableOpacity>
                  {!searchData.boxNumber && (
                    <Text style={styles.warningText}>
                      Для перемещения коробки необходим номер коробки
                    </Text>
                  )}
                </>
              ) : null}

              {/* <TouchableOpacity
                style={styles.TransferButton}
                onPress={Transfer}
                disabled={isDeleting || !searchData.boxNumber}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.deleteButtonText}>
                    Переместить коробку
                  </Text>
                )}
              </TouchableOpacity> */}
              {!searchData.boxLabel && (
                <Text style={styles.warningText}>
                  Для удаления коробки необходима метка
                </Text>
              )}
            </View>

            {/* Кнопка отмены */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>
                {isDeleting ? 'Отмена (загрузка...)' : 'Отмена'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : null}
      {open ? (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 16 }}>
          {/* Заголовок */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center',
              color: '#333',
            }}
          >
            Выберите паллету для перемещения
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: '#666',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Коробка #{searchData.boxNumber} будет перемещена
          </Text>

          {/* Список паллет */}
          <FlatList
            data={pallets}
            keyExtractor={item => item.pallet_number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  borderWidth:
                    selectedPallet?.pallet_number === item.pallet_number
                      ? 2
                      : 0,
                  borderColor:
                    selectedPallet?.pallet_number === item.pallet_number
                      ? 'green'
                      : 'transparent',
                }}
                onPress={() => {
                  setSelectedPallet(item);
                  console.log(item);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: 4,
                    }}
                  >
                    Паллета #{item.pallet_number}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666' }}>
                    Коробок: {item.box_count}
                  </Text>
                </View>

                {selectedPallet?.pallet_number === item.pallet_number && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: 'green',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Кнопка перемещения */}
          <TouchableOpacity
            style={{
              backgroundColor: !selectedPallet ? '#ccc' : 'green',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 10,
            }}
            onPress={handleTransfer}
            disabled={!selectedPallet}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Переместить коробку
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: !selectedPallet ? '#ccc' : 'green',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 10,
            }}
            onPress={() => {
              setOpen(false);
            }}
            disabled={!selectedPallet}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Отменить действие
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  boxLabelText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    opacity: 1,
  },
  TransferButton: {
    backgroundColor: 'gray',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    opacity: 1,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FF9999',
    opacity: 0.6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
