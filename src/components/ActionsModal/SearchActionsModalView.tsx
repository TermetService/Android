import React from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';

import { CustomAlert } from '../CustomAlert';
import { ActionsHeader } from './ActionsHeader';
import { ActionEntityBlock } from './ActionEntityBlock';
import type { SearchActionsModalModel } from '../../hooks/useSearchActionsModal';
import { styles } from './styles';
import type { AggregationInfo } from '../../types/aggregation';

interface SearchActionsModalViewProps {
  visible: boolean;
  scanResult: AggregationInfo;
  onClose: () => void;
  model: SearchActionsModalModel;
}

export const SearchActionsModalView: React.FC<SearchActionsModalViewProps> = ({
  visible,
  scanResult,
  onClose,
  model,
}) => (
  <>
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        <ActionsHeader
          disabled={
            model.isDeleting ||
            model.isAddingContent ||
            model.printingType !== null
          }
          onClose={onClose}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.actions}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={styles.sectionTitle}>Объекты и их действия</Text>

          {model.actionTargets.map(target => (
            <ActionEntityBlock
              key={`${target.scanType}-${target.code}-${
                target.isCurrent ? 'current' : 'parent'
              }`}
              target={target}
              scanResult={scanResult}
              model={model}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>

    <CustomAlert
      visible={model.alertVisible}
      title={model.alertOptions.title}
      message={model.alertOptions.message}
      type={model.alertOptions.type}
      onClose={model.hideAlert}
      autoCloseTime={model.alertOptions.autoCloseTime}
      closeDelay={model.alertOptions.closeDelay}
      confirmText={model.alertOptions.confirmText}
      cancelText={model.alertOptions.cancelText}
      onConfirm={model.alertOptions.onConfirm}
    />
  </>
);
