import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

export interface ContainerFillStats {
  label: string;
  actualCount: number;
  expectedCount: number;
  isFull: boolean;
  isOverfilled: boolean;
  missingCount: number;
  productCodes: string[];
}

export interface TaskPackagingStats {
  totalRecords: number;
  isValid: boolean;

  productsWithoutPackaging: string[];
  smallBoxesWithoutBigBox: string[];
  bigBoxesWithoutPallet: string[];

  productsWithoutPackagingCount: number;
  smallBoxesWithoutBigBoxCount: number;
  bigBoxesWithoutPalletCount: number;

  smallBoxes: ContainerFillStats[];
  bigBoxes: ContainerFillStats[];
  pallets: ContainerFillStats[];
}

interface TaskCompletionModalProps {
  visible: boolean;
  stats: TaskPackagingStats | null;
  onClose: () => void;
  onComplete?: () => void;
}

interface ExpandableSectionProps {
  title: string;
  count: number;
  hasIssues?: boolean;
  emptyText?: string;
  children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  count,
  hasIssues = false,
  emptyText = 'Нет данных',
  children,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(prev => !prev)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionHeaderText}>{title}</Text>

        <View
          style={[
            styles.countBadge,
            hasIssues && count > 0 && styles.countBadgeError,
          ]}
        >
          <Text
            style={[
              styles.countText,
              hasIssues && count > 0 && styles.countTextError,
            ]}
          >
            {count}
          </Text>
        </View>

        <Text style={styles.expandIcon}>{expanded ? '⌃' : '⌄'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.sectionBody}>
          {count === 0 ? (
            <Text style={styles.emptyText}>{emptyText}</Text>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
};

interface ContainerItemProps {
  container: ContainerFillStats;
  isLast: boolean;
}

const ContainerItem: React.FC<ContainerItemProps> = ({ container, isLast }) => {
  const [showContents, setShowContents] = useState(false);

  const {
    label,
    actualCount,
    expectedCount,
    isFull,
    isOverfilled,
    missingCount,
    productCodes,
  } = container;

  const progress =
    expectedCount > 0
      ? Math.min((actualCount / expectedCount) * 100, 100)
      : actualCount > 0
      ? 100
      : 0;

  const progressWidth = `${progress}%` as `${number}%`;

  const statusText = isOverfilled
    ? 'Переполнение'
    : isFull
    ? 'Заполнена'
    : missingCount > 0
    ? `Не хватает ${missingCount}`
    : 'Не заполнена';

  const statusStyle = isOverfilled
    ? styles.fillStatusOverfilled
    : isFull
    ? styles.fillStatusFull
    : styles.fillStatusIncomplete;

  const progressStyle = isOverfilled
    ? styles.progressFillOverfilled
    : isFull
    ? styles.progressFill
    : styles.progressFillIncomplete;

  return (
    <View style={[styles.containerItem, isLast && styles.itemLast]}>
      <View style={styles.containerRow}>
        <Text style={styles.itemLabel}>{label}</Text>

        <Text style={styles.itemValue}>
          {actualCount}/{expectedCount}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFillBase,
            progressStyle,
            { width: progressWidth },
          ]}
        />
      </View>

      <Text style={[styles.fillStatus, statusStyle]}>{statusText}</Text>

      {productCodes.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.contentsButton}
            onPress={() => setShowContents(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.contentsButtonText}>
              Содержимое ({productCodes.length})
            </Text>

            <Text style={styles.expandIcon}>{showContents ? '⌃' : '⌄'}</Text>
          </TouchableOpacity>

          {showContents && (
            <View style={styles.contentsList}>
              {productCodes.map((code, index) => (
                <Text
                  key={`${code}-${index}`}
                  style={[
                    styles.codeRow,
                    index === productCodes.length - 1 && styles.itemLast,
                  ]}
                >
                  {code}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  visible,
  stats,
  onClose,
  onComplete,
}) => {
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
      return;
    }

    // TODO: Подключить API завершения задания.
    console.log('Завершение задания');
  };

  const renderCodes = (codes: string[]) =>
    codes.map((code, index) => (
      <Text
        key={`${code}-${index}`}
        style={[styles.codeRow, index === codes.length - 1 && styles.itemLast]}
      >
        {code}
      </Text>
    ));

  const renderContainers = (containers: ContainerFillStats[]) =>
    containers.map((container, index) => (
      <ContainerItem
        key={`${container.label}-${index}`}
        container={container}
        isLast={index === containers.length - 1}
      />
    ));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        {/* Заголовок */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Проверка задания</Text>
          </View>

          <TouchableOpacity
            style={styles.headerCloseButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.headerCloseText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Результат проверки */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {!stats ? (
            <View style={styles.result}>
              <Text style={styles.resultTitleError}>
                Нет результата проверки
              </Text>

              <Text style={styles.resultText}>
                Данные валидации задания ещё не получены.
              </Text>
            </View>
          ) : stats.isValid ? (
            <View style={styles.result}>
              <Text style={styles.resultTitle}>Проверка пройдена</Text>

              <Text style={styles.resultText}>
                Упаковочные записи отсутствуют. Задание можно завершить.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Всего продуктов</Text>

                <Text style={styles.summaryValue}>{stats.totalRecords}</Text>
              </View>

              <Text style={styles.groupTitle}>Проблемы комплектации</Text>

              <ExpandableSection
                title="Товары без упаковки"
                count={stats.productsWithoutPackagingCount}
                hasIssues
                emptyText="Нет товаров без упаковки"
              >
                {renderCodes(stats.productsWithoutPackaging)}
              </ExpandableSection>

              <ExpandableSection
                title="Малые коробки без больших"
                count={stats.smallBoxesWithoutBigBoxCount}
                hasIssues
                emptyText="Нет малых коробок без больших"
              >
                {renderCodes(stats.smallBoxesWithoutBigBox)}
              </ExpandableSection>

              <ExpandableSection
                title="Большие коробки без паллет"
                count={stats.bigBoxesWithoutPalletCount}
                hasIssues
                emptyText="Нет больших коробок без паллет"
              >
                {renderCodes(stats.bigBoxesWithoutPallet)}
              </ExpandableSection>

              <Text style={styles.groupTitle}>Заполненность упаковок</Text>

              <ExpandableSection
                title="Малые коробки"
                count={stats.smallBoxes.length}
              >
                {renderContainers(stats.smallBoxes)}
              </ExpandableSection>

              <ExpandableSection
                title="Большие коробки"
                count={stats.bigBoxes.length}
              >
                {renderContainers(stats.bigBoxes)}
              </ExpandableSection>

              <ExpandableSection title="Паллеты" count={stats.pallets.length}>
                {renderContainers(stats.pallets)}
              </ExpandableSection>
            </>
          )}
        </ScrollView>

        {/* Кнопка всегда доступна */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Завершить задание</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerText: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: '#222',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    fontSize: 13,
    lineHeight: 17,
    marginTop: 2,
  },
  headerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCloseText: {
    color: '#333',
    fontSize: 22,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
  },
  content: {
    paddingBottom: 10,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#555',
    fontSize: 13,
  },
  summaryValue: {
    color: '#222',
    fontSize: 17,
    fontWeight: '700',
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginTop: 5,
    marginBottom: 7,
  },
  section: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 6,
    overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f7f7f7',
  },
  sectionHeaderText: {
    flex: 1,
    color: '#222',
    fontSize: 13,
    fontWeight: '600',
    paddingRight: 6,
  },
  countBadge: {
    minWidth: 26,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
  },
  countBadgeError: {
    backgroundColor: '#ffebe9',
  },
  countText: {
    color: '#444',
    fontSize: 12,
    fontWeight: '700',
  },
  countTextError: {
    color: '#d93025',
  },
  expandIcon: {
    width: 20,
    textAlign: 'right',
    marginLeft: 6,
    color: '#666',
    fontSize: 17,
  },
  sectionBody: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  codeRow: {
    color: '#333',
    fontSize: 13,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  containerItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemLabel: {
    flex: 1,
    color: '#333',
    fontSize: 13,
    paddingRight: 8,
  },
  itemValue: {
    color: '#222',
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e8e8e8',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFillBase: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    backgroundColor: '#218838',
  },
  progressFillIncomplete: {
    backgroundColor: '#e0a126',
  },
  progressFillOverfilled: {
    backgroundColor: '#d93025',
  },
  fillStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  fillStatusFull: {
    color: '#218838',
  },
  fillStatusIncomplete: {
    color: '#b7791f',
  },
  fillStatusOverfilled: {
    color: '#d93025',
  },
  contentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 7,
  },
  contentsButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  contentsList: {
    marginTop: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e5e5',
  },
  emptyText: {
    color: '#218838',
    fontSize: 12,
    paddingVertical: 5,
  },
  result: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#edf7ed',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#218838',
  },
  resultTitleError: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a15c00',
  },
  resultText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#555',
    marginTop: 3,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  completeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
