import { Config } from '../config';
import { Alert, Platform } from 'react-native';
import { SearchFrom, SearchResponse } from './types';

export class ApiService {
  static async searchCode(query: string): Promise<any> {
    try {
      console.log(`Поиск: ${query} на ${Config.SERVER_URL}/code/search`);

      const response = await fetch(`${Config.SERVER_URL}/code/search`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
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
        message: `Ошибка: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
      };
    }
  }

  static async handSave(code: string) {
    try {
      console.log(`Ручное сохранение кода: ${code}`);

      const response = await fetch(`${Config.SERVER_URL}/code/hand-save`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, userId: Config.USER_ID }),
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
      console.log(
        `Ручное сохранение кода: ----парсинг ${JSON.stringify(responseData)}`,
      );

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
        data: responseData,
      };
    } catch (error) {
      console.error('Ошибка ручного сохранения:', error);
      return {
        success: false,
        message: `Ошибка: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
      };
    }
  }

  static async PrintBox(boxNumber: any, countInBox: any) {
    const response = await fetch(`${Config.SERVER_URL}/printer/print-box`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ boxNumber, countInBox }),
    });
  }
  static async PrintPallet(
    palletNumber: any,
    countInPallet: any,
    productCountInPallet: any,
  ) {
    const response = await fetch(`${Config.SERVER_URL}/printer/print-pallet`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        palletNumber,
        countInPallet,
        productCountInPallet,
      }),
    });
  }
  static async getProductCountInPallet(palletNumber: number) {
    try {
      console.log(`Получение количества продуктов в паллете: ${palletNumber}`);

      const response = await fetch(
        `${Config.SERVER_URL}/code/pallets/${palletNumber}/product-count`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка HTTP: ${response.status}`);
      }

      // Если сервер возвращает число напрямую
      const count = await response.json();

      console.log('Количество продуктов:', count);

      return {
        success: true,
        count: typeof count === 'number' ? count : 0,
        message: 'Успешно получено количество продуктов',
      };
    } catch (error) {
      console.error('Ошибка получения количества продуктов:', error);
      return {
        success: false,
        count: 0,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }
  static async searchByBoxNumber(boxNumber: any) {
    try {
      // Используем GET метод и передаем boxNumber как query параметр
      const response = await fetch(
        `${Config.SERVER_URL}/code/searchByBoxNumber?boxNumber=${boxNumber}`,
        {
          method: 'GET', // GET, не POST!
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          // НЕ нужно body для GET запроса
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();

      if (!text || text.trim() === '') {
        console.warn('Пустой ответ от сервера для boxNumber:', boxNumber);
        return null;
      }

      const data = JSON.parse(text);
      return data; // возвращает CodeEntity[]
    } catch (error) {
      console.error('Ошибка в searchByBoxNumber:', error);
      return null;
    }
  }

  static async MoveBoxToPallet(boxNumber: any, newPalletNumber: any) {
    console.log(boxNumber, newPalletNumber, 'хццццццццццццццццццццццццццццй');
    const response = await fetch(
      `${Config.SERVER_URL}/code/move-box-to-pallet`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boxNumber, newPalletNumber }),
      },
    );
    return response;
  }

  static async getAllPallets(page: number = 1, limit: number = 50) {
    try {
      // Формируем URL с параметрами
      const url = `${Config.SERVER_URL}/code/allPallets?page=${page}&limit=${limit}`;

      const response = await fetch(url, {
        method: 'GET', // 👈 GET метод
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data; // { data: IPalletResponse, total: number }
    } catch (error) {
      console.error('Ошибка:', error);
      return null;
    }
  }

  static async getCounts() {
    try {
      console.log(`Получение счетчиков`);

      const response = await fetch(`${Config.SERVER_URL}/code/get-counts`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
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
      console.log(
        `Получение счетчиков: ----парсинг ${JSON.stringify(responseData)}`,
      );

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
        message: `Ошибка: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
      };
    }
  }

  static async addCodeToBox(
    code: string,
    boxNumber: number,
    palletNumber: any,
    userId?: any,
  ) {
    try {
      console.log(`Добавление кода ${code} в коробку ${boxNumber}`);

      const response = await fetch(`${Config.SERVER_URL}/code/addCodeToBox`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, boxNumber, palletNumber, userId }),
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
      return result;
    } catch (error) {
      console.error('Ошибка добавления кода:', error);
      return {
        success: false,
        message: `Ошибка: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
      };
    }
  }

  static async deleteCodes(codes: any) {
    try {
      console.log(`Удаление кода: ${codes}`);

      const response = await fetch(`${Config.SERVER_URL}/code/deleteCodes`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codes }), // Только код
      });

      const responseText = await response.text();

      // Простая проверка - если ответ "Код успешно удален", то успех

      console.log('Ответ от сервера:', responseText);

      return {
        message: responseText,
      };
    } catch (error) {
      console.error('Ошибка удаления кода:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }

  static async deleteBox(boxNumber: number) {
    try {
      console.log(`Удаление коробки: ${boxNumber}`);

      const response = await fetch(`${Config.SERVER_URL}/code/deleteBox`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
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
        data: { boxNumber },
      };
    } catch (error) {
      console.error('Ошибка удаления коробки:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }
  static async deletePallet(palletNumber: number) {
    try {
      console.log(`Удаление паллеты: ${palletNumber}`);

      const response = await fetch(`${Config.SERVER_URL}/code/deletePallet`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ palletNumber }), // маленькая p
      });

      const responseText = await response.text();
      console.log('Ответ от сервера:', responseText);

      // Проверка на успешное удаление
      const isSuccess = responseText === 'Паллета успешно удалена';

      if (!response.ok || !isSuccess) {
        throw new Error(responseText || `Ошибка HTTP: ${response.status}`);
      }

      return {
        success: true,
        message: responseText,
        data: { palletNumber },
      };
    } catch (error) {
      console.error('Ошибка удаления паллеты:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }
}
