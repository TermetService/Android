export interface CodeActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onActionPress: (action: 'delete' | 'add' | 'label') => void;
}