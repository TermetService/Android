import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';
import type { TaskTab } from '../../types/task';

interface TaskSelectionHeaderProps {
  searchText: string;
  activeTab: TaskTab;
  activeCount: number;
  historyCount: number;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: TaskTab) => void;
}

export const TaskSelectionHeader: React.FC<TaskSelectionHeaderProps> = ({
  searchText,
  activeTab,
  activeCount,
  historyCount,
  onSearchChange,
  onTabChange,
}) => (
  <View style={styles.taskSelectionSearchContainer}>
    <TextInput
      value={searchText}
      onChangeText={onSearchChange}
      placeholder="Поиск по названию, GTIN и партии"
      placeholderTextColor="#888"
      style={styles.taskSelectionSearchInput}
      clearButtonMode="while-editing"
      returnKeyType="search"
      autoCorrect={false}
    />

    <View style={styles.taskSelectionTabs}>
      <TouchableOpacity
        style={[
          styles.taskSelectionTab,
          activeTab === 'active' && styles.taskSelectionTabActive,
        ]}
        onPress={() => onTabChange('active')}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.taskSelectionTabText,
            activeTab === 'active' && styles.taskSelectionTabTextActive,
          ]}
        >
          Активные ({activeCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.taskSelectionTab,
          activeTab === 'history' && styles.taskSelectionTabActive,
        ]}
        onPress={() => onTabChange('history')}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.taskSelectionTabText,
            activeTab === 'history' && styles.taskSelectionTabTextActive,
          ]}
        >
          История ({historyCount})
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
