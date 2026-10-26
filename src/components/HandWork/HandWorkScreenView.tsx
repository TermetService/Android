import React from 'react';
import { View } from 'react-native';

import { CustomAlert } from '../CustomAlert';
import type { HandWorkScreenModel } from '../../hooks/useHandWorkScreen';
import { TaskCompletionModal } from './TaskCompletionModal';
import { CheckTaskButton } from './CheckTaskButton';
import { ExpectedScanCard } from './ExpectedScanCard';
import { FillProgressPanel } from './FillProgressPanel';
import { QueueInfo } from './QueueInfo';
import { ScanInput } from './ScanInput';
import { ServerStatusBar } from './ServerStatusBar';
import { styles } from './styles';

export const HandWorkScreenView: React.FC<HandWorkScreenModel> = ({
  alertOptions,
  alertVisible,
  closeCompletionModal,
  code,
  expectedScan,
  fillProgress,
  handleCodeChange,
  handleCompleteTask,
  handleOpenCompletion,
  handleSubmit,
  hideAlert,
  inputRef,
  isCompletingTask,
  isInputBlocked,
  isSubmitting,
  isValidatingTask,
  requestQueue,
  serverStatus,
  serverUrl,
  showCompletionModal,
  taskPackagingStats,
}) => {
  const inputPlaceholder =
    requestQueue.length > 0
      ? `Очередь: ${requestQueue.length} | Введите код...`
      : 'Введите код';

  return (
    <View style={styles.modalContainer}>
      <ServerStatusBar status={serverStatus} serverUrl={serverUrl} />

      <View style={styles.contentArea}>
        <ExpectedScanCard expectedScan={expectedScan} />

        {requestQueue.length > 0 && (
          <QueueInfo
            queueLength={requestQueue.length}
            isSubmitting={isSubmitting}
          />
        )}

        <CheckTaskButton
          isValidating={isValidatingTask}
          onPress={() => void handleOpenCompletion()}
        />
      </View>

      <ScanInput
        inputRef={inputRef}
        value={code}
        placeholder={inputPlaceholder}
        editable={!isInputBlocked}
        onChangeText={handleCodeChange}
        onSubmit={handleSubmit}
      />

      <FillProgressPanel progress={fillProgress} />

      <CustomAlert
        visible={alertVisible}
        title={alertOptions.title}
        message={alertOptions.message}
        type={alertOptions.type}
        onClose={hideAlert}
        autoCloseTime={alertOptions.autoCloseTime}
        closeDelay={alertOptions.closeDelay}
        confirmText={alertOptions.confirmText}
        cancelText={alertOptions.cancelText}
        onConfirm={alertOptions.onConfirm}
      />

      <TaskCompletionModal
        visible={showCompletionModal}
        stats={taskPackagingStats}
        onClose={closeCompletionModal}
        onComplete={handleCompleteTask}
        isCompleting={isCompletingTask}
      />
    </View>
  );
};
