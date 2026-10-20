// src/services/api.ts
import { Config } from '../config';

export class ApiService {
  private static async requestJson<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const responseText = await response.text();
    let responseData: any = null;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      const message = responseData?.message || responseData?.error;
      throw new Error(
        Array.isArray(message)
          ? message.join('\n')
          : String(message || `Ошибка HTTP: ${response.status}`),
      );
    }

    return responseData as T;
  }

  private static aggregationUrl(path: string): string {
    return `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}${path}`;
  }

  private static taskUrl(path: string): string {
    return `${Config.SERVER_URL}/task${path}`;
  }

  private static errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Неизвестная ошибка';
  }

  // ---------------------------------------------------------------------------
  // Обычная фасовка
  // ---------------------------------------------------------------------------

  static async searchInfo(code: string) {
    try {
      return await this.requestJson(
        this.aggregationUrl('/search-product'),
        'POST',
        { code },
      );
    } catch (error) {
      console.error('Ошибка поиска информации о товаре:', error);
      return {
        success: false,
        message: this.errorMessage(error),
      };
    }
  }

  static async handSave(code: string) {
    try {
      console.log(`Ручное сохранение кода: ${code}`);
      const responseData = await this.requestJson<any>(
        this.aggregationUrl(''),
        'POST',
        { code },
      );

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
      return {
        success: false,
        message: this.errorMessage(error),
        data: null,
        expectedScan: null,
      };
    }
  }

  static async addCodeToBox(packageLabel: string, code: string) {
    try {
      console.log(`Добавление товара ${code} в упаковку ${packageLabel}`);
      return await this.requestJson(
        this.aggregationUrl('/add-product-into-package'),
        'POST',
        { packageLabel, code },
      );
    } catch (error) {
      console.error('Ошибка добавления товара в упаковку:', error);
      return {
        success: false,
        message: this.errorMessage(error),
      };
    }
  }

  static async deleteCode(code: string) {
    try {
      const data = await this.requestJson<any>(
        this.aggregationUrl('/delete-code'),
        'POST',
        { code },
      );

      return {
        success: true,
        message: data?.message || 'Товар удалён',
        data,
      };
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      return {
        success: false,
        message: this.errorMessage(error),
      };
    }
  }

  static async deletePackage(packageLabel: string) {
    try {
      const data = await this.requestJson<any>(
        this.aggregationUrl('/delete-package'),
        'POST',
        { packageLabel },
      );

      return {
        success: true,
        message: data?.message || 'Упаковка удалена',
        data,
      };
    } catch (error) {
      console.error('Ошибка удаления упаковки:', error);
      return {
        success: false,
        message: this.errorMessage(error),
      };
    }
  }

  static async moveBox(boxLabel: string, palletLabel: string) {
    try {
      const data = await this.requestJson<any>(
        this.aggregationUrl('/move-box'),
        'POST',
        { boxLabel, palletLabel },
      );

      if (data?.success === false) {
        return {
          success: false,
          message: data?.message || 'Не удалось переместить коробку',
          data,
        };
      }

      return {
        success: true,
        message: data?.message || 'Коробка перемещена в паллету',
        data,
      };
    } catch (error) {
      console.error('Ошибка перемещения коробки:', error);
      return {
        success: false,
        message: this.errorMessage(error),
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Печать
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Получение и запуск обычных заданий
  // ---------------------------------------------------------------------------

  static async getTaskInWorkForTsd() {
    try {
      return await this.requestJson(
        this.taskUrl(`/tsd/${Config.TSD_ID}/in-work`),
      );
    } catch (error) {
      console.error('Ошибка получения задания в работе:', error);
      throw error;
    }
  }

  static async getTaskUnprocessedForTsd() {
    try {
      return await this.requestJson(
        this.taskUrl(`/tsd/${Config.TSD_ID}/unprocessed`),
      );
    } catch (error) {
      console.error('Ошибка получения необработанных заданий:', error);
      throw error;
    }
  }

  static async startTask(taskId: number) {
    try {
      return await this.requestJson(this.taskUrl(`/${taskId}/start`), 'POST', {
        tsdId: Config.TSD_ID,
      });
    } catch (error) {
      console.error(`Ошибка запуска задания ${taskId}:`, error);
      throw error;
    }
  }

  static async completeTask() {
    try {
      return await this.requestJson(
        this.taskUrl(`/tsd/${Config.TSD_ID}/complete`),
        'POST',
      );
    } catch (error) {
      console.error('Ошибка завершения задания:', error);
      throw error;
    }
  }

  static async getActiveTask() {
    try {
      return await this.requestJson(
        this.taskUrl(`/tsd/active/${Config.TSD_ID}`),
      );
    } catch (error) {
      console.error('Нет активного задания:', error);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Получение и запуск исторических заданий
  // ---------------------------------------------------------------------------

  static async getHistoryTasks() {
    try {
      return await this.requestJson(
        this.taskUrl(`/tsd/${Config.TSD_ID}/history`),
      );
    } catch (error) {
      console.error('Ошибка получения исторических заданий для ТСД:', error);
      throw error;
    }
  }

  static async startHistoryTask(taskId: number) {
    try {
      return await this.requestJson(
        this.taskUrl(`/tsd/${Config.TSD_ID}/history/${taskId}/start`),
        'POST',
      );
    } catch (error) {
      console.error(`Ошибка запуска исторического задания ${taskId}:`, error);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Авторизация и выход
  // ---------------------------------------------------------------------------

  static async authUser(username: string, password: string): Promise<object> {
    return this.requestJson<object>(`${Config.SERVER_URL}/users/auth`, 'POST', {
      username,
      password,
    });
  }

  static async logOut() {
    try {
      await this.requestJson(
        `${Config.SERVER_URL}/users/log-out/${Config.TSD_ID}`,
        'PUT',
      );
    } catch (error) {
      console.error('Ошибка выхода пользователя:', error);
      throw error;
    }
  }

  static async validateTaskCompletion() {
    try {
      return await this.requestJson(this.aggregationUrl('/getStats'));
    } catch (error) {
      console.error('Ошибка получения статистики агрегации:', error);
      throw error;
    }
  }
}
