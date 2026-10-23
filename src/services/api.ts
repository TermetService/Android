// src/services/api.ts
import { Config } from '../config';
import { ExpectedScanType } from '../screens/HandWorkScreen/expectedScan.ts';

export interface AggregationPosition {
  current: number;
  limit: number;
}

export interface AggregationResponse {
  smallBox: AggregationPosition | null;
  bigBox: AggregationPosition | null;
  pallet: AggregationPosition | null;
  expectedScan: ExpectedScanType;
}

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
      throw error;
    }
  }

  static async handSave(code: string): Promise<AggregationResponse> {
    try {
      console.log(`Ручное сохранение кода: ${code}`);

      return await this.requestJson<AggregationResponse>(
        this.aggregationUrl(''),
        'POST',
        { code },
      );
    } catch (error) {
      console.error('Ошибка обработки кода:', error);
      throw error;
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
      throw error;
    }
  }

  static async deleteCode(code: string): Promise<void> {
    try {
      await this.requestJson(this.aggregationUrl('/delete-code'), 'POST', {
        code,
      });
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      throw error;
    }
  }

  static async deletePackage(packageLabel: string): Promise<void> {
    try {
      await this.requestJson(this.aggregationUrl('/delete-package'), 'POST', {
        packageLabel,
      });
    } catch (error) {
      console.error('Ошибка удаления упаковки:', error);
      throw error;
    }
  }

  static async moveBox(boxLabel: string, palletLabel: string): Promise<void> {
    try {
      await this.requestJson(this.aggregationUrl('/move-box'), 'POST', {
        boxLabel,
        palletLabel,
      });
    } catch (error) {
      console.error('Ошибка перемещения коробки:', error);
      throw error;
    }
  }

  static async getCurrentState(): Promise<AggregationResponse> {
    try {

      return await this.requestJson<AggregationResponse>(
        this.aggregationUrl('/get-current-state'),
        'GET',
      );
    } catch (error) {
      console.error('Ошибка обработки кода:', error);
      throw error;
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


  static async validateTaskCompletion() {
    try {
      return await this.requestJson(this.aggregationUrl('/getStats'));
    } catch (error) {
      console.error('Ошибка получения статистики агрегации:', error);
      throw error;
    }
  }

  static async completeTask() {
    try {
      return await this.requestJson(
        this.taskUrl(`/${Config.TSD_ID}/complete`),
        'POST',
      );
    } catch (error) {
      console.error('Ошибка завершения задания:', error);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Авторизация и выход
  // ---------------------------------------------------------------------------

  static async authUser(
    username: string,
    password: string,
    key: string,
  ): Promise<object> {
    return this.requestJson<object>(`${Config.SERVER_URL}/users/auth`, 'POST', {
      username,
      password,
      key,
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
}
