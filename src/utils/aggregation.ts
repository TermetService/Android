import type { AggregationResponse } from '../services/api';
import type { AggregationScanType } from '../types/aggregation';

export const SCAN_TYPE_TITLES: Record<AggregationScanType, string> = {
  PRODUCT: 'Товар',
  SMALL_BOX_LABEL: 'Малая коробка',
  BIG_BOX_LABEL: 'Коробка',
  PALLET_LABEL: 'Паллета',
};

/**
 * Получает номер контейнера из полной этикетки.
 * Пример: 00746600413500000018 -> 1.
 */
export const extractContainerNumber = (
  sscc: string | null | undefined,
): string | null => {
  if (!sscc?.trim()) {
    return null;
  }

  const serialReference = sscc.substring(12, 19);
  return serialReference.replace(/^0+/, '') || '0';
};

/**
 * Ответ сервера может быть завёрнут в поле data.
 * Возвращает актуальные данные агрегации.
 */
export const unwrapAggregationResponse = (
  responseData: AggregationResponse,
): AggregationResponse => {
  const response = responseData as AggregationResponse & {
    data?: AggregationResponse;
  };

  return response.data ?? response;
};
