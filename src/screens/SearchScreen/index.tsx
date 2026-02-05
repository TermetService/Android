import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AutoSearchInput } from '../../components/AutoSearchInput';
import { SearchResultDisplay } from '../../components/SearchResultDisplay';
import { CodeActionsModal } from '../../components/CodeActionsModal';
import { BindLabelModal } from '../../components/BindLabelModal';
import { Config } from '../../config';
import { styles } from './styles';
import { useSearchLogic } from './hooks/useSearchLogic';
import { AddToBoxModal } from '../../components/AddToBoxModal';
import { useModalHandlers } from './hooks/useModalHandlers';
import { useContinueHandler } from './hooks/useContinueHandler';
import { SearchButtons } from './components/SearchButtons';
import { ContinueButton } from './components/ContinueButton';

export const SearchScreen = () => {
  const searchLogic = useSearchLogic();

  const query = searchLogic.query;
  const loading = searchLogic.loading;
  const searchResult = searchLogic.searchResult;
  const foundCodeData = searchLogic.foundCodeData;
  const lastSearchedCode = searchLogic.lastSearchedCode;
  const showAddButton = searchLogic.showAddButton;
  const timerActive = searchLogic.timerActive;
  const handleQueryChange = searchLogic.handleQueryChange;
  const handleSearch = searchLogic.handleSearch;

  const [modalVisible, setModalVisible] = useState(false);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [addToBoxModalVisible, setAddToBoxModalVisible] = useState(false);

  const modalHandlers = useModalHandlers({
    lastSearchedCode,
    foundCodeData,
    stopTimer: searchLogic.stopTimer,
    resetSearch: searchLogic.resetSearch,
    setModalVisible,
    setLabelModalVisible,
    setAddToBoxModalVisible,
  });

  const continueHandler = useContinueHandler();

  const serverUrl = Config?.SERVER_URL || 'не указан';
  const shouldShowActions = modalHandlers.shouldShowActions(searchResult, loading, foundCodeData);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Кнопка "Продолжить" выше поля поиска */}
      <View style={styles.continueButtonContainer}>
        <ContinueButton
          onPress={continueHandler.handleContinue}
          disabled={loading}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Поиск кода</Text>
          <Text style={styles.subtitle}>
            Сервер: {serverUrl}
          </Text>
        </View>



        <AutoSearchInput
          value={query}
          onChangeText={handleQueryChange}
          onSubmit={handleSearch}
          loading={loading}
          placeholder="Введите код и нажмите Enter"
        />

        <AddToBoxModal
          visible={addToBoxModalVisible}
          onClose={() => setAddToBoxModalVisible(false)}
          onAddCode={modalHandlers.handleAddToBox}
          loading={loading}
          boxNumber={foundCodeData?.code?.box_number}
        />

        <SearchResultDisplay
          result={searchResult}
          loading={loading}
        />

        {/* Остальные кнопки (добавить в упаковку и действия) */}
        <SearchButtons
          showAddButton={!!(showAddButton && searchResult && !searchResult.success && !loading)}
          showActions={shouldShowActions}
          loading={loading}
          onAddToPackage={modalHandlers.handleAddToPackage}
          onOpenActionsModal={() => setModalVisible(true)}
        />

        <CodeActionsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onActionPress={modalHandlers.handleActionPress}
        />

        <BindLabelModal
          visible={labelModalVisible}
          onClose={() => setLabelModalVisible(false)}
          onBind={modalHandlers.handleBindLabel}
          loading={loading}
          boxNumber={foundCodeData?.code?.box_number}
        />

        <View style={styles.serverStatus}>
          <View style={[styles.statusIndicator, {
            backgroundColor: loading ? '#FF9500' :
              timerActive ? '#FF9500' : '#34C759'
          }]} />
          <Text style={styles.statusText}>
            {loading ? 'Идет поиск...' :
              timerActive ? 'Таймер активен (60 сек)' :
                'Готово к поиску'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};