import React from 'react';
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

import { styles } from './styles';

interface LoginFormProps {
  username: string;
  password: string;
  loading: boolean;
  error: string;
  onChangeUsername: (value: string) => void;
  onChangePassword: (value: string) => void;
  onLogin: () => void | Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  loading,
  error,
  onChangeUsername,
  onChangePassword,
  onLogin,
}) => (
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
            onChangeText={onChangeUsername}
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
            onChangeText={onChangePassword}
            placeholder="Введите пароль"
            secureTextEntry
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={() => void onLogin()}
          />
        </View>

        {!!error && (
          <View style={styles.loginError}>
            <Text style={styles.loginErrorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={() => void onLogin()}
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
