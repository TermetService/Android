import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  canAddProductToTarget,
  canMoveBox,
  getActionTargetName,
} from '../../utils/actionsModal';
import type { SearchActionsModalModel } from '../../hooks/useSearchActionsModal';
import { styles } from './styles';
import type {
  ActionTarget,
  AggregationInfo,
} from '../../types/aggregation';
import { AddProductSection } from './AddProductSection';
import { MoveBoxSection } from './MoveBoxSection';

interface ActionEntityBlockProps {
  target: ActionTarget;
  scanResult: AggregationInfo;
  model: SearchActionsModalModel;
}

export const ActionEntityBlock: React.FC<ActionEntityBlockProps> = ({
  target,
  scanResult,
  model,
}) => {
  const [isExpanded, setIsExpanded] = useState(target.isCurrent);

  const isPackage = target.scanType !== 'PRODUCT';
  const isSmallBox = target.scanType === 'SMALL_BOX_LABEL';
  const isPrintingThisTarget = model.printingCode === target.code;
  const targetName = getActionTargetName(target);
  const isPrinting = model.printingType !== null;
  const isActionsDisabled =
    isPrinting ||
    model.isDeleting ||
    model.isAddingContent ||
    model.isMovingBox ||
    !target.code;

  const canAddProduct = canAddProductToTarget(scanResult, target);
  const isAddingToThisPackage =
    model.addingToPackageCode === target.code;
  const canMove = canMoveBox(target);
  const isMovingThisBox = model.movingCode === target.code;
  const hasInlineForm =
    (canAddProduct && isAddingToThisPackage) ||
    (canMove && isMovingThisBox);

  return (
    <View style={styles.entityBlock}>
      <TouchableOpacity
        style={[
          styles.entityHeader,
          isExpanded && styles.entityHeaderOpen,
        ]}
        onPress={() => setIsExpanded(previous => !previous)}
        activeOpacity={0.75}
      >
        <Text style={styles.entityName}>{targetName}</Text>
        <Text style={styles.entityChevron}>
          {isExpanded ? '⌃' : '⌄'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.entityBody}>
          <View style={styles.entityActions}>
            {isPackage && (
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isActionsDisabled && styles.disabledButton,
                ]}
                onPress={() => model.printTarget(target)}
                disabled={isActionsDisabled}
              >
                {isPrintingThisTarget ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Печать</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.dangerButton,
                isActionsDisabled && styles.disabledButton,
              ]}
              onPress={() => model.confirmDelete(target)}
              disabled={isActionsDisabled}
            >
              {model.isDeleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {target.scanType === 'PRODUCT'
                    ? 'Удалить товар'
                    : 'Удалить'}
                </Text>
              )}
            </TouchableOpacity>

            {canAddProduct && !isAddingToThisPackage && (
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isActionsDisabled && styles.disabledButton,
                ]}
                onPress={() => model.startAddingProduct(target.code)}
                disabled={isActionsDisabled}
              >
                <Text style={styles.buttonText}>Добавить</Text>
              </TouchableOpacity>
            )}

            {canMove && !isMovingThisBox && (
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isActionsDisabled && styles.disabledButton,
                ]}
                onPress={() => model.startMovingBox(target.code)}
                disabled={isActionsDisabled}
              >
                <Text style={styles.buttonText}>Переместить</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasInlineForm && <View style={styles.entityDivider} />}

          {canAddProduct && (
            <AddProductSection
              contentCode={model.contentCode}
              isEditing={isAddingToThisPackage}
              isAddingContent={model.isAddingContent}
              isDeleting={model.isDeleting}
              isPrinting={isPrinting}
              onChangeCode={model.setContentCode}
              onSubmit={() => model.confirmAddProduct(target)}
              onCancel={model.cancelAddingProduct}
            />
          )}

          {canMove && (
            <MoveBoxSection
              outerCode={model.outerCode}
              isSmallBox={isSmallBox}
              isEditing={isMovingThisBox}
              isMovingBox={model.isMovingBox}
              isAddingContent={model.isAddingContent}
              isDeleting={model.isDeleting}
              isPrinting={isPrinting}
              onChangeOuterCode={model.setOuterCode}
              onSubmit={() => model.confirmMoveBox(target)}
              onCancel={model.cancelMovingBox}
            />
          )}
        </View>
      )}
    </View>
  );
};
