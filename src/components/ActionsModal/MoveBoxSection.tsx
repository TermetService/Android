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
  onStart: () => void;
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
  onStart,
  onSubmit,
  onCancel,
}) => {
  const isStartDisabled =
    isMovingBox || isAddingContent || isDeleting || isPrinting;

  return (
    <View style={styles.addSection}>
      <Text style={styles.sectionTitle}>{isSmallBox ? 'Переместить малую коробку' : 'Переместить коробку'}</Text>

      {!isEditing ? (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isStartDisabled && styles.disabledButton,
          ]}
          onPress={onStart}
          disabled={isStartDisabled}
        >
          <Text style={styles.buttonText}>Переместить</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.addInput}
            value={outerCode}
            onChangeText={onChangeOuterCode}
            placeholder={isSmallBox ? 'Отсканируйте этикетку коробки' : 'Отсканируйте этикетку паллеты'}
            placeholderTextColor="#999"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            editable={!isMovingBox}
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!outerCode.trim() || isMovingBox) && styles.disabledButton,
            ]}
            onPress={onSubmit}
            disabled={!outerCode.trim() || isMovingBox}
          >
            {isMovingBox ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Подтвердить перемещение</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isMovingBox}
          >
            <Text style={styles.buttonText}>Отмена</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
