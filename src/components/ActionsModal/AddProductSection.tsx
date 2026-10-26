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
  aggregationLevel: number;
  contentCode: string;
  isEditing: boolean;
  isAddingContent: boolean;
  isDeleting: boolean;
  isPrinting: boolean;
  onChangeCode: (value: string) => void;
  onStart: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AddProductSection: React.FC<AddProductSectionProps> = ({
  aggregationLevel,
  contentCode,
  isEditing,
  isAddingContent,
  isDeleting,
  isPrinting,
  onChangeCode,
  onStart,
  onSubmit,
  onCancel,
}) => {
  const isBusy = isAddingContent || isDeleting || isPrinting;

  return (
    <View style={styles.addSection}>
      <Text style={styles.sectionTitle}>
        Добавить продукт в{' '}
        {aggregationLevel === 3 ? 'малую коробку' : 'коробку'}
      </Text>

      {!isEditing ? (
        <TouchableOpacity
          style={[styles.primaryButton, isBusy && styles.disabledButton]}
          onPress={onStart}
          disabled={isBusy}
        >
          <Text style={styles.buttonText}>Добавить продукт</Text>
        </TouchableOpacity>
      ) : (
        <>
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

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!contentCode.trim() || isBusy) && styles.disabledButton,
            ]}
            onPress={onSubmit}
            disabled={!contentCode.trim() || isBusy}
          >
            {isAddingContent ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Подтвердить добавление</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isAddingContent}
          >
            <Text style={styles.buttonText}>Отмена</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
