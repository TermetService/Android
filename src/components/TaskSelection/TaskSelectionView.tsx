import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { styles } from './styles';
import type { TaskSelectionModel } from '../../hooks/useTaskSelection';
import { TaskSection } from './TaskSection';
import { TaskSelectionError } from './TaskSelectionError';
import { TaskSelectionHeader } from './TaskSelectionHeader';
import { TaskSelectionLoading } from './TaskSelectionLoading';

export const TaskSelectionView: React.FC<TaskSelectionModel> = ({
  activeCount,
  activeTab,
  activeTaskId,
  error,
  filteredHistoryTasks,
  filteredTasksInWork,
  filteredUnprocessedTasks,
  handleTaskPress,
  historyCount,
  isLoading,
  isRefreshing,
  loadTasks,
  searchText,
  setActiveTab,
  setSearchText,
  showMoreActive,
  showMoreHistory,
  showMoreUnprocessed,
  startingTaskKey,
  visibleActiveCount,
  visibleHistoryCount,
  visibleUnprocessedCount,
}) => {
  if (isLoading) {
    return <TaskSelectionLoading />;
  }

  const hasSearchQuery = searchText.trim().length > 0;

  return (
    <View style={styles.container}>
      <TaskSelectionHeader
        searchText={searchText}
        activeTab={activeTab}
        activeCount={activeCount}
        historyCount={historyCount}
        onSearchChange={setSearchText}
        onTabChange={setActiveTab}
      />

      <ScrollView
        contentContainerStyle={styles.taskSelectionContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadTasks(true)}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {error !== '' && (
          <TaskSelectionError
            message={error}
            onRetry={() => void loadTasks(true)}
          />
        )}

        {activeTab === 'active' ? (
          <>
            <TaskSection
              title="В работе"
              tasks={filteredTasksInWork}
              mode="continue"
              activeTaskId={activeTaskId}
              startingTaskKey={startingTaskKey}
              visibleCount={visibleActiveCount}
              emptyText={
                hasSearchQuery ? 'Задания не найдены' : 'Нет заданий в работе'
              }
              onShowMore={showMoreActive}
              onTaskPress={handleTaskPress}
            />

            <TaskSection
              title="Доступные задания"
              tasks={filteredUnprocessedTasks}
              mode="start"
              activeTaskId={activeTaskId}
              startingTaskKey={startingTaskKey}
              visibleCount={visibleUnprocessedCount}
              emptyText={
                hasSearchQuery ? 'Задания не найдены' : 'Нет доступных заданий'
              }
              onShowMore={showMoreUnprocessed}
              onTaskPress={handleTaskPress}
            />
          </>
        ) : (
          <TaskSection
            title="История заданий"
            tasks={filteredHistoryTasks}
            mode="history"
            activeTaskId={activeTaskId}
            startingTaskKey={startingTaskKey}
            visibleCount={visibleHistoryCount}
            emptyText={
              hasSearchQuery
                ? 'По заданным условиям заданий не найдена'
                : 'Исторических заданий нет'
            }
            onShowMore={showMoreHistory}
            onTaskPress={handleTaskPress}
          />
        )}
      </ScrollView>
    </View>
  );
};
