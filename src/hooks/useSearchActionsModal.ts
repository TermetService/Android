import { useState } from 'react';

import { ApiService } from '../services/api';
import type {
  ActionTarget,
  AggregationInfo,
  AggregationScanType,
} from '../types/aggregation';
import { extractContainerNumber } from '../utils/aggregation';
import {
  getActionTargetName,
  getActionTargets,
  getDeleteConfirmationMessage,
} from '../utils/actionsModal';
import { useCustomAlert } from './useCustomAlert';

interface UseSearchActionsModalOptions {
  scanResult: AggregationInfo;
  onClose: () => void;
  onDeleteSuccess: () => void;
  onRefresh: (updated: AggregationInfo) => void;
}

const DELETE_CONFIRMATION_DELAY = 2000;

export const useSearchActionsModal = ({
  scanResult,
  onClose,
  onDeleteSuccess,
  onRefresh,
}: UseSearchActionsModalOptions) => {
  const {
    showAlert,
    hideAlert,
    closeAlert,
    alertVisible,
    alertOptions,
  } = useCustomAlert();

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

  const [outerCode, setOuterCode] = useState('');
  const [movingCode, setMovingCode] = useState<string | null>(null);
  const [isMovingBox, setIsMovingBox] = useState(false);

  // Полная этикетка текущего объекта, полученная с бэкенда.
  const currentObjectCode = scanResult.label?.trim() ?? '';

  const actionTargets = getActionTargets(scanResult);

  const deleteActionTarget = async (target: ActionTarget) => {
    if (!target.code) {
      showAlert({
        title: 'Ошибка удаления',
        message: 'Бэкенд не вернул этикетку объекта.',
        type: 'error',
      });
      return;
    }

    setIsDeleting(true);

    try {
      target.scanType === 'PRODUCT'
        ? await ApiService.deleteCode(target.code)
        : await ApiService.deletePackage(target.code);

      showAlert({
        title: 'Удалено',
        message: `Удаление: ${getActionTargetName(target)} выполнено`,
        type: 'success',
        onClose: () => {
          onClose();
          onDeleteSuccess();
        },
      });
    } catch (error) {
      showAlert({
        title: 'Ошибка удаления',
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось удалить объект',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (target: ActionTarget) => {
    if (!target.code) {
      showAlert({
        title: 'Ошибка удаления',
        message: 'Бэкенд не вернул этикетку объекта.',
        type: 'error',
      });
      return;
    }

    showAlert({
      title: 'Подтверждение удаления',
      message: getDeleteConfirmationMessage(target),
      type: 'error',
      closeDelay: DELETE_CONFIRMATION_DELAY,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      onConfirm: () => {
        closeAlert();
        void deleteActionTarget(target);
      },
    });
  };

  const moveBox = async (boxCode: string) => {
    const targetCode = outerCode.trim();

    if (!boxCode || !targetCode || isMovingBox) {
      return;
    }

    setIsMovingBox(true);

    try {
      await ApiService.moveBox(boxCode, targetCode);

      setOuterCode('');
      setMovingCode(null);

      // Обновляем текущий объект вместе с его родителями.
      if (currentObjectCode) {
        const refreshed = await ApiService.searchInfo(currentObjectCode);

        if (refreshed?.success !== false && refreshed?.scanType) {
          onRefresh(refreshed as AggregationInfo);
        }
      }
    } catch (error) {
      showAlert({
        title: 'Ошибка перемещения',
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось переместить упаковку',
        type: 'error',
      });
    } finally {
      setIsMovingBox(false);
    }
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

      showAlert({
        title: 'Готово',
        message: response?.message || 'Товар добавлен в упаковку',
        type: 'success',
      });
    } catch (error) {
      showAlert({
        title: 'Ошибка добавления',
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось добавить товар в упаковку',
        type: 'error',
      });
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
      showAlert({
        title: 'Ошибка печати',
        message: `Не удалось извлечь номер из этикетки:\n${target.code}`,
        type: 'error',
      });
      return;
    }

    setPrintingType(target.scanType);
    setPrintingCode(target.code);

    try {
      const taskId = await ApiService.getActiveTask();

      switch (target.scanType) {
        case 'SMALL_BOX_LABEL':
          await ApiService.PrintSmallBox(packageNumber, taskId);
          break;

        case 'BIG_BOX_LABEL':
          await ApiService.PrintBox(packageNumber, taskId);
          break;

        case 'PALLET_LABEL':
          await ApiService.PrintPallet(packageNumber, taskId);
          break;

        default:
          throw new Error('Неизвестный тип упаковки');
      }

      showAlert({
        title: 'Готово',
        message: `Этикетка отправлена на печать:\n${getActionTargetName(target)}`,
        type: 'success',
      });
    } catch (error) {
      showAlert({
        title: 'Ошибка печати',
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось напечатать этикетку',
        type: 'error',
      });
    } finally {
      setPrintingType(null);
      setPrintingCode(null);
    }
  };

  const startAddingProduct = (packageCode: string) => {
    setContentCode('');
    setAddingToPackageCode(packageCode);
  };

  const cancelAddingProduct = () => {
    setContentCode('');
    setAddingToPackageCode(null);
  };

  const startMovingBox = (boxCode: string) => {
    setOuterCode('');
    setMovingCode(boxCode);
  };

  const cancelMovingBox = () => {
    setOuterCode('');
    setMovingCode(null);
  };

  return {
    actionTargets,
    addProductToPackage,
    addingToPackageCode,
    alertOptions,
    alertVisible,
    cancelAddingProduct,
    cancelMovingBox,
    confirmDelete,
    contentCode,
    hideAlert,
    isAddingContent,
    isDeleting,
    isMovingBox,
    moveBox,
    movingCode,
    outerCode,
    printTarget,
    printingCode,
    printingType,
    setContentCode,
    setOuterCode,
    startAddingProduct,
    startMovingBox,
  };
};

export type SearchActionsModalModel = ReturnType<
  typeof useSearchActionsModal
>;
