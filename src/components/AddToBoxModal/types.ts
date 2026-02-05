export interface AddToBoxModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCode: (productCode: string) => Promise<void>;
  loading?: boolean;
  boxNumber?: number;
}