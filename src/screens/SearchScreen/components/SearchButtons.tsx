import React from 'react';
import { View } from 'react-native';
import { AddToPackageButton } from '../../../components/AddToPackageButton';
import { CodeActionsButton } from '../../../components/CodeActionsButton';
import { buttonStyles } from './buttonStyles';

interface SearchButtonsProps {
    showAddButton: boolean;
    showActions: boolean;
    loading: boolean;
    onAddToPackage: () => void;
    onOpenActionsModal: () => void;
}

export const SearchButtons = ({
    showAddButton,
    showActions,
    loading,
    onAddToPackage,
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

            {showActions && (
                <CodeActionsButton
                    onPress={onOpenActionsModal}
                    disabled={loading}
                />
            )}
        </View>
    );
};