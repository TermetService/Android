import React from 'react';

import { LoginForm } from './LoginForm';
import { LoginLoading } from './LoginLoading';
import type { LoginModel } from '../../hooks/useLogin';

export const LoginScreenView: React.FC<LoginModel> = ({
  checkingSaved,
  error,
  handleLogin,
  loading,
  password,
  setPassword,
  setUsername,
  username,
}) => {
  if (checkingSaved) {
    return <LoginLoading />;
  }

  return (
    <LoginForm
      username={username}
      password={password}
      loading={loading}
      error={error}
      onChangeUsername={setUsername}
      onChangePassword={setPassword}
      onLogin={handleLogin}
    />
  );
};
