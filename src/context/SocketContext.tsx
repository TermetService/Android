// src/context/SocketContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Подключение к серверу
    // Для реального устройства используйте IP: 'http://192.168.1.100:3000'
    // Для эмулятора Android: 'http://10.0.2.2:3000'
    // Для эмулятора iOS: 'http://localhost:3000'
    const SOCKET_URL = 'http://172.16.16.1:3001';

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket подключен');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket отключен');
      setIsConnected(false);
    });

    socket.on('connect_error', error => {
      console.error('Ошибка подключения:', error);
    });

    // Очистка
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
