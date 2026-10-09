// constants/expectedScan.ts
export type ExpectedScanType =
  | 'PRODUCT'
  | 'SMALL_BOX_LABEL'
  | 'BIG_BOX_LABEL'
  | 'PALLET_LABEL';

export const EXPECTED_SCAN_LABELS: Record<ExpectedScanType, string> = {
  PRODUCT: 'Отсканируйте товар',
  SMALL_BOX_LABEL: 'Отсканируйте этикетку малой коробки',
  BIG_BOX_LABEL: 'Отсканируйте этикетку большой коробки',
  PALLET_LABEL: 'Отсканируйте этикетку паллеты',
};

export const getExpectedScanLabel = (scan: ExpectedScanType | null): string => {
  if (!scan) {
    return 'Состояние задания не определено';
  }

  return EXPECTED_SCAN_LABELS[scan] ?? 'Состояние задания не определено';
};
