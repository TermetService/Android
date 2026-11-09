import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  burgerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#f8d7da',
    borderRadius: 7,
  },

  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#721c24',
  },

  burgerIcon: {
    fontSize: 30,
    color: '#222',
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  tsdId: {
    marginLeft: 'auto',
    fontSize: 15,
    color: '#666',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },

  menuContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 285,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomRightRadius: 10,
    paddingVertical: 10,
    elevation: 10,
  },

  menuHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
  },

  menuTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
  },

  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 22,
    color: '#666',
  },

  menuItem: {
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
  },

  menuItemText: {
    fontSize: 17,
    color: '#222',
  },

  screenHeader: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 2,
    elevation: 2,
  },

  screenTitle: {
    flex: 1,
    marginLeft: 14,
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
});
