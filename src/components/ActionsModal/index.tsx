import React from 'react';

import { SearchActionsModalView } from './SearchActionsModalView';
import { useSearchActionsModal } from '../../hooks/useSearchActionsModal';
import type { AggregationInfo } from '../../types/aggregation';

interface SearchActionsModalProps {
  visible: boolean;
  scanResult: AggregationInfo;
  onClose: () => void;
  onDeleteSuccess: () => void;
  onRefresh: (updated: AggregationInfo) => void;
}

export const SearchActionsModal: React.FC<SearchActionsModalProps> = ({
  visible,
  scanResult,
  onClose,
  onDeleteSuccess,
  onRefresh,
}) => {
  const model = useSearchActionsModal({
    scanResult,
    onClose,
    onDeleteSuccess,
    onRefresh,
  });

  return (
    <SearchActionsModalView
      visible={visible}
      scanResult={scanResult}
      onClose={onClose}
      model={model}
    />
  );
};

export type {
  AggregationInfo,
  AggregationScanType,
} from '../../types/aggregation';
