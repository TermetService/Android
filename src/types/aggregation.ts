export type AggregationScanType =
  | 'PRODUCT'
  | 'SMALL_BOX_LABEL'
  | 'BIG_BOX_LABEL'
  | 'PALLET_LABEL';

export type ExpectedScanType = AggregationScanType;

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

export type ActionTarget = {
  scanType: AggregationScanType;
  code: string;
  isCurrent: boolean;
};
