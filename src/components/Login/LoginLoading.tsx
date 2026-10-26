import React from 'react';

import { ScreenLoader } from '../common/ScreenLoader';
import { styles } from './styles';

export const LoginLoading: React.FC = () => (
  <ScreenLoader
    text="Проверка авторизации..."
    containerStyle={styles.loginLoading}
    textStyle={styles.loginLoadingText}
  />
);
