import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SearchScreen } from './src/screens/SearchScreen';

const App = () => {
  return (
    <>
      <SearchScreen />
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none', // позволяет кликам проходить сквозь
        zIndex: 9999,
      }}>
        <Toast />
      </View>
    </>
  );
};

export default App;