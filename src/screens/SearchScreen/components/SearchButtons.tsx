// components/SearchButtons.tsx
import React from 'react';
import { View } from 'react-native';
import { AddToPackageButton } from '../../../components/AddToPackageButton';
import { CodeActionsButton } from '../../../components/CodeActionsButton';
import { ReturnCodeButton } from '../../../components/ReturnCodeButton'; 
import { buttonStyles } from './buttonStyles';

interface SearchButtonsProps {
    showAddButton: boolean;
    showReturnButton: boolean;  // добавляем
    showActions: boolean;
    loading: boolean;
    onAddToPackage: () => void;
    onReturnCode: () => void;   // добавляем
    onOpenActionsModal: () => void;
}

export const SearchButtons = ({
    showAddButton,
    showReturnButton,           // добавляем
    showActions,
    loading,
    onAddToPackage,
    onReturnCode,              // добавляем
    onOpenActionsModal,
}: SearchButtonsProps) => {
    return (
        <View style={buttonStyles.buttonsContainer}>
            {showAddButton && (
                <AddToPackageButton
                    onPress={onAddToPackage}
                    disabled={loading}
                />
            )}

            {showReturnButton && (
                <ReturnCodeButton
                    onPress={onReturnCode}
                    disabled={loading}
                />
            )}

            {showActions && (
                <CodeActionsButton
                    onPress={onOpenActionsModal}
                    disabled={loading}
                />
            )}
        </View>
    );
};