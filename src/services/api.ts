// src/services/api.ts (полный файл)
import { Config } from '../config';
import { Alert, Platform } from 'react-native';

export class ApiService {
  // Вспомогательный метод для проверки ошибки таблицы
  private static isTableNotExistsError(responseText: string): boolean {
    return (
      responseText.includes('Таблица') &&
      (responseText.includes('не существует') ||
        responseText.includes('does not exist'))
    );
  }

  private static handleTableNotExistsError(): any {
    return {
      message: 'Фасовка не начата',
      error: 'TABLE_NOT_EXISTS',
    };
  }

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

      if (this.isTableNotExistsError(responseText)) {
        console.log('Обнаружена ошибка: таблица не существует');
        return this.handleTableNotExistsError();
      }

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Ошибка поиска:', error);

      if (error instanceof Error && this.isTableNotExistsError(error.message)) {
        return this.handleTableNotExistsError();
      }

      return {
        message: `Ошибка: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
      };
    }
  }

  static async searchByBoxNumber(boxNumber: any) {
    try {
      const response = await fetch(
        `${Config.SERVER_URL}/code/searchByBoxNumber?boxNumber=${boxNumber}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        if (this.isTableNotExistsError(errorText)) {
          console.log('Обнаружена ошибка: таблица не существует');
          Alert.alert('Информация', 'Фасовка не начата');
          return null;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();

      if (!text || text.trim() === '') {
        console.warn('Пустой ответ от сервера для boxNumber:', boxNumber);
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Ошибка в searchByBoxNumber:', error);
      return null;
    }
  }

  static async getAllPallets(page: number = 1, limit: number = 50) {
    try {
      const url = `${Config.SERVER_URL}/code/allPallets?page=${page}&limit=${limit}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (this.isTableNotExistsError(errorText)) {
          console.log('Обнаружена ошибка: таблица не существует');
          return { data: [], total: 0, message: 'Фасовка не начата' };
        }

        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения паллет:', error);
      return { data: [], total: 0 };
    }
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

  static async PrintBox(boxNumber: any, countInBox: any) {
    try {
      const response = await fetch(`${Config.SERVER_URL}/printer/print-box`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boxNumber, countInBox }),
      });
      return response;
    } catch (error) {
      console.error('Ошибка печати коробки:', error);
      throw error;
    }
  }

  static async PrintPallet(
    palletNumber: any,
    countInPallet: any,
    productCountInPallet: any,
  ) {
    try {
      const response = await fetch(
        `${Config.SERVER_URL}/printer/print-pallet`,
        {
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
        },
      );
      return response;
    } catch (error) {
      console.error('Ошибка печати паллеты:', error);
      throw error;
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
      console.log(`Ручное сохранение кода: ${responseText}`);

      if (this.isTableNotExistsError(responseText)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      const responseData = JSON.parse(responseText);
      const isAddCode = responseData.result?.isAddCode === true;

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

      if (error instanceof Error && this.isTableNotExistsError(error.message)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      return {
        success: false,
        message: `Ошибка: попробуйте ещё раз.`,
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

      if (this.isTableNotExistsError(responseText)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} - ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Ошибка добавления кода:', error);

      if (error instanceof Error && this.isTableNotExistsError(error.message)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      return {
        success: false,
        message: `Ошибка: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`,
      };
    }
  }

  static async moveBoxToPallet(boxNumber: any, newPalletNumber: any) {
    try {
      console.log(
        `Перемещение коробки ${boxNumber} на паллету ${newPalletNumber}`,
      );

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

      const responseText = await response.text();
      console.log('Ответ перемещения:', responseText);

      if (this.isTableNotExistsError(responseText)) {
        Alert.alert('Информация', 'Фасовка не начата');
        return { ok: false, message: 'Фасовка не начата' };
      }

      return response;
    } catch (error) {
      console.error('Ошибка перемещения коробки:', error);
      throw error;
    }
  }

  static async deleteCodes(codes: any) {
    try {
      console.log(`Удаление кодов:`, codes);

      const response = await fetch(`${Config.SERVER_URL}/code/deleteCodes`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codes }),
      });

      const responseText = await response.text();
      console.log('Ответ от сервера (deleteCodes):', responseText);

      if (this.isTableNotExistsError(responseText)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      return {
        success: response.ok,
        message: responseText,
      };
    } catch (error) {
      console.error('Ошибка удаления кода:', error);

      if (error instanceof Error && this.isTableNotExistsError(error.message)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

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
        body: JSON.stringify({ boxNumber }),
      });

      const responseText = await response.text();
      console.log('Ответ от сервера (deleteBox):', responseText);

      if (this.isTableNotExistsError(responseText)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      const isSuccess = responseText === 'Короб успешно удален';

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

      if (error instanceof Error && this.isTableNotExistsError(error.message)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

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
        body: JSON.stringify({ palletNumber }),
      });

      const responseText = await response.text();
      console.log('Ответ от сервера (deletePallet):', responseText);

      if (this.isTableNotExistsError(responseText)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

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

      if (error instanceof Error && this.isTableNotExistsError(error.message)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }

  static async removeBoxFromPallet(boxNumber: number) {
    try {
      console.log(`Изъятие коробки из паллеты - ${boxNumber}`);

      const response = await fetch(
        `${Config.SERVER_URL}/code/removeBoxFromPallet`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ boxNumber }),
        },
      );

      const responseText = await response.text();
      console.log('Ответ от сервера (removeBoxFromPallet):', responseText);

      if (this.isTableNotExistsError(responseText)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      const isSuccess = responseText === 'Короб успешно изъят из паллеты';

      if (!response.ok || !isSuccess) {
        throw new Error(responseText || `Ошибка HTTP: ${response.status}`);
      }

      return {
        success: true,
        message: responseText,
        data: { boxNumber },
      };
    } catch (error) {
      console.error('Ошибка изъятия коробки из паллеты:', error);

      if (error instanceof Error && this.isTableNotExistsError(error.message)) {
        return {
          success: false,
          message: 'Фасовка не начата',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }
}
