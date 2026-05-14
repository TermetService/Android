// src/components/ActionsModal.tsx
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
import { ApiService } from '../../services/api.ts';

interface ActionsModalProps {
  visible: boolean;
  onClose: () => void;
  searchData: {
    type: 'code' | 'box' | 'pallet';
    boxNumber?: number;
    palletNumber?: number;
    boxLabel?: string | null;
    palletLabel?: string | null;
    id?: number;
    code?: string;
    countIn?: number;
  };
  onDeleteSuccess?: () => void;
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
  const [isRemovingFromPallet, setIsRemovingFromPallet] = useState(false);
  const [isDeletingPallet, setIsDeletingPallet] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [showPalletSelect, setShowPalletSelect] = useState(false);

  const handleTransfer = async () => {
    if (!selectedPallet || !searchData.boxNumber) {
      Alert.alert('Ошибка', 'Выберите паллету для перемещения');
      return;
    }

    setIsMoving(true);
    try {
      const res = await ApiService.moveBoxToPallet(
        searchData.boxNumber,
        selectedPallet.pallet_number,
      );

      if (res) {
        setShowPalletSelect(false);
        setSelectedPallet(null);
        Alert.alert('✅ Успешно', 'Коробка успешно перемещена');
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        onClose();
      } else {
        Alert.alert('❌ Ошибка', 'Не удалось переместить коробку');
      }
    } catch (error) {
      console.error('Ошибка перемещения:', error);
      Alert.alert('❌ Ошибка', 'Не удалось переместить коробку');
    } finally {
      setIsMoving(false);
    }
  };

  const loadPallets = async () => {
    try {
      const res = await ApiService.getAllPallets();
      if (res && res.data && res.data.length > 0) {
        // Фильтруем текущую паллету
        const filteredPallets = res.data.filter(
          (p: Pallet) => p.pallet_number !== searchData.palletNumber,
        );
        setPallets(filteredPallets);
        setShowPalletSelect(true);
      } else {
        Alert.alert('Информация', 'Нет доступных паллет для перемещения');
      }
    } catch (error) {
      console.error('Ошибка загрузки паллет:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список паллет');
    }
  };

  const confirmDeleteBox = () => {
    Alert.alert(
      'Удаление коробки',
      `Вы уверены, что хотите удалить коробку №${searchData.boxNumber}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => handleDeleteBox(),
        },
      ],
    );
  };

  const confirmDeletePallet = () => {
    Alert.alert(
      'Удаление паллеты',
      `Вы уверены, что хотите удалить паллету №${searchData.palletNumber}?\n\nВНИМАНИЕ: Все коробки с кодами удалятся`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => handleDeletePallet(),
        },
      ],
    );
  };

  const confirmRemoveBoxFromPallet = () => {
    Alert.alert(
      'Изъятие коробки',
      `Вы уверены, что хотите изъять коробку №${searchData.boxNumber} из паллеты №${searchData.palletNumber}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Изъять',
          style: 'destructive',
          onPress: () => handleRemoveBoxFromPallet(),
        },
      ],
    );
  };

  const handleDeleteBox = async () => {
    if (!searchData.boxNumber) {
      Alert.alert('Ошибка', 'Номер коробки не указан');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await ApiService.deleteBox(searchData.boxNumber);
      if (result.success) {
        onClose();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        Alert.alert('✅ Успешно', result.message);
      } else {
        Alert.alert(
          '❌ Ошибка',
          result.message || 'Не удалось удалить коробку',
        );
      }
    } catch (error) {
      console.error('Ошибка удаления коробки:', error);
      Alert.alert('❌ Ошибка', 'Не удалось удалить коробку');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePallet = async () => {
    if (!searchData.palletNumber) {
      Alert.alert('Ошибка', 'Номер паллеты не указан');
      return;
    }

    setIsDeletingPallet(true);
    try {
      const result = await ApiService.deletePallet(searchData.palletNumber);
      if (result.success) {
        onClose();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        Alert.alert('✅ Успешно', result.message);
      } else {
        Alert.alert(
          '❌ Ошибка',
          result.message || 'Не удалось удалить паллету',
        );
      }
    } catch (error) {
      console.error('Ошибка удаления паллеты:', error);
      Alert.alert('❌ Ошибка', 'Не удалось удалить паллету');
    } finally {
      setIsDeletingPallet(false);
    }
  };

  const handleRemoveBoxFromPallet = async () => {
    if (!searchData.boxNumber) {
      Alert.alert('Ошибка', 'Номер коробки не указан');
      return;
    }

    setIsRemovingFromPallet(true);
    try {
      const result = await ApiService.removeBoxFromPallet(searchData.boxNumber);
      if (result.success) {
        onClose();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        Alert.alert('✅ Успешно', result.message);
      } else {
        Alert.alert('❌ Ошибка', result.message || 'Не удалось изъять коробку');
      }
    } catch (error) {
      console.error('Ошибка изъятия коробки:', error);
      Alert.alert('❌ Ошибка', 'Не удалось изъять коробку');
    } finally {
      setIsRemovingFromPallet(false);
    }
  };

  const isBox = searchData.type === 'box';
  const isPallet = searchData.type === 'pallet';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {!showPalletSelect ? (
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
              <Text style={styles.modalTitle}>
                {isBox ? 'Действия с коробкой' : 'Действия с паллетой'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isBox
                  ? `Коробка: ${searchData.boxNumber}`
                  : `Паллета: ${searchData.palletNumber}`}
              </Text>
              {isBox && searchData.palletNumber && (
                <Text style={styles.modalSubtitle}>
                  Паллета: {searchData.palletNumber}
                </Text>
              )}
            </View>

            <View style={styles.actionsContainer}>
              {/* Действия с коробкой */}
              {isBox && (
                <>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={loadPallets}
                    disabled={isDeleting}
                  >
                    <Text style={styles.actionButtonText}>
                      Переместить коробку
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={confirmDeleteBox}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        🗑Удалить коробку
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Действия с паллетой */}
              {isPallet && (
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={confirmDeletePallet}
                  disabled={isDeletingPallet}
                >
                  {isDeletingPallet ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.actionButtonText}>
                      Удалить паллету
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isDeleting || isRemovingFromPallet || isDeletingPallet}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : (
        // Экран выбора паллеты для перемещения
        <View style={styles.palletSelectContainer}>
          <View style={styles.palletSelectHeader}>
            <Text style={styles.palletSelectTitle}>
              Выберите паллету для перемещения
            </Text>
            <Text style={styles.palletSelectSubtitle}>
              Коробка №{searchData.boxNumber}
            </Text>
          </View>

          <FlatList
            data={pallets}
            keyExtractor={item => item.pallet_number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.palletItem,
                  selectedPallet?.pallet_number === item.pallet_number &&
                    styles.palletItemSelected,
                ]}
                onPress={() => setSelectedPallet(item)}
              >
                <View style={styles.palletItemContent}>
                  <Text style={styles.palletItemTitle}>
                    Паллета №{item.pallet_number}
                  </Text>
                  <Text style={styles.palletItemSubtitle}>
                    Коробок: {item.box_count}
                  </Text>
                </View>
                {selectedPallet?.pallet_number === item.pallet_number && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.palletList}
          />

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedPallet && styles.confirmButtonDisabled,
            ]}
            onPress={handleTransfer}
            disabled={!selectedPallet || isMoving}
          >
            {isMoving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Переместить коробку</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelTransferButton}
            onPress={() => {
              setShowPalletSelect(false);
              setSelectedPallet(null);
            }}
          >
            <Text style={styles.cancelButtonText}>Отменить</Text>
          </TouchableOpacity>
        </View>
      )}
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
    width: '90%',
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
    marginBottom: 4,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  moveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  warningButton: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  palletSelectContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  palletSelectHeader: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  palletSelectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  palletSelectSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  palletList: {
    paddingBottom: 20,
  },
  palletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  palletItemSelected: {
    borderColor: '#34C759',
  },
  palletItemContent: {
    flex: 1,
  },
  palletItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  palletItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cancelTransferButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
