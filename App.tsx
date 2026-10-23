import React, { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

import { Index as LoginScreen } from './src/screens/LoginScreen';
import { TaskSelectionScreen } from './src/screens/TaskSelectionScreen/TaskSelectionScreen';
import { HandWorkScreen } from './src/screens/HandWorkScreen';
import { SearchScreen } from './src/screens/SearchScreen';

import { Header } from './src/components/BurgerMenu';
import type { MenuItem } from './src/components/BurgerMenu';
import { Config } from './src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './src/services/api.ts';

interface AuthUser {
  id: number;
  username: string;
  role: string;
}

enum Pages {
  TaskSelection = 'task-selection',
  Search = 'search',
  HandWork = 'handwork',
}

const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(
    null,
  );

  const [currentScreen, setCurrentScreen] = useState<Pages>(
    Pages.TaskSelection,
  );

  const [taskId, setTaskId] = useState<number | null>(null);

  const handleTaskSelected = (selectedTaskId: number) => {
    setTaskId(selectedTaskId);
    setCurrentScreen(Pages.HandWork);
  };

  const handleLogout = async () => {
    try {
      await ApiService.logOut();
    } catch (error) {
      console.error('Ошибка выхода на сервере:', error);
    } finally {
      await AsyncStorage.removeItem('@tsd/auth');
      Config.TSD_ID = 0;
      setTaskId(null);
      setCurrentScreen(Pages.TaskSelection);
      setAuthenticatedUser(null);
    }
  };

  const handleTaskCompleted = () => {
    setTaskId(null);
    setCurrentScreen(Pages.TaskSelection);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'tasks',
      title: 'Выбор задания',
      onPress: () => setCurrentScreen(Pages.TaskSelection),
    },
    {
      id: 'search',
      title: 'Поиск',
      onPress: () => setCurrentScreen(Pages.Search),
    },
    {
      id: 'handwork',
      title: 'Ручная работа',
      onPress: () => {
        setCurrentScreen(
          taskId !== null ? Pages.HandWork : Pages.TaskSelection,
        );
      },
    },
  ];

  const screenTitles: Record<Pages, string> = {
    [Pages.TaskSelection]: 'Выбор задания',
    [Pages.Search]: 'Поиск',
    [Pages.HandWork]: 'Ручная работа',
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Pages.TaskSelection:
        return <TaskSelectionScreen onTaskSelected={handleTaskSelected} />;

      case Pages.Search:
        return <SearchScreen />;

      case Pages.HandWork:
        return taskId !== null ? (
          <HandWorkScreen onTaskCompleted={handleTaskCompleted} />
        ) : (
          <TaskSelectionScreen onTaskSelected={handleTaskSelected} />
        );

      default:
        return <TaskSelectionScreen onTaskSelected={handleTaskSelected} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {authenticatedUser ? (
        <>
          <Header
            title={screenTitles[currentScreen]}
            menuItems={menuItems}
            showMenu={currentScreen !== Pages.TaskSelection}
            tsd_id={Config.TSD_ID}
            onLogout={handleLogout}
          />

          <View style={{ flex: 1 }}>{renderScreen()}</View>
        </>
      ) : (
        <LoginScreen onAuthenticated={user => setAuthenticatedUser(user)} />
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
    </View>
  );
};

export default App;
