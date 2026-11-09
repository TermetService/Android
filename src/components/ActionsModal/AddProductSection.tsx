import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from './styles';

interface AddProductSectionProps {
  contentCode: string;
  isEditing: boolean;
  isAddingContent: boolean;
  isDeleting: boolean;
  isPrinting: boolean;
  onChangeCode: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AddProductSection: React.FC<AddProductSectionProps> = ({
  contentCode,
  isEditing,
  isAddingContent,
  isDeleting,
  isPrinting,
  onChangeCode,
  onSubmit,
  onCancel,
}) => {
  if (!isEditing) {
    return null;
  }

  const isBusy = isAddingContent || isDeleting || isPrinting;

  return (
    <View style={styles.addSection}>
      <TextInput
        style={styles.addInput}
        value={contentCode}
        onChangeText={onChangeCode}
        placeholder="Отсканируйте код товара"
        placeholderTextColor="#999"
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={onSubmit}
        editable={!isBusy}
        autoFocus
      />

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[
            styles.formPrimaryButton,
            (!contentCode.trim() || isBusy) && styles.disabledButton,
          ]}
          onPress={onSubmit}
          disabled={!contentCode.trim() || isBusy}
        >
          {isAddingContent ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Добавить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.formCancelButton}
          onPress={onCancel}
          disabled={isAddingContent}
        >
          <Text style={styles.buttonText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
