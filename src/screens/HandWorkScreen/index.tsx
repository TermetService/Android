import React, {
  useEffect,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { ApiService } from '../../services/api';
import { styles } from './styles';
import { ManualWorkModal } from './Modal/ManualWorkModal';

type ExpectedScanType =
  | 'PRODUCT'
  | 'SMALL_BOX_LABEL'
  | 'BIG_BOX_LABEL'
  | 'PALLET_LABEL';

interface HandWorkScreenProps {
  taskId: number | null;
}

export const HandWorkScreen: React.FC<
  HandWorkScreenProps
> = ({ taskId }) => {
  const [
    showManualModal,
    setShowManualModal,
  ] = useState(false);

  const [
    expectedScan,
    setExpectedScan,
  ] = useState<ExpectedScanType | null>(null);

  const loadExpectedScan = async () => {
    try {
      const response =
        await ApiService.getTaskInWorkForTsd();

      const tasks = Array.isArray(response)
        ? response
        : response?.data || [];

      const task = tasks.find(
        (item: any) =>
          item.id === taskId,
      );

      const activeTask =
        task?.activeTasks?.[0];

      if (activeTask?.expectedScan) {
        setExpectedScan(
          activeTask.expectedScan,
        );
      }
    } catch (error) {
      console.error(
        'Ошибка получения состояния задания:',
        error,
      );
    }
  };

  const stopHandWork = () => {
    setShowManualModal(false);
  };

  useEffect(() => {
    const initialize = async () => {
      await loadExpectedScan();
      setShowManualModal(true);
    };

    void initialize();
  }, [taskId]);

  return (
    <>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.container}
      >
        <View
          style={styles.screenHeader}
        >
          <Text
            style={styles.screenTitle}
          >
            Ручная работа
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={styles.content}
          >
            <Text>
              Задание #{taskId}
            </Text>

            {expectedScan && (
              <View
                style={
                  styles.expectedScanContainer
                }
              >
                <Text
                  style={
                    styles.expectedScanTitle
                  }
                >
                  Следующее сканирование
                </Text>

                <Text
                  style={
                    styles.expectedScanValue
                  }
                >
                  {expectedScan === 'PRODUCT' &&
                    'Отсканируйте товар'}

                  {expectedScan ===
                    'SMALL_BOX_LABEL' &&
                    'Отсканируйте этикетку малой коробки'}

                  {expectedScan ===
                    'BIG_BOX_LABEL' &&
                    'Отсканируйте этикетку большой коробки'}

                  {expectedScan ===
                    'PALLET_LABEL' &&
                    'Отсканируйте этикетку паллеты'}
                </Text>

                <Text
                  style={
                    styles.expectedScanType
                  }
                >
                  {expectedScan}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ManualWorkModal
        visible={showManualModal}
        onClose={stopHandWork}
        expectedScan={expectedScan}
        onExpectedScanChange={
          setExpectedScan
        }
      />
    </>
  );
};