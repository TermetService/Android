import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ApiService } from '../../services/api';
import { Config } from '../../config';
import { styles } from './styles';

const AUTH_STORAGE_KEY = '@tsd/auth';

interface AuthUser {
  id: number;
  username: string;
  role: string;
  key: string;
}

interface Credentials {
  username: string;
  password: string;
  key?: string;
}

interface LoginScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

const getErrorMessage = (error: unknown): string => {
  const e = error as {
    message?: string;
    response?: {
      data?: {
        message?: string | string[];
      };
    };
  };

  const message = e.response?.data?.message ?? e.message;

  if (Array.isArray(message)) {
    return message.join('\n');
  }

  return (
    message ?? 'Не удалось выполнить вход. Проверьте соединение с сервером.'
  );
};

const isValidUser = (user: AuthUser): boolean => {
  return Number.isInteger(Number(user?.id)) && Number(user.id) > 0;
};

export const Index: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
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

  if (checkingSaved) {
    return (
      <View style={styles.loginLoading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loginLoadingText}>Проверка авторизации...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.loginContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.loginContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Вход в систему</Text>

          <Text style={styles.loginSubtitle}>
            Авторизуйтесь для начала работы с ТСД
          </Text>

          <View style={styles.loginForm}>
            <Text style={styles.loginLabel}>Логин</Text>

            <TextInput
              style={styles.loginInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Введите логин"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="next"
            />

            <Text style={styles.loginLabel}>Пароль</Text>

            <TextInput
              style={styles.loginInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Введите пароль"
              secureTextEntry
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={() => void handleLogin()}
            />
          </View>

          {!!error && (
            <View style={styles.loginError}>
              <Text style={styles.loginErrorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={() => void handleLogin()}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
