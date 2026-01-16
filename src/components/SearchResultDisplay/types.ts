export interface SearchResultDisplayProps {
  result?: {
    success: boolean;
    message?: string;
    boxNumber?: number;
    type?: string;
  };
  loading?: boolean;
}