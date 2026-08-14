// components/ReturnCodeModal/types.ts
export interface ReturnCodeModalProps {
    visible: boolean;
    code: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}