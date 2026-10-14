// src/services/api.ts (полный файл)
import { Config } from '../config';

export class ApiService {
  static async searchInfo(code: string) {
    try {
      const response = await fetch(
        `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}/search-product`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = responseText;
        }

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Ошибка HTTP: ${response.status}`,
        );
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Ошибка поиска информации о товаре:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }

  static async handSave(code: string) {
    try {
      console.log(`Ручное сохранение кода: ${code}`);

      const response = await fetch(
        `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        },
      );

      const responseText = await response.text();

      let responseData: any;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        const message =
          responseData?.message ||
          responseData?.error ||
          `Ошибка HTTP: ${response.status}`;

        return {
          success: false,
          message: String(message),
          data: responseData,
          expectedScan: null,
        };
      }

      const expectedScan =
        typeof responseData === 'string'
          ? responseData
          : responseData?.expectedScan ??
            responseData?.data?.expectedScan ??
            null;

      return {
        success: true,
        message: 'Код успешно обработан',
        data: responseData,
        expectedScan,
      };
    } catch (error) {
      console.error('Ошибка обработки кода:', error);

      const message =
        error instanceof Error ? error.message : 'Ошибка: попробуйте ещё раз.';

      return {
        success: false,
        message,
        data: null,
        expectedScan: null,
      };
    }
  }

  static async addCodeToBox(packageLabel: string, code: string) {
    try {
      console.log(`Добавление товара ${code} в упаковку ${packageLabel}`);

      const response = await fetch(
        `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}/add-product-into-package`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ packageLabel, code }),
        },
      );

      const responseText = await response.text();
      console.log('Ответ добавления товара в упаковку:', responseText);

      let responseData: any;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        return {
          success: false,
          message: String(
            responseData?.message ||
              responseData?.error ||
              `Ошибка HTTP: ${response.status}`,
          ),
          data: responseData,
        };
      }

      if (!responseText.trim()) {
        throw new Error('Сервер вернул пустой ответ');
      }

      return responseData;
    } catch (error) {
      console.error('Ошибка добавления товара в упаковку:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }

  static async deleteCode(code: string) {
    try {
      console.log(`Удаление товара по коду: ${code}`);

      const response = await fetch(
        `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}/delete-code`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        },
      );

      const responseText = await response.text();
      console.log('Ответ удаления товара:', responseText);

      let responseData: any;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        return {
          success: false,
          message: String(
            responseData?.message ||
              responseData?.error ||
              `Ошибка HTTP: ${response.status}`,
          ),
          data: responseData,
        };
      }

      return {
        success: true,
        message: responseData?.message || responseText || 'Товар удалён',
        data: responseData,
      };
    } catch (error) {
      console.error('Ошибка удаления товара:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }

  static async deletePackage(packageLabel: string) {
    try {
      console.log(`Удаление упаковки по этикетке: ${packageLabel}`);

      const response = await fetch(
        `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}/delete-package`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ packageLabel }),
        },
      );

      const responseText = await response.text();
      console.log('Ответ удаления упаковки:', responseText);

      let responseData: any;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        return {
          success: false,
          message: String(
            responseData?.message ||
              responseData?.error ||
              `Ошибка HTTP: ${response.status}`,
          ),
          data: responseData,
        };
      }

      return {
        success: true,
        message: responseData?.message || responseText || 'Упаковка удалена',
        data: responseData,
      };
    } catch (error) {
      console.error('Ошибка удаления упаковки:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }

  static async moveBox(boxLabel: string, palletLabel: string) {
    try {
      console.log(`Перемещение коробки ${boxLabel} в паллету ${palletLabel}`);

      const response = await fetch(
        `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}/move-box`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ boxLabel, palletLabel }),
        },
      );

      const responseText = await response.text();

      let responseData: any;

      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      if (!response.ok || responseData?.success === false) {
        return {
          success: false,
          message: String(
            responseData?.message ||
              responseData?.error ||
              `Ошибка HTTP: ${response.status}`,
          ),
          data: responseData,
        };
      }

      return {
        success: true,
        message: responseData?.message || 'Коробка перемещена в паллету',
        data: responseData,
      };
    } catch (error) {
      console.error('Ошибка перемещения коробки:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }

  static async PrintSmallBox(boxNumber: number, taskId: number) {
    try {
      return await fetch(`${Config.SERVER_URL}/printer/print-box`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boxNumber, taskId }),
      });
    } catch (error) {
      console.error('Ошибка печати этикетки малой коробки:', error);
      throw error;
    }
  }

  static async PrintBox(boxNumber: number, taskId: number) {
    try {
      return await fetch(`${Config.SERVER_URL}/printer/print-box`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boxNumber, taskId }),
      });
    } catch (error) {
      console.error('Ошибка печати этикетки большой коробки:', error);
      throw error;
    }
  }

  static async PrintPallet(palletNumber: number, taskId: number) {
    try {
      return await fetch(`${Config.SERVER_URL}/printer/print-pallet`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ palletNumber, taskId }),
      });
    } catch (error) {
      console.error('Ошибка печати этикетки паллеты:', error);
      throw error;
    }
  }

  static async getTaskInWorkForTsd() {
    try {
      const response = await fetch(
        `${Config.SERVER_URL}/task/tsd/${Config.TSD_ID}/in-work`,
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
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения задания в работе:', error);
      throw error;
    }
  }

  static async getTaskUnprocessedForTsd() {
    try {
      const response = await fetch(
        `${Config.SERVER_URL}/task/tsd/${Config.TSD_ID}/unprocessed`,
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
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения необработанного задания:', error);
      throw error;
    }
  }

  static async startTask(taskId: number) {
    try {
      const response = await fetch(
        `${Config.SERVER_URL}/task/${taskId}/start`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tsdId: Config.TSD_ID }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`Ошибка запуска задания ${taskId}:`, error);
      throw error;
    }
  }

  static async getActiveTask() {
    try {
      const response = await fetch(
        `${Config.SERVER_URL}/task/tsd/active/${Config.TSD_ID}`,
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
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`Нет активного задания`, error);
      throw error;
    }
  }
}
