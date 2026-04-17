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
      console.log(`Ручное сохранение кода: ----2 ${responseText}`);
      console.log(`Ручное сохранение кода: ----333 ${response.ok}`);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      const responseData = JSON.parse(responseText);
      console.log(`Ручное сохранение кода: ----парсинг ${JSON.stringify(responseData)}`);

      // Проверяем структуру ответа - isAddCode находится в result
      const isAddCode = responseData.result?.isAddCode === true;

      // Формируем сообщение для пользователя
      let message = '';
      if (isAddCode) {
        message = `Код сохранен в коробку ${responseData.result?.boxNumber}, паллета ${responseData.result?.palletNumber}`;
      } else {
        message = responseData.message || 'Не удалось сохранить код';
      }

      return {
        success: isAddCode,
        message: message,
        data: responseData
      };

    } catch (error) {
      console.error('Ошибка ручного сохранения:', error);
      return {
        success: false,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  static async getCounts() {
    try {
      console.log(`Получение счетчиков`);

      const response = await fetch(`${Config.SERVER_URL}/code/get-counts`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ userId: Config.USER_ID }),
      });
      console.log(`Получение счетчиков 2`, response);

      const responseText = await response.text();
      console.log(`Получение счетчиков 3`, responseText);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      const responseData = JSON.parse(responseText).result;
      console.log(`Получение счетчиков: ----парсинг ${JSON.stringify(responseData)}`);

      // Проверяем структуру ответа - isCounts находится в result
      const isCounts = responseData.isCounts === true;
      console.log(`=============message ${responseData.message}`);
      // Формируем сообщение для пользователя
      let message = '';
      if (isCounts) {
        message = `Счетчики получены`;
      } else {
        message = responseData.message || 'Не удалось получить счетчики';
      }

      return responseData;

    } catch (error) {
      console.error('Ошибка получения счетчиков:', error);
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
}