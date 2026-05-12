export interface MenuItem {
  id: string;
  title: string;
  onPress: () => void;
}

export interface BurgerMenuProps {
  menuItems: MenuItem[];
}