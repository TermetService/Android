// App.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { HandWorkScreen } from './src/screens/HandWorkScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { BurgerMenu } from './src/components/BurgerMenu';
import { Header } from './src/components/Header';

enum Pages {
  Page1 = 'search',
  Page2 = 'handwork',
}

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Pages>(Pages.Page1);

  const renderScreen = () => {
    switch (currentScreen) {
      case Pages.Page1:
        return <SearchScreen />;
      default:
        return <SearchScreen />;
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Поиск',
      onPress: () => setCurrentScreen(Pages.Page1),
    },
  ];

  return (
    <>
      {/* <Header /> */}
      {/* Рендерим текущий экран */}
      {renderScreen()}

      {/* Бургер-меню всегда поверх экрана */}
      <BurgerMenu menuItems={menuItems} />

      {/* Toast поверх всего */}
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
