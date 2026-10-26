import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Config } from '../config';
import { ApiService } from '../services/api';
import type { AuthUser, Credentials } from '../types/auth';
import {
  AUTH_STORAGE_KEY,
  getErrorMessage,
  isValidUser,
} from '../utils/login';

interface UseLoginOptions {
  onAuthenticated: (user: AuthUser) => void;
}

export const useLogin = ({ onAuthenticated }: UseLoginOptions) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [savedUsername, setSavedUsername] = useState('');

  const [checkingSaved, setCheckingSaved] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authenticate = useCallback(
    (user: AuthUser): void => {
      if (!isValidUser(user)) {
        throw new Error('Сервер не вернул корректный ID пользователя');
      }

      Config.TSD_ID = Number(user.id);
      onAuthenticated(user);
    },
    [onAuthenticated],
  );

  const saveCredentials = async (credentials: Credentials): Promise<void> => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
    } catch {
      // Не блокируем вход, если данные не удалось сохранить.
    }
  };

  // Восстанавливаем сессию при запуске приложения.
  useEffect(() => {
    let active = true;

    const restoreLogin = async (): Promise<void> => {
      try {
        const json = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (!json) {
          return;
        }

        let credentials: Credentials;

        try {
          credentials = JSON.parse(json) as Credentials;
        } catch {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        if (
          typeof credentials.username !== 'string' ||
          !credentials.username.trim() ||
          typeof credentials.password !== 'string' ||
          !credentials.password
        ) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        if (!active) {
          return;
        }

        setUsername(credentials.username);
        setSavedUsername(credentials.username);
        setSavedKey(typeof credentials.key === 'string' ? credentials.key : '');

        try {
          const user = (await ApiService.authUser(
            credentials.username,
            credentials.password,
            credentials.key ?? '',
          )) as AuthUser;

          if (!active) {
            return;
          }

          if (!isValidUser(user)) {
            throw new Error('Сервер не вернул корректный ID пользователя');
          }

          await saveCredentials({
            username: credentials.username,
            password: credentials.password,
            key: user.key,
          });

          if (!active) {
            return;
          }

          setSavedKey(user.key ?? '');
          authenticate(user);
        } catch (err) {
          if (active) {
            setError(
              `Автоматический вход не выполнен: ${getErrorMessage(err)}`,
            );
          }
        }
      } catch {
        if (active) {
          setError('Не удалось прочитать сохранённые данные.');
        }
      } finally {
        if (active) {
          setCheckingSaved(false);
        }
      }
    };

    void restoreLogin();

    return () => {
      active = false;
    };
  }, [authenticate]);

  const handleLogin = async (): Promise<void> => {
    if (loading) {
      return;
    }

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError('Введите логин и пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Используем сохранённый ключ только для того же пользователя.
      const key = cleanUsername === savedUsername ? savedKey : '';

      const user = (await ApiService.authUser(
        cleanUsername,
        password,
        key,
      )) as AuthUser;

      if (!isValidUser(user)) {
        throw new Error('Сервер не вернул корректный ID пользователя');
      }

      // Сохраняем обновлённый ключ сессии.
      await saveCredentials({
        username: cleanUsername,
        password,
        key: user.key,
      });

      setSavedUsername(cleanUsername);
      setSavedKey(user.key ?? '');

      authenticate(user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    checkingSaved,
    error,
    handleLogin,
    loading,
    password,
    setPassword,
    setUsername,
    username,
  };
};

export type LoginModel = ReturnType<typeof useLogin>;
