import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  burgerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#f8d7da',
    borderRadius: 6,
  },

  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#721c24',
  },

  burgerIcon: {
    fontSize: 27,
    color: '#222',
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  tsdId: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#666',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },

  menuContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    width: 270,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomRightRadius: 10,
    paddingVertical: 8,
    elevation: 10,
  },

  menuHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 4,
  },

  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },

  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },

  menuItem: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  menuItemText: {
    fontSize: 15,
    color: '#222',
  },
  screenHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 2,
    elevation: 2,
  },

  screenTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
});
