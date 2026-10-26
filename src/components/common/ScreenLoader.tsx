import React from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface ScreenLoaderProps {
  text: string;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({
  text,
  containerStyle,
  contentStyle,
  textStyle,
}) => {
  const content = (
    <>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={textStyle}>{text}</Text>
    </>
  );

  return (
    <View style={containerStyle}>
      {contentStyle ? <View style={contentStyle}>{content}</View> : content}
    </View>
  );
};
