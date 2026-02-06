// App.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { HandWork2Screen } from './src/screens/HandWork2Screen';
import { SearchScreen } from './src/screens/HandWorkScreen';
import { BurgerMenu } from './src/components/BurgerMenu';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<'handwork' | 'handwork2'>('handwork');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'handwork':
        return <SearchScreen />;
      case 'handwork2':
        return <HandWork2Screen />;
      default:
        return <SearchScreen />;
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Экран 1 (HandWork)',
      onPress: () => setCurrentScreen('handwork'),
    },
    {
      id: '2',
      title: 'Экран 2 (HandWork2)',
      onPress: () => setCurrentScreen('handwork2'),
    },
  ];

  return (
    <>
      {/* Рендерим текущий экран */}
      {renderScreen()}
      
      {/* Бургер-меню всегда поверх экрана */}
      <BurgerMenu menuItems={menuItems} />
      
      {/* Toast поверх всего */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
        zIndex: 9998,
      }}>
        <Toast />
      </View>
    </>
  );
};

export default App;