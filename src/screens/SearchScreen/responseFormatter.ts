// src/screens/responseFormatter.ts
import { SearchFrom, SearchResponse } from '../../services/types';

export interface FormattedResponse {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  showActionButton: boolean;
  actionButtonText?: string;
  searchData?: {
    type: 'code';
    palletNumber?: number;
    id?: number;
    code?: string;
    countIn?: number;
  };
}

export const formatSearchResponse = (result: any): FormattedResponse => {
  console.log('Форматирование ответа:', JSON.stringify(result, null, 2));

  if (!result) {
    return {
      title: '❌ Ошибка',
      message: 'Пустой ответ от сервера',
      type: 'error',
      showActionButton: false,
    };
  }

  // Проверяем ошибку "Фасовка не начата"
  if (
    result.message === 'Фасовка не начата' ||
    result.error === 'TABLE_NOT_EXISTS'
  ) {
    return {
      title: 'ℹ️ Информация',
      message: 'Фасовка не начата. Обратитесь к оператору для начала фасовки.',
      type: 'info',
      showActionButton: false,
    };
  }

  // Проверяем сообщение об ошибке (код не найден, коробка не найдена и т.д.)
  if (result.message) {
    // Проверяем на ошибки таблицы
    if (
      result.message.includes('Таблица') &&
      result.message.includes('не существует')
    ) {
      return {
        title: 'ℹ️ Информация',
        message:
          'Фасовка не начата. Обратитесь к оператору для начала фасовки.',
        type: 'info',
        showActionButton: false,
      };
    }

    // Определяем тип сообщения
    const isNotFound =
      result.message.toLowerCase().includes('Cannot read') ||
      result.message.toLowerCase().includes('read') ||
      result.message.toLowerCase().includes('not found');

    const isError =
      result.message.toLowerCase().includes('ошибка') ||
      result.message.toLowerCase().includes('error');

    if (isNotFound) {
      return {
        title: '❌ Не найдено',
        message: 'Ошибка связана с неправильным кодом или сервером.',
        type: 'error',
        showActionButton: false,
      };
    }

    if (isError) {
      return {
        title: '❌ Ошибка',
        message: result.message,
        type: 'error',
        showActionButton: false,
      };
    }

    // Обычное информационное сообщение
    return {
      title: 'ℹ️ Информация',
      message: result.message,
      type: 'info',
      showActionButton: false,
    };
  }

  // Проверяем наличие code и from
  if (!result.code) {
    return {
      title: '⚠️ Ошибка данных',
      message: 'Сервер вернул некорректные данные',
      type: 'error',
      showActionButton: false,
    };
  }

  // Безопасно извлекаем данные из code
  const codeEntity = result.code || {};
  const from = result.from;
  const countIn = result.countIn || 0;

  // Проверяем from
  if (!from) {
    return {
      title: '⚠️ Неизвестный тип',
      message: 'Не удалось определить тип найденного объекта',
      type: 'error',
      showActionButton: false,
    };
  }

  switch (from) {
    case SearchFrom.Code:
      return {
        title: '✅ Код найден',
        message:
          `Код: ${codeEntity.code || 'Неизвестно'}\n` +
          `Код существует в текущей фасовке\n`,
        type: 'success',
        showActionButton: false,
        searchData: {
          type: 'code',
          id: codeEntity.id,
          code: codeEntity.code,
          countIn,
        },
      };
    default:
      return {
        title: '✅ Найдено',
        message: `Тип: ${from}\nКод: ${codeEntity.code || 'Неизвестно'}`,
        type: 'success',
        showActionButton: false,
      };
  }
};

export const formatNetworkError = (): FormattedResponse => {
  return {
    title: '❌ Ошибка соединения',
    message:
      'Не удалось подключиться к серверу. Проверьте подключение к интернету.',
    type: 'error',
    showActionButton: false,
  };
};
