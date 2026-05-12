export interface HandSaveResult {
    success: boolean;
    message?: string;
    data?: {
        isAddCode?: boolean;
        message?: string;
        [key: string]: any;
    };
}