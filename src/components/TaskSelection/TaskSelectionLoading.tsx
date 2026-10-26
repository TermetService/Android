import React from 'react';

import { ScreenLoader } from '../common/ScreenLoader';
import { styles } from './styles';

export const TaskSelectionLoading: React.FC = () => (
  <ScreenLoader
    text="Загрузка заданий..."
    containerStyle={styles.container}
    contentStyle={styles.taskSelectionLoading}
    textStyle={styles.taskSelectionLoadingText}
  />
);
