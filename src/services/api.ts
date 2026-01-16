import { Config } from '../config';

export class ApiService {
  static async searchCode(query: string) {
    try {
      console.log(`Поиск: ${query} на ${Config.SERVER_URL}`);
      
      const response = await fetch(`${Config.SERVER_URL}/code/search`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка поиска:', error);
      throw error;
    }
  }
}