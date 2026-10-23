import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { styles } from './TaskCompletionModal.styles';

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
  onComplete: () => void | Promise<void>;
  isCompleting?: boolean;
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
                  selectable
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
  isCompleting = false,
}) => {
  // Полные коды товаров с порядковыми номерами.
  const renderProductCodes = (codes: string[]) => (
    <View style={styles.productCodesList}>
      {codes.map((code, index) => (
        <View key={`${code}-${index}`} style={styles.codeItem}>
          <Text style={styles.codeIndex}>{index + 1}.</Text>

          <Text style={styles.codeText} selectable>
            {String(code ?? '')}
          </Text>
        </View>
      ))}
    </View>
  );

  // Номера коробок без полного кода этикетки.
  const renderPackageNumbers = (numbers: string[]) => (
    <View style={styles.packageNumbersList}>
      {numbers.map((number, index) => (
        <View key={`${number}-${index}`} style={styles.packageNumberItem}>
          <Text style={styles.packageNumberText} selectable>
            № {number}
          </Text>
        </View>
      ))}
    </View>
  );

  // Отображение коробок и паллет с проблемами заполненности.
  const renderContainers = (containers: ContainerFillStats[]) =>
    containers.map((container, index) => (
      <ContainerItem
        key={`${container.label}-${index}`}
        container={container}
        isLast={index === containers.length - 1}
      />
    ));

  const invalidSmallBoxes =
    stats?.smallBoxes.filter(
      container => !container.isFull || container.isOverfilled,
    ) ?? [];

  const invalidBigBoxes =
    stats?.bigBoxes.filter(
      container => !container.isFull || container.isOverfilled,
    ) ?? [];

  const invalidPallets =
    stats?.pallets.filter(
      container => !container.isFull || container.isOverfilled,
    ) ?? [];

  // Отдельный рендеринг проблем комплектации.
  const renderPackagingIssues = () => {
    if (!stats) {
      return null;
    }

    const hasProductsWithoutPackaging = stats.productsWithoutPackagingCount > 0;

    const hasSmallBoxesWithoutBigBox = stats.smallBoxesWithoutBigBoxCount > 0;

    const hasBigBoxesWithoutPallet = stats.bigBoxesWithoutPalletCount > 0;

    if (
      !hasProductsWithoutPackaging &&
      !hasSmallBoxesWithoutBigBox &&
      !hasBigBoxesWithoutPallet
    ) {
      return null;
    }

    return (
      <>
        <Text style={styles.groupTitle}>Проблемы комплектации</Text>

        {hasProductsWithoutPackaging && (
          <ExpandableSection
            title="Товары без упаковки"
            count={stats.productsWithoutPackagingCount}
            hasIssues
          >
            {renderProductCodes(stats.productsWithoutPackaging)}
          </ExpandableSection>
        )}

        {hasSmallBoxesWithoutBigBox && (
          <ExpandableSection
            title="Малые коробки без больших"
            count={stats.smallBoxesWithoutBigBoxCount}
            hasIssues
          >
            {renderPackageNumbers(stats.smallBoxesWithoutBigBox)}
          </ExpandableSection>
        )}

        {hasBigBoxesWithoutPallet && (
          <ExpandableSection
            title="Большие коробки без паллет"
            count={stats.bigBoxesWithoutPalletCount}
            hasIssues
          >
            {renderPackageNumbers(stats.bigBoxesWithoutPallet)}
          </ExpandableSection>
        )}
      </>
    );
  };

  // Отдельный рендеринг проблем заполненности.
  const renderFillIssues = () => {
    const hasInvalidSmallBoxes = invalidSmallBoxes.length > 0;
    const hasInvalidBigBoxes = invalidBigBoxes.length > 0;
    const hasInvalidPallets = invalidPallets.length > 0;

    if (!hasInvalidSmallBoxes && !hasInvalidBigBoxes && !hasInvalidPallets) {
      return null;
    }

    return (
      <>
        <Text style={styles.groupTitle}>Проблемы с заполненностью</Text>

        {hasInvalidSmallBoxes && (
          <ExpandableSection
            title="Малые коробки с проблемами"
            count={invalidSmallBoxes.length}
            hasIssues
          >
            {renderContainers(invalidSmallBoxes)}
          </ExpandableSection>
        )}

        {hasInvalidBigBoxes && (
          <ExpandableSection
            title="Большие коробки с проблемами"
            count={invalidBigBoxes.length}
            hasIssues
          >
            {renderContainers(invalidBigBoxes)}
          </ExpandableSection>
        )}

        {hasInvalidPallets && (
          <ExpandableSection
            title="Паллеты с проблемами"
            count={invalidPallets.length}
            hasIssues
          >
            {renderContainers(invalidPallets)}
          </ExpandableSection>
        )}
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
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
                Проблем с комплектацией и заполнением нет. Задание можно
                завершить.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Всего продуктов</Text>

                <Text style={styles.summaryValue}>{stats.totalRecords}</Text>
              </View>

              {renderPackagingIssues()}
              {renderFillIssues()}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              isCompleting && styles.disabledButton,
            ]}
            onPress={() => void onComplete()}
            disabled={isCompleting}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {isCompleting ? 'Завершение...' : 'Завершить задание'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
