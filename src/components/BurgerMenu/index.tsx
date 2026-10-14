import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';

export interface MenuItem {
  id: string;
  title: string;
  onPress: () => void;
}

interface BurgerMenuProps {
  menuItems: MenuItem[];
}

interface HeaderProps {
  title: string;
  menuItems: MenuItem[];
  showMenu?: boolean;
  tsd_id: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  menuItems,
  showMenu = true,
  tsd_id,
}) => {
  return (
    <View style={styles.screenHeader}>
      {showMenu && <BurgerMenu menuItems={menuItems} />}

      <Text style={[styles.screenTitle, !showMenu && { marginLeft: 0 }]}>
        {title}
      </Text>

      {tsd_id !== undefined && <Text style={styles.tsdId}>ТСД: {tsd_id}</Text>}
    </View>
  );
};


export const BurgerMenu: React.FC<BurgerMenuProps> = ({ menuItems }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMenuItemPress = (onPress: () => void) => {
    setIsVisible(false);
    onPress();
  };

  return (
    <>
      {/* Кнопка бургер-меню */}
      <TouchableOpacity
        style={styles.burgerButton}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.7}
        accessibilityLabel="Открыть меню"
      >
        <Text style={styles.burgerIcon}>☰</Text>
      </TouchableOpacity>

      {/* Выпадающее меню */}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.overlay}>
          {/* Затемнение и закрытие по нажатию вне меню */}
          <Pressable
            style={styles.backdrop}
            onPress={() => setIsVisible(false)}
          />

          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Меню</Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {menuItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.onPress)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};
