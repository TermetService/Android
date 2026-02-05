export interface BindLabelModalProps {
    visible: boolean;
    onClose: () => void;
    onBind: (boxLabel: string) => Promise<void>;
    loading?: boolean;
    boxNumber?: number;
}