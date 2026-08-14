// SearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { ReturnCodeModal } from '../../components/ReturnCodeModal';
import { ApiService } from '../../services/api';

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
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

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

  // ✅ ОБЕ КНОПКИ ВСЕГДА ПОКАЗЫВАЮТСЯ ВМЕСТЕ
  const shouldShowButtons = !!(
    searchResult &&
    !loading &&
    searchResult.from === 'code'
  );

  const showAddButtonCondition = !!(
    showAddButton &&           // таймер активен (60 сек)
    shouldShowButtons
  );

  const showReturnButton = shouldShowButtons;

  // Отладка
  console.log('🔍 searchResult:', searchResult);
  console.log('📌 shouldShowButtons:', shouldShowButtons);
  console.log('📌 showAddButtonCondition:', showAddButtonCondition);
  console.log('📌 showReturnButton:', showReturnButton);

  // Обработчик возврата кода
  const handleReturnCode = async () => {
    if (!lastSearchedCode) {
      Alert.alert('Ошибка', 'Код не найден');
      return;
    }

    setReturnLoading(true);
    try {
      const result = await ApiService.returnCodeToLaser(lastSearchedCode);

      if (result.success) {
        Alert.alert('✅ Успешно', result.message);
        searchLogic.resetSearch();
        setReturnModalVisible(false);
      } else {
        Alert.alert('❌ Ошибка', result.message);
      }
    } catch (error) {
      Alert.alert('❌ Ошибка', 'Не удалось вернуть код');
      console.error(error);
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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

        <Text style={{ color: 'gray', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
          Debug: success={searchResult?.success?.toString()},
          from={searchResult?.from}
          boxNumber={searchResult?.boxNumber}
          boxLabel={searchResult?.boxLabel}
        </Text>

        {/* ✅ КНОПКИ ВСЕГДА РЯДОМ */}
        <SearchButtons
          showAddButton={showAddButtonCondition}
          showReturnButton={showReturnButton}
          showActions={shouldShowActions}
          loading={loading}
          onAddToPackage={modalHandlers.handleAddToPackage}
          onReturnCode={() => setReturnModalVisible(true)}
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

        <ReturnCodeModal
          visible={returnModalVisible}
          code={lastSearchedCode || ''}
          onConfirm={handleReturnCode}
          onCancel={() => setReturnModalVisible(false)}
          loading={returnLoading}
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