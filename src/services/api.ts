import { Config } from '../config';
import {
  Alert,
  Platform
} from 'react-native';
import { SearchFrom, SearchResponse } from './types';

export class ApiService {
  static async searchCode(query: string): Promise<SearchResponse> {
    try {
      console.log(`Поиск: ${query} на ${Config.SERVER_URL}/code/search`);

      const response = await fetch(`${Config.SERVER_URL}/code/search`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const responseText = await response.text();
      console.log('Текст ответа поиска:', responseText);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      return JSON.parse(responseText);

    } catch (error) {
      console.error('Ошибка поиска:', error);
      return {
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  static async handSave(code: string) {
    try {
      console.log(`Ручное сохранение кода: ${code}`);

      const response = await fetch(`${Config.SERVER_URL}/code/hand-save`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const responseText = await response.text();
      // console.log('Ответ ручного сохранения:', responseText);

      // Для отладки
      // Alert.alert('Debug Raw', `Response: ${responseText}`);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      const result = JSON.parse(responseText);

      // ОТЛАДКА - посмотрим структуру ответа
      // Alert.alert('Debug Parsed---', JSON.stringify(result));

      // ИСПРАВЛЕНО: обращаемся к result.isAddCode, а не result.result?.isAddCode
      return {
        success: result.isAddCode === true,  // ← ИЗМЕНЕНИЕ ЗДЕСЬ
        message: result.message,
      };

    } catch (error) {
      console.error('Ошибка ручного сохранения:', error);
      // Alert.alert(`Error, ${JSON.stringify(error)}`);
      return {
        success: false,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  static async addCodeToBox(code: string, boxNumber: number) {
    try {
      console.log(`Добавление кода ${code} в коробку ${boxNumber}`);

      const response = await fetch(`${Config.SERVER_URL}/code/addCodeToBox`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, boxNumber }),
      });

      const responseText = await response.text();
      console.log('Ответ добавления:', responseText);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      const result = JSON.parse(responseText);

      // Стандартизируем ответ
      return {
        success: result.success === true || result.message?.toLowerCase().includes('успешно'),
        message: result.message,
        data: result
      };
    } catch (error) {
      console.error('Ошибка добавления кода:', error);
      return {
        success: false,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  static async deleteCode(code: string) {
    try {
      console.log(`Удаление кода: ${code}`);

      const response = await fetch(`${Config.SERVER_URL}/code/deleteCode`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }), // Только код
      });

      const responseText = await response.text();

      // Простая проверка - если ответ "Код успешно удален", то успех
      const isSuccess = responseText === 'Код успешно удален';

      console.log('Ответ от сервера:', responseText);

      if (!response.ok || !isSuccess) {
        throw new Error(responseText || `Ошибка HTTP: ${response.status}`);
      }

      return {
        success: true,
        message: responseText,
        data: { code }
      };

    } catch (error) {
      console.error('Ошибка удаления кода:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  static async deleteBox(boxNumber: number) {
    try {
      console.log(`Удаление коробки: ${boxNumber}`);

      const response = await fetch(`${Config.SERVER_URL}/code/deleteBox`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boxNumber }), // Только код
      });

      Alert.alert('------------------responseText', `${response}`);
      const responseText = await response.text();

      // Простая проверка - если ответ "Код успешно удален", то успех
      const isSuccess = responseText === 'Короб успешно удален';

      console.log('Ответ от сервера:', responseText);


      if (!response.ok || !isSuccess) {
        throw new Error(responseText || `Ошибка HTTP: ${response.status}`);
      }

      return {
        success: true,
        message: responseText,
        data: { boxNumber }
      };

    } catch (error) {
      console.error('Ошибка удаления коробки:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  static async startPause() {
    try {
      console.log(`Постановка паузы`);

      const response = await fetch(`${Config.SERVER_URL}/monitoring/pause`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Ошибка постановки паузы:', error);
    }
  }

  static async continuedWork() {
    try {
      console.log(`Снятие паузы`);

      const response = await fetch(`${Config.SERVER_URL}/monitoring/continued`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

    } catch (error) {
      console.error('Ошибка продолжения работы:', error);
    }
  }
}