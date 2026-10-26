import type {
  ActionTarget,
  AggregationInfo,
} from '../types/aggregation';
import { extractContainerNumber, SCAN_TYPE_TITLES } from './aggregation';

/**
 * Все этикетки приходят с бэкенда.
 * Текущий объект использует label,
 * родительские упаковки — parents.
 */
export const getActionTargets = (
  scanResult: AggregationInfo,
): ActionTarget[] => {
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

export const getActionTargetName = (target: ActionTarget): string => {
  if (target.scanType === 'PRODUCT') {
    return 'Товар';
  }

  const number = extractContainerNumber(target.code);

  return number !== null
    ? `${SCAN_TYPE_TITLES[target.scanType]} №${number}`
    : `${SCAN_TYPE_TITLES[target.scanType]} — этикетка не получена`;
};

export const canAddProductToTarget = (
  scanResult: AggregationInfo,
  target: ActionTarget,
): boolean =>
  Boolean(target.code) &&
  ((scanResult.aggregationLvl === 3 &&
    target.scanType === 'SMALL_BOX_LABEL') ||
    (scanResult.aggregationLvl === 2 &&
      target.scanType === 'BIG_BOX_LABEL'));

export const canMoveBox = (target: ActionTarget): boolean =>
  target.scanType === 'BIG_BOX_LABEL' && Boolean(target.code)
  || target.scanType === 'SMALL_BOX_LABEL' && Boolean(target.code);

export const getDeleteConfirmationMessage = (
  target: ActionTarget,
): string => {
  const targetName = getActionTargetName(target);

  switch (target.scanType) {
    case 'PRODUCT':
      return `Удалить товар?\nКод: ${target.code}`;

    case 'SMALL_BOX_LABEL':
      return `Удалить ${targetName}?\nВсе товары внутри будут удалены.`;

    case 'BIG_BOX_LABEL':
      return `Удалить ${targetName}?\nВсе коды внутри коробки будут удалены.`;

    case 'PALLET_LABEL':
      return `Удалить ${targetName}?\nВсе коробки и товары на паллете будут удалены.`;

    default:
      return `Удалить ${targetName}?`;
  }
};
