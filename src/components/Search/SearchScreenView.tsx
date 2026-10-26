import React from 'react';
import { ScrollView, View } from 'react-native';

import { SearchActionsModal } from '../ActionsModal';
import { SearchInput } from './SearchInput';
import { SearchResultCard } from './SearchResultCard';
import { SearchStatusBanner } from './SearchStatusBanner';
import type { SearchScreenModel } from '../../hooks/useSearchScreen';
import { styles } from './styles';

export const SearchScreenView: React.FC<SearchScreenModel> = ({
  availableParents,
  clearAllStates,
  closeActionsModal,
  handleDeleteSuccess,
  handleRefresh,
  handleSubmit,
  inputRef,
  inputValue,
  isProduct,
  isLoading,
  scanKey,
  scanResult,
  setInputValue,
  setShowActionsModal,
  showActionsModal,
  statusMessage,
  statusType,
}) => (
  <View style={styles.container}>
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <SearchInput
          key={scanKey}
          inputRef={inputRef}
          value={inputValue}
          isLoading={isLoading}
          editable={!isLoading && !showActionsModal}
          onChangeText={setInputValue}
          onSubmit={() => void handleSubmit()}
        />

        <SearchStatusBanner message={statusMessage} statusType={statusType} />

        {scanResult && (
          <SearchResultCard
            scanResult={scanResult}
            isProduct={isProduct}
            availableParents={availableParents}
            onActions={() => setShowActionsModal(true)}
            onClear={clearAllStates}
          />
        )}
      </View>
    </ScrollView>

    {scanResult && (
      <SearchActionsModal
        visible={showActionsModal}
        scanResult={scanResult}
        onClose={closeActionsModal}
        onDeleteSuccess={handleDeleteSuccess}
        onRefresh={handleRefresh}
      />
    )}
  </View>
);
