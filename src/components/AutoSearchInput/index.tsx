import React, { useRef } from 'react';
import {
  TextInput,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { AutoSearchInputProps } from './types';
import { styles } from './styles';

export const AutoSearchInput: React.FC<AutoSearchInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  loading = false,
  placeholder = 'Введите код для поиска...',
  autoFocus = true,
  maxLength,
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, loading && styles.disabled]}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        editable={!loading}
        autoFocus={autoFocus}
        keyboardType="default"
        autoCapitalize="characters"
        returnKeyType="search" // Меняем на "search" для понятной иконки
        blurOnSubmit={false}
        maxLength={maxLength}
      />
      
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loaderText}>Идет поиск...</Text>
        </View>
      )}
    </View>
  );
};