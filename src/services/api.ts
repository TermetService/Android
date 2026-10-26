// src/services/api.ts
import { Config } from '../config';
import type { ExpectedScanType } from '../types/aggregation';

const NETWORK_ERROR_MESSAGE =
  'Нет соединения с сервером. Проверьте подключение.';
const SERVER_ERROR_MESSAGE =
  'Сервер временно недоступен. Попробуйте позже.';
const DEFAULT_ERROR_MESSAGE =
  'Не удалось выполнить запрос. Попробуйте позже.';

const NETWORK_ERROR_PATTERN =
  /network\s*error|failed to fetch|network request failed|ошибка сети|econn|enotfound|timeout/i;
const SERVER_ERROR_PATTERN =
  /\b5\d{2}\b|internal server error|bad gateway|service unavailable|gateway timeout/i;

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
  private static async request(
    url: string,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    body?: unknown,
  ): Promise<Response> {
    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      console.error('Сетевая ошибка запроса:', error);
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    if (response.status === 0) {
      console.error('Сервер не вернул HTTP-статус:', url);
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    if (response.status >= 500) {
      console.error(`Сервер вернул ошибку ${response.status}: ${url}`);
      throw new Error(SERVER_ERROR_MESSAGE);
    }

    return response;
  }

  private static normalizeMessage(message: unknown): string {
    const text = Array.isArray(message)
      ? message.join('\n')
      : typeof message === 'string'
      ? message.trim()
      : '';

    if (!text) {
      return DEFAULT_ERROR_MESSAGE;
    }

    if (/<html|<!doctype/i.test(text)) {
      return DEFAULT_ERROR_MESSAGE;
    }

    if (NETWORK_ERROR_PATTERN.test(text)) {
      return NETWORK_ERROR_MESSAGE;
    }

    if (SERVER_ERROR_PATTERN.test(text)) {
      return SERVER_ERROR_MESSAGE;
    }

    return text;
  }

  private static async requestPrint(
    url: string,
    body: unknown,
  ): Promise<Response> {
    const response = await this.request(url, 'POST', body);

    if (!response.ok) {
      let responseText = '';

      try {
        responseText = await response.text();
      } catch (error) {
        console.error('Ошибка чтения ответа сервера:', error);
        throw new Error(NETWORK_ERROR_MESSAGE);
      }

      let message: unknown = responseText;

      try {
        const responseData = responseText ? JSON.parse(responseText) : null;
        message =
          responseData?.message ?? responseData?.error ?? responseText;
      } catch {
        // Сервер вернул не JSON — используем текст как сообщение.
      }

      throw new Error(this.normalizeMessage(message));
    }

    return response;
  }

  private static async requestJson<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const response = await this.request(url, method, body);

    let responseText: string;

    try {
      responseText = await response.text();
    } catch (error) {
      console.error('Ошибка чтения ответа сервера:', error);
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    let responseData: any = null;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      const message = responseData?.message ?? responseData?.error;
      throw new Error(this.normalizeMessage(message));
    }

    return responseData as T;
  }

  private static aggregationUrl(path: string): string {
    return `${Config.SERVER_URL}/aggregation/${Config.TSD_ID}${path}`;
  }

  private static taskUrl(path: string): string {
    return `${Config.SERVER_URL}/task${path}`;
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

  static async moveBox(innerLabel: string, outerLabel: string): Promise<void> {
    try {
      await this.requestJson(this.aggregationUrl('/move-box'), 'POST', {
        innerLabel,
        outerLabel,
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
    return this.requestPrint(`${Config.SERVER_URL}/printer/print-box`, {
      boxNumber,
      taskId,
    });
  }

  static async PrintBox(boxNumber: number, taskId: number) {
    return this.requestPrint(`${Config.SERVER_URL}/printer/print-box`, {
      boxNumber,
      taskId,
    });
  }

  static async PrintPallet(palletNumber: number, taskId: number) {
    return this.requestPrint(`${Config.SERVER_URL}/printer/print-pallet`, {
      palletNumber,
      taskId,
    });
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
