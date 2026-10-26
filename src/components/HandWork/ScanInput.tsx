import React from 'react';
import { TextInput, View } from 'react-native';

import { styles } from './styles';

interface ScanInputProps {
  inputRef: React.RefObject<TextInput | null>;
  value: string;
  placeholder: string;
  editable: boolean;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
}

export const ScanInput: React.FC<ScanInputProps> = ({
  inputRef,
  value,
  placeholder,
  editable,
  onChangeText,
  onSubmit,
}) => (
  <View style={styles.inputWrapper}>
    <TextInput
      ref={inputRef}
      style={styles.manualWorkInput}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      placeholder={placeholder}
      placeholderTextColor="#999"
      autoCapitalize="characters"
      autoCorrect={false}
      returnKeyType="done"
      submitBehavior="submit"
      editable={editable}
    />
  </View>
);
