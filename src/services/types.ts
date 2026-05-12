export enum SearchFrom {
  Code = 'code',
  Box = 'box',
  Pallet = 'pallet'
}

export interface SearchResponse {
  code?: {
    id: number;
    code: string;
    box_number: number;
    pallet_number: number;
    box_label: string | null;
    pallet_label: string | null;
    created_at: string;
  };
  from?: 'code' | 'box' | 'pallet';
  message?: string;
}