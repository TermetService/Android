import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiService } from '../../services/api.ts';

export type AggregationScanType =
  | 'PRODUCT'
  | 'SMALL_BOX_LABEL'
  | 'BIG_BOX_LABEL'
  | 'PALLET_LABEL';

export type AggregationInfo = {
  scanType: AggregationScanType;
  label: string | null;
  parents: {
    smallBox: string | null;
    bigBox: string | null;
    pallet: string | null;
  };
  contentsCount: number | null;
  contentsType: AggregationScanType | null;
  aggregationLvl: number;
};

type ActionTarget = {
  scanType: AggregationScanType;
  code: string;
  isCurrent: boolean;
};

type Props = {
  visible: boolean;
  scanResult: AggregationInfo;
  onClose: () => void;
  onDeleteSuccess: () => void;
  onRefresh: (updated: AggregationInfo) => void;
};

const scanTypeNames: Record<AggregationScanType, string> = {
  PRODUCT: 'товар',
  SMALL_BOX_LABEL: 'малая коробка',
  BIG_BOX_LABEL: 'Коробка',
  PALLET_LABEL: 'паллета',
};

/**
 * Получает номер контейнера из полной этикетки.
 * Пример: 00746600413500000018 -> 1.
 */
const extractContainerNumber = (
  sscc: string | null | undefined,
): string | null => {
  if (sscc == null || sscc.trim() === '') {
    return null;
  }

  const serialReference = sscc.substring(12, 19);
  return serialReference.replace(/^0+/, '') || '0';
};

/**
 * Все этикетки приходят с бэкенда.
 * Текущий объект использует label,
 * родительские упаковки — parents.
 */
const getActionTargets = (scanResult: AggregationInfo): ActionTarget[] => {
  const targets: ActionTarget[] = [
    {
      scanType: scanResult.scanType,
      code: scanResult.label?.trim() ?? '',
      isCurrent: true,
    },
  ];

  const { smallBox, bigBox, pallet } = scanResult.parents ?? {
    smallBox: null,
    bigBox: null,
    pallet: null,
  };

  if (smallBox?.trim()) {
    targets.push({
      scanType: 'SMALL_BOX_LABEL',
      code: smallBox.trim(),
      isCurrent: false,
    });
  }

  if (bigBox?.trim()) {
    targets.push({
      scanType: 'BIG_BOX_LABEL',
      code: bigBox.trim(),
      isCurrent: false,
    });
  }

  if (pallet?.trim()) {
    targets.push({
      scanType: 'PALLET_LABEL',
      code: pallet.trim(),
      isCurrent: false,
    });
  }

  return targets;
};

const getActionTargetName = (target: ActionTarget): string => {
  if (target.scanType === 'PRODUCT') {
    return `Товар`
  }

  const number = extractContainerNumber(target.code);

  return number !== null
    ? `${scanTypeNames[target.scanType]} №${number}`
    : `${scanTypeNames[target.scanType]} — этикетка не получена`;
};

export const SearchActionsModal = ({
  visible,
  scanResult,
  onClose,
  onDeleteSuccess,
  onRefresh,
}: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [printingType, setPrintingType] = useState<AggregationScanType | null>(
    null,
  );
  const [printingCode, setPrintingCode] = useState<string | null>(null);

  const [contentCode, setContentCode] = useState('');
  const [isAddingContent, setIsAddingContent] = useState(false);

  const [addingToPackageCode, setAddingToPackageCode] = useState<string | null>(
    null,
  );

  const [palletCode, setPalletCode] = useState('');
  const [movingBoxCode, setMovingBoxCode] = useState<string | null>(null);
  const [isMovingBox, setIsMovingBox] = useState(false);

  // Полная этикетка текущего объекта, полученная с бэкенда.
  const currentObjectCode = scanResult.label?.trim() ?? '';

  const actionTargets = getActionTargets(scanResult);

  const deleteActionTarget = async (target: ActionTarget) => {
    if (!target.code) {
      Alert.alert('Ошибка удаления', 'Бэкенд не вернул этикетку объекта.');
      return;
    }

    setIsDeleting(true);

    try {
        target.scanType === 'PRODUCT'
          ? await ApiService.deleteCode(target.code)
          : await ApiService.deletePackage(target.code);

      Alert.alert(
        'Удалено',
        `Удаление: ${getActionTargetName(target)} выполнено`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onDeleteSuccess();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Ошибка удаления',
        error instanceof Error ? error.message : 'Не удалось удалить объект',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (target: ActionTarget) => {
    if (!target.code) {
      Alert.alert('Ошибка удаления', 'Бэкенд не вернул этикетку объекта.');
      return;
    }

    const targetName = getActionTargetName(target);

    Alert.alert('Подтверждение 1 из 2', `Удалить ${targetName}?`, [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'Продолжить',
        onPress: () => {
          Alert.alert(
            'Подтверждение 2 из 2',
            `Удаляются все коды из этой коробки. Удалить ${targetName}?`,
            [
              {
                text: 'Отмена',
                style: 'cancel',
              },
              {
                text: 'Удалить окончательно',
                style: 'destructive',
                onPress: () => deleteActionTarget(target),
              },
            ],
          );
        },
      },
    ]);
  };

  const moveBigBoxToPallet = async (boxCode: string) => {
    const targetPalletCode = palletCode.trim();

    if (!boxCode || !targetPalletCode || isMovingBox) {
      return;
    }

    setIsMovingBox(true);

    await ApiService.moveBox(boxCode, targetPalletCode);


      setPalletCode('');
      setMovingBoxCode(null);

      // Обновляем текущий объект вместе с его родителями.
      if (currentObjectCode) {
        const refreshed = await ApiService.searchInfo(currentObjectCode);

        if (refreshed?.success !== false && refreshed?.scanType) {
          onRefresh(refreshed as AggregationInfo);
        }
      }
      setIsMovingBox(false);
  };

  const addProductToPackage = async (packageCode: string) => {
    const productCode = contentCode.trim();
    const targetPackageCode = packageCode.trim();

    if (
      !productCode ||
      !targetPackageCode ||
      isAddingContent ||
      isDeleting ||
      printingType !== null
    ) {
      return;
    }

    setIsAddingContent(true);

    try {
      const response = await ApiService.addCodeToBox(
        targetPackageCode,
        productCode,
      );

      if (response?.success === false) {
        throw new Error(
          response.message || 'Не удалось добавить товар в упаковку',
        );
      }

      setContentCode('');
      setAddingToPackageCode(null);

      if (currentObjectCode) {
        const refreshed = await ApiService.searchInfo(currentObjectCode);

        if (refreshed?.success !== false && refreshed?.scanType) {
          onRefresh(refreshed as AggregationInfo);
        }
      }

      Alert.alert('Готово', response?.message || 'Товар добавлен в упаковку');
    } catch (error) {
      Alert.alert(
        'Ошибка добавления',
        error instanceof Error
          ? error.message
          : 'Не удалось добавить товар в упаковку',
      );
    } finally {
      setIsAddingContent(false);
    }
  };

  const printTarget = async (target: ActionTarget) => {
    if (target.scanType === 'PRODUCT') {
      return;
    }

    const containerNumber = extractContainerNumber(target.code);
    const packageNumber =
      containerNumber === null ? NaN : Number(containerNumber);

    if (!Number.isInteger(packageNumber) || packageNumber <= 0) {
      Alert.alert(
        'Ошибка печати',
        `Не удалось извлечь номер из этикетки:\n${target.code}`,
      );
      return;
    }

    setPrintingType(target.scanType);
    setPrintingCode(target.code);

    try {
      const taskId = await ApiService.getActiveTask();
      let response: Response;

      switch (target.scanType) {
        case 'SMALL_BOX_LABEL':
          response = await ApiService.PrintSmallBox(packageNumber, taskId);
          break;

        case 'BIG_BOX_LABEL':
          response = await ApiService.PrintBox(packageNumber, taskId);
          break;

        case 'PALLET_LABEL':
          response = await ApiService.PrintPallet(packageNumber, taskId);
          break;

        default:
          throw new Error('Неизвестный тип упаковки');
      }

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `Ошибка HTTP: ${response.status}`);
      }

      Alert.alert(
        'Готово',
        `Этикетка отправлена на печать:\n${getActionTargetName(target)}`,
      );
    } catch (error) {
      Alert.alert(
        'Ошибка печати',
        error instanceof Error
          ? error.message
          : 'Не удалось напечатать этикетку',
      );
    } finally {
      setPrintingType(null);
      setPrintingCode(null);
    }
  };

  const renderActionBlock = (target: ActionTarget) => {
    const isPackage = target.scanType !== 'PRODUCT';
    const isPrintingThisTarget = printingCode === target.code;
    const targetName = getActionTargetName(target);

    const canAddProductToTarget =
      Boolean(target.code) &&
      ((scanResult.aggregationLvl === 3 &&
        target.scanType === 'SMALL_BOX_LABEL') ||
        (scanResult.aggregationLvl === 2 &&
          target.scanType === 'BIG_BOX_LABEL'));

    const isAddingToThisPackage = addingToPackageCode === target.code;

    const canMoveBigBox =
      target.scanType === 'BIG_BOX_LABEL' && Boolean(target.code);

    const isMovingThisBox = movingBoxCode === target.code;

    return (
      <View
        key={`${target.scanType}-${target.code}-${
          target.isCurrent ? 'current' : 'parent'
        }`}
        style={styles.entityBlock}
      >
        <Text style={styles.entityName}>{targetName}</Text>

        <View style={styles.entityActions}>
          {isPackage && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                (printingType !== null ||
                  isDeleting ||
                  isAddingContent ||
                  !target.code) &&
                  styles.disabledButton,
              ]}
              onPress={() => void printTarget(target)}
              disabled={
                printingType !== null ||
                isDeleting ||
                isAddingContent ||
                !target.code
              }
            >
              {isPrintingThisTarget ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Печать</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.dangerButton,
              (isDeleting ||
                printingType !== null ||
                isAddingContent ||
                !target.code) &&
                styles.disabledButton,
            ]}
            onPress={() => confirmDelete(target)}
            disabled={
              isDeleting ||
              printingType !== null ||
              isAddingContent ||
              !target.code
            }
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {target.scanType === 'PRODUCT' ? 'Удалить товар' : 'Удалить'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {canAddProductToTarget && (
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>
              Добавить продукт в{' '}
              {scanResult.aggregationLvl === 3 ? 'малую коробку' : 'коробку'}
            </Text>

            {!isAddingToThisPackage ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isAddingContent || isDeleting || printingType !== null) &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  setContentCode('');
                  setAddingToPackageCode(target.code);
                }}
                disabled={
                  isAddingContent || isDeleting || printingType !== null
                }
              >
                <Text style={styles.buttonText}>Добавить продукт</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  style={styles.addInput}
                  value={contentCode}
                  onChangeText={setContentCode}
                  placeholder="Отсканируйте код товара"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onSubmitEditing={() => void addProductToPackage(target.code)}
                  editable={
                    !isAddingContent && !isDeleting && printingType === null
                  }
                  autoFocus
                />

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!contentCode.trim() ||
                      isAddingContent ||
                      isDeleting ||
                      printingType !== null) &&
                      styles.disabledButton,
                  ]}
                  onPress={() => void addProductToPackage(target.code)}
                  disabled={
                    !contentCode.trim() ||
                    isAddingContent ||
                    isDeleting ||
                    printingType !== null
                  }
                >
                  {isAddingContent ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Подтвердить добавление
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setContentCode('');
                    setAddingToPackageCode(null);
                  }}
                  disabled={isAddingContent}
                >
                  <Text style={styles.buttonText}>Отмена</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        {canMoveBigBox && (
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>Перемещение большой коробки</Text>

            {!isMovingThisBox ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isMovingBox ||
                    isAddingContent ||
                    isDeleting ||
                    printingType !== null) &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  setPalletCode('');
                  setMovingBoxCode(target.code);
                }}
                disabled={
                  isMovingBox ||
                  isAddingContent ||
                  isDeleting ||
                  printingType !== null
                }
              >
                <Text style={styles.buttonText}>Переместить на паллету</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  style={styles.addInput}
                  value={palletCode}
                  onChangeText={setPalletCode}
                  placeholder="Отсканируйте этикетку паллеты"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => void moveBigBoxToPallet(target.code)}
                  editable={!isMovingBox}
                  autoFocus
                />

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!palletCode.trim() || isMovingBox) &&
                      styles.disabledButton,
                  ]}
                  onPress={() => void moveBigBoxToPallet(target.code)}
                  disabled={!palletCode.trim() || isMovingBox}
                >
                  {isMovingBox ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Подтвердить перемещение
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setPalletCode('');
                    setMovingBoxCode(null);
                  }}
                  disabled={isMovingBox}
                >
                  <Text style={styles.buttonText}>Отмена</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Действия</Text>
          </View>

          <TouchableOpacity
            style={styles.headerCloseButton}
            onPress={onClose}
            disabled={isDeleting || isAddingContent || printingType !== null}
          >
            <Text style={styles.headerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.actions}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={styles.sectionTitle}>Объекты и их действия</Text>

          {actionTargets.map(renderActionBlock)}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerText: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: '#222',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 'auto',
  },
  subtitle: {
    color: '#666',
    fontSize: 13,
    lineHeight: 17,
  },
  headerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCloseText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
  },
  actions: {
    paddingBottom: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  addSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 9,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  entityBlock: {
    backgroundColor: '#fff',
    borderRadius: 9,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dedede',
  },
  entityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  entityActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 0,
    marginRight: 8,
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 2,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  footerButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.55,
  },
});
