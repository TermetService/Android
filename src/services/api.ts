import { Config } from '../config';
import {
  Alert,
  Platform
} from 'react-native';

export class ApiService {
  // services/api.ts
  // services/api.ts
  static async searchCode(query: string) {
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
      console.log('Текст ответа:', responseText);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      // Проверяем на пустой ответ
      if (!responseText || responseText.trim() === '') {
        // Пустой ответ - считаем, что код не найден
        return { message: 'Код не найден' };
      }

      // Пытаемся распарсить JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Если не парсится - считаем ошибкой
        throw new Error('Некорректный ответ от сервера');
      }

      // Если нет code - считаем, что код не найден
      if (!data.code) {
        return { message: 'Код не найден', from: data.from };
      }
      // Alert.alert(' Успешно--------data--', `${JSON.stringify(data)}`);

      return data;

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
      // Alert.alert('Debug Parsed',
      //   `message: ${result.message}\n` +
      //   `isAddCode: ${result.isAddCode}\n` +
      //   `keys: ${Object.keys(result).join(', ')}`
      // );

      // ИСПРАВЛЕНО: обращаемся к result.isAddCode, а не result.result?.isAddCode
      return {
        success: result.isAddCode === true,  // ← ИЗМЕНЕНИЕ ЗДЕСЬ
        message: result.message,
        data: result
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

  static async continueWork(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log(`Запрос на продолжение работы`);

      const requestData: any = {};

      // Можно добавить timestamp или другую информацию
      requestData.timestamp = new Date().toISOString();
      requestData.deviceInfo = {
        platform: Platform.OS,
        // можно добавить другую информацию об устройстве
      };

      console.log('Данные для continue:', requestData);

      const response = await fetch(`${Config.SERVER_URL}/modbus/continue`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseText = await response.text();
      console.log('Ответ continue:', responseText);
      // Alert.alert(`Error, ${JSON.stringify(responseText)}`);
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      const result = JSON.parse(responseText);

      // Разные форматы ответа от сервера
      return {
        success: result.success === true ||
          result.status === 'success' ||
          result.message?.toLowerCase().includes('успех'),
        message: result.message || 'Операция выполнена',
        data: result
      };

    } catch (error) {
      console.error('Ошибка continue:', error);
      return {
        success: false,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  static async addCodeToBox(code: string, boxNumber: number) {
    try {
      console.log(`Добавление кода ${code} в упаковку ${boxNumber}`);

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

  static async bindLabelToBox(boxLabel: string, boxNumber: number) {
    try {
      console.log(`Привязка этикетки ${boxLabel} к упаковке ${boxNumber}`);
      // Alert.alert(' Успешно----------', boxLabel,);
      // Alert.alert(' Успешно--------222--', `${boxNumber}`);

      const response = await fetch(`${Config.SERVER_URL}/code/bindLabel`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boxLabel, boxNumber }),
      });

      const responseText = await response.text();
      console.log('Ответ привязки:', responseText);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Ошибка привязки этикетки:', error);
      return {
        success: false,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }
}