import React from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { styles } from './styles';

interface SearchInputProps {
  inputRef: React.RefObject<TextInput | null>;
  value: string;
  isLoading: boolean;
  editable: boolean;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  inputRef,
  value,
  isLoading,
  editable,
  onChangeText,
  onSubmit,
}) => (
  <View style={styles.centerContainer}>
    <TextInput
      ref={inputRef}
      style={[styles.searchInput, isLoading && styles.inputDisabled]}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      placeholder={isLoading ? 'Поиск...' : 'Отсканируйте товар или упаковку'}
      placeholderTextColor="#999"
      autoCapitalize="characters"
      autoCorrect={false}
      autoFocus
      returnKeyType="done"
      blurOnSubmit={false}
      editable={editable}
    />

    {isLoading && (
      <ActivityIndicator style={styles.loader} size="small" color="#007AFF" />
    )}
  </View>
);
