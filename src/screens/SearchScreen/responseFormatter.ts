import { SearchResponse } from '../../services/types';

export interface FormattedResponse {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  showActionButton?: boolean; // Показывать ли кнопку действия
  actionButtonText?: string; // Текст на кнопке
  searchData?: any; // Данные поиска для передачи в действие
}

/**
 * Форматирует ответ от сервера поиска в удобный для отображения вид
 */
export const formatSearchResponse = (result: any): FormattedResponse => {
  // Проверяем статус ответа от сервера
  if (result.status === 'found') {
    // Определяем тип найденного кода
    const codeType = result.codeType;
    const data = result.data;

    if (codeType === 'code' && data) {
      return {
        title: '✅ Код найден',
        message: `В коробке №${data.box_number} на паллете №${data.pallet_number}`,
        type: 'success',
        showActionButton: false,
        searchData: {
          type: 'code',
          boxNumber: data.box_number,
          boxLabel: data.box_label,
          palletNumber: data.pallet_number,
          id: data.id,
        },
      };
    }

    if (codeType === 'box' && data) {
      return {
        title: '✅ Коробка найдена',
        message: `Коробка №${data.box_number} находится на паллете №${data.pallet_number}`,
        type: 'success',
        showActionButton: true,
        actionButtonText: 'Действия с коробкой',
        searchData: {
          type: 'box',
          boxNumber: data.box_number,
          boxLabel: data.box_label,
          palletNumber: data.pallet_number,
          id: data.id,
        },
      };
    }

    if (codeType === 'pallet' && data) {
      return {
        title: `✅ Паллета №${data.pallet_number} найдена`,
        message: ``,
        type: 'success',
        showActionButton: true,
        actionButtonText: 'Действия с паллетой',
        searchData: {
          type: 'pallet',
          boxNumber: data.box_number,
          palletNumber: data.pallet_number,
          id: data.id,
        },
      };
    }
  }

  // Обработка статуса not_found
  if (result.status === 'not_found') {
    return {
      title: '❌ Не найдено',
      message: result.message || 'Запись не найдена в системе',
      type: 'error',
      showActionButton: false,
    };
  }

  // Обработка статуса invalid_format
  if (result.status === 'invalid_format') {
    return {
      title: '⚠️ Неверный формат',
      message: result.message || 'Неверный формат кода',
      type: 'error',
      showActionButton: false,
    };
  }

  // Если есть сообщение об ошибке
  if (result.message) {
    const hasError =
      result.message.toLowerCase().includes('ошибка') ||
      result.status === 'error';

    return {
      title: hasError ? '⚠️ Ошибка' : 'ℹ️ Информация',
      message: result.message,
      type: hasError ? 'error' : 'info',
      showActionButton: false,
    };
  }

  // Неизвестный формат ответа
  return {
    title: '⚠️ Неизвестный ответ',
    message: 'Сервер вернул неизвестный формат данных',
    type: 'error',
    showActionButton: false,
  };
};

/**
 * Форматирует ошибку сети
 */
export const formatNetworkError = (): FormattedResponse => {
  return {
    title: '❌ Ошибка соединения',
    message: 'Проверьте подключение к интернету',
    type: 'error',
    showActionButton: false,
  };
};
