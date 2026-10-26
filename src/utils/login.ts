import type { AuthUser } from '../types/auth';

export const AUTH_STORAGE_KEY = '@tsd/auth';

export const getErrorMessage = (error: unknown): string => {
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

export const isValidUser = (user: AuthUser): boolean => {
  return Number.isInteger(Number(user?.id)) && Number(user.id) > 0;
};
