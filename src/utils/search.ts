import type { AggregationInfo } from '../types/aggregation';
import { SCAN_TYPE_TITLES } from './aggregation';

export type SearchStatusType = 'info' | 'success' | 'error';

export type ParentKey = keyof AggregationInfo['parents'];

export const DEFAULT_STATUS_MESSAGE =
  'Отсканируйте товар или этикетку упаковки';

export const scanTypeNames: Record<AggregationInfo['scanType'], string> =
  SCAN_TYPE_TITLES;

export const parentRows: ReadonlyArray<readonly [ParentKey, string]> = [
  ['smallBox', 'Малая коробка'],
  ['bigBox', 'Коробка'],
  ['pallet', 'Паллета'],
];

export const getAvailableParents = (
  scanResult: AggregationInfo | null,
): ReadonlyArray<readonly [ParentKey, string]> => {
  if (!scanResult) {
    return [];
  }

  return parentRows.filter(([key]) => {
    const value = scanResult.parents?.[key];

    return value != null && String(value).trim() !== '';
  });
};
