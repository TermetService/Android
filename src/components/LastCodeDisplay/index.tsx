import React from 'react';
import { View, Text } from 'react-native';
import { LastCodeDisplayProps } from './types';
import { styles } from './styles';

export const LastCodeDisplay: React.FC<LastCodeDisplayProps> = ({
  code,
  timestamp,
  showPlaceholder = true,
}) => {
  if (code) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Последний искали:</Text>
        <Text style={styles.code}>{code}</Text>
        {timestamp && (
          <Text style={styles.timestamp}>
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        )}
      </View>
    );
  }

  if (showPlaceholder) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>
          Здесь появится последний введенный код
        </Text>
      </View>
    );
  }

  return null;
};