import React from 'react';

import { LoginScreenView } from '../../components/Login/LoginScreenView';
import { useLogin } from '../../hooks/useLogin';
import type { AuthUser } from '../../types/auth';

interface LoginScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

export const Index: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
  const model = useLogin({ onAuthenticated });

  return <LoginScreenView {...model} />;
};
