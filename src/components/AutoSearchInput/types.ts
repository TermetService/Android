export interface AutoSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  // autoSendLength удалён
}