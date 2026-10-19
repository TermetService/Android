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
}

interface Credentials {
  username: string;
  password: string;
}

interface LoginScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

//TODO при выходе завершать сессию

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

export const Index: React.FC<LoginScreenProps> = ({
  onAuthenticated,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authenticate = useCallback(
    (user: AuthUser): void => {
      const userId = Number(user.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('Сервер не вернул корректный ID пользователя');
      }

      Config.TSD_ID = userId;
      onAuthenticated(user);
    },
    [onAuthenticated],
  );

  // Проверяем сохранённые данные при запуске приложения.
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
          !credentials.username ||
          typeof credentials.username !== 'string' ||
          !credentials.password ||
          typeof credentials.password !== 'string'
        ) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        if (!active) {
          return;
        }

        setUsername(credentials.username);

        try {
          const user = (await ApiService.authUser(
            credentials.username,
            credentials.password,
          )) as AuthUser;

          if (active) {
            authenticate(user);
          }
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
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError('Введите логин и пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = (await ApiService.authUser(
        cleanUsername,
        password,
      )) as AuthUser;

      // Проверяем ID до сохранения данных.
      const userId = Number(user.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('Сервер не вернул корректный ID пользователя');
      }

      // Сохраняем данные после успешной авторизации на сервере.
      try {
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            username: cleanUsername,
            password,
          } satisfies Credentials),
        );
      } catch {
        // Не блокируем вход, если не удалось сохранить данные.
      }

      // Устанавливаем Config.TSD_ID и переключаем экран.
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
