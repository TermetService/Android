// src/components/BurgerMenu/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { styles } from './styles';
import { Config } from '../../config';

export const Header: React.FC = () => {
  // const title = Config.USER_ID
  return (
    <View style={styles.screenHeader}>
      {/* <Text style={styles.screenTitle}>Оператор {title}</Text> */}
    </View>
  );
};