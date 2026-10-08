import React, { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

import { TaskSelectionScreen } from './src/screens/TaskSelectionScreen/TaskSelectionScreen';
import { HandWorkScreen } from './src/screens/HandWorkScreen';
import { SearchScreen } from './src/screens/SearchScreen';

import { BurgerMenu } from './src/components/BurgerMenu';

enum Pages {
  Search = 'search',
  HandWork = 'handwork',
}

const App = () => {
  const [
    currentScreen,
    setCurrentScreen,
  ] = useState<Pages>(
    Pages.HandWork,
  );

  const [
    taskId,
    setTaskId,
  ] = useState<number | null>(null);

  const handleTaskSelected = (
    selectedTaskId: number,
  ) => {
    setTaskId(selectedTaskId);
    setCurrentScreen(
      Pages.HandWork,
    );
  };

  const renderScreen = () => {
    if (!taskId) {
      return (
        <TaskSelectionScreen
          onTaskSelected={
            handleTaskSelected
          }
        />
      );
    }

    switch (currentScreen) {
      case Pages.Search:
        return <SearchScreen />;

      case Pages.HandWork:
        return (
          <HandWorkScreen
            taskId={taskId}
          />
        );

      default:
        return (
          <HandWorkScreen
            taskId={taskId}
          />
        );
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Поиск',
      onPress: () =>
        setCurrentScreen(
          Pages.Search,
        ),
    },
    {
      id: '2',
      title: 'Ручная работа',
      onPress: () =>
        setCurrentScreen(
          Pages.HandWork,
        ),
    },
  ];

  return (
    <>
      {renderScreen()}

      {taskId && (
        <BurgerMenu
          menuItems={menuItems}
        />
      )}

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'box-none',
          zIndex: 9998,
        }}
      >
        <Toast />
      </View>
    </>
  );
};

export default App;