import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from './styles';

interface MoveBoxSectionProps {
  outerCode: string;
  isSmallBox: boolean;
  isEditing: boolean;
  isMovingBox: boolean;
  isAddingContent: boolean;
  isDeleting: boolean;
  isPrinting: boolean;
  onChangeOuterCode: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const MoveBoxSection: React.FC<MoveBoxSectionProps> = ({
  outerCode,
  isSmallBox,
  isEditing,
  isMovingBox,
  isAddingContent,
  isDeleting,
  isPrinting,
  onChangeOuterCode,
  onSubmit,
  onCancel,
}) => {
  if (!isEditing) {
    return null;
  }

  const isBusy =
    isMovingBox || isAddingContent || isDeleting || isPrinting;

  return (
    <View style={styles.addSection}>
      <TextInput
        style={styles.addInput}
        value={outerCode}
        onChangeText={onChangeOuterCode}
        placeholder={
          isSmallBox
            ? 'Отсканируйте этикетку коробки'
            : 'Отсканируйте этикетку паллеты'
        }
        placeholderTextColor="#999"
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        editable={!isMovingBox}
        autoFocus
      />

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[
            styles.formPrimaryButton,
            (!outerCode.trim() || isBusy) && styles.disabledButton,
          ]}
          onPress={onSubmit}
          disabled={!outerCode.trim() || isBusy}
        >
          {isMovingBox ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Переместить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.formCancelButton}
          onPress={onCancel}
          disabled={isMovingBox}
        >
          <Text style={styles.buttonText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
