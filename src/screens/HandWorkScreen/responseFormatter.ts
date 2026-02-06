import { SearchResponse } from "../../services/types";

export interface FormattedResponse {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Форматирует ответ от сервера поиска в удобный для отображения вид
 */
export const formatSearchResponse = (result: SearchResponse): FormattedResponse => {
  // Если есть сообщение об ошибке "не найден"
  if (result.message && result.message.includes('не найден')) {
    return {
      title: '❌ Не найдено',
      message: result.message,
      type: 'error',
    };
  }
  
  // Если найден код
  if (result.from === 'code' && result.code) {
    const { box_number, pallet_number, box_label, pallet_label } = result.code;
    let message = `Коробка: ${box_number}`;

    if (box_label) {
      message += `\nМетка коробки: ${box_label}`;
    }

    message += `\nПаллета: ${pallet_number}`;

    if (pallet_label) {
      message += `\nМетка паллеты: ${pallet_label}`;
    }

    return {
      title: '✅ Код найден',
      message,
      type: 'success',
    };
  }
  
  // Если найдена коробка
  if (result.from === 'box' && result.code) {
    const { box_number, pallet_number, box_label, pallet_label } = result.code;
    let message = `Коробка: ${box_number}`;

    if (box_label) {
      message += `\nМетка коробки: ${box_label}`;
    }

    message += `\nПаллета: ${pallet_number}`;

    if (pallet_label) {
      message += `\nМетка паллеты: ${pallet_label}`;
    }

    return {
      title: '✅ Коробка найдена',
      message,
      type: 'success',
    };
  }
  
  // Если найдена паллета
  if (result.from === 'pallet' && result.code) {
    const { box_number, pallet_number, box_label, pallet_label } = result.code;
    let message = `Коробка: ${box_number}`;

    if (box_label) {
      message += `\nМетка коробки: ${box_label}`;
    }

    message += `\nПаллета: ${pallet_number}`;

    if (pallet_label) {
      message += `\nМетка паллеты: ${pallet_label}`;
    }

    return {
      title: '✅ Паллета найдена',
      message,
      type: 'success',
    };
  }
  
  // Если есть другое сообщение от сервера
  if (result.message) {
    const hasError = result.message.toLowerCase().includes('ошибка');
    
    return {
      title: hasError ? '⚠️ Ошибка' : 'ℹ️ Информация',
      message: result.message,
      type: hasError ? 'error' : 'info',
    };
  }
  
  // Неизвестный формат ответа
  return {
    title: '⚠️ Неизвестный ответ',
    message: 'Сервер вернул неизвестный формат данных',
    type: 'error',
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
  };
};