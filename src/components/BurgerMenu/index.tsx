// src/components/BurgerMenu/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { BurgerIcon } from './BurgerIcon';
import { styles } from './styles';

export interface MenuItem {
  id: string;
  title: string;
  onPress: () => void;
}

interface BurgerMenuProps {
  menuItems: MenuItem[];
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ menuItems }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleMenu = () => {
    setIsVisible(!isVisible);
  };

  const handleMenuItemPress = (onPress: () => void) => {
    setIsVisible(false);
    onPress();
  };

  return (
    <>
      {/* Кнопка бургер-меню */}
      <TouchableOpacity
        style={styles.burgerButton}
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <BurgerIcon size={24} color="#333" />
      </TouchableOpacity>

      {/* Модальное окно меню */}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.onPress)}
              >
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};