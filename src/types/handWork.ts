import type { AggregationResponse } from '../services/api';

export interface HandSaveResult {
  success: boolean;
  message?: string;
  data?: {
    isAddCode?: boolean;
    message?: string;
    [key: string]: any;
  };
}

export type ServerStatus = 'checking' | 'online' | 'offline';

export type FillProgress = Pick<
  AggregationResponse,
  'smallBox' | 'bigBox' | 'pallet'
>;

export interface ContainerFillStats {
  label: string;
  actualCount: number;
  expectedCount: number;
  isFull: boolean;
  isOverfilled: boolean;
  missingCount: number;
  contents: string[];
}

export interface TaskPackagingStats {
  totalRecords: number;
  isValid: boolean;

  productsWithoutPackaging: string[];
  smallBoxesWithoutBigBox: string[];
  bigBoxesWithoutPallet: string[];

  productsWithoutPackagingCount: number;
  smallBoxesWithoutBigBoxCount: number;
  bigBoxesWithoutPalletCount: number;

  smallBoxes: ContainerFillStats[];
  bigBoxes: ContainerFillStats[];
  pallets: ContainerFillStats[];
}
