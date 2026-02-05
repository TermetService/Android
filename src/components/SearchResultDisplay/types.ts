export interface SearchResultDisplayProps {
  result?: {
    success: boolean;
    message?: string;
    boxNumber?: number | string;
    type?: string;
    from?: 'code' | 'box'; // Добавляем
  };
  loading?: boolean;
}