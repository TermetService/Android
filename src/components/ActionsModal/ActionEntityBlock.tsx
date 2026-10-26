import React from 'react';
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
  const isPackage = target.scanType !== 'PRODUCT';
  const isSmallBox = target.scanType === 'SMALL_BOX_LABEL'
  const isPrintingThisTarget = model.printingCode === target.code;
  const targetName = getActionTargetName(target);
  const isPrinting = model.printingType !== null;
  const isActionsDisabled =
    isPrinting || model.isDeleting || model.isAddingContent || !target.code;

  const canAddProduct = canAddProductToTarget(scanResult, target);
  const isAddingToThisPackage =
    model.addingToPackageCode === target.code;
  const canMove = canMoveBox(target);
  const isMovingThisBox = model.movingCode === target.code;

  return (
    <View style={styles.entityBlock}>
      <Text style={styles.entityName}>{targetName}</Text>

      <View style={styles.entityActions}>
        {isPackage && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              isActionsDisabled && styles.disabledButton,
            ]}
            onPress={() => void model.printTarget(target)}
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
              {target.scanType === 'PRODUCT' ? 'Удалить товар' : 'Удалить'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {canAddProduct && (
        <AddProductSection
          aggregationLevel={scanResult.aggregationLvl}
          contentCode={model.contentCode}
          isEditing={isAddingToThisPackage}
          isAddingContent={model.isAddingContent}
          isDeleting={model.isDeleting}
          isPrinting={isPrinting}
          onChangeCode={model.setContentCode}
          onStart={() => model.startAddingProduct(target.code)}
          onSubmit={() => void model.addProductToPackage(target.code)}
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
          onStart={() => model.startMovingBox(target.code)}
          onSubmit={() => void model.moveBox(target.code)}
          onCancel={model.cancelMovingBox}
        />
      )}
    </View>
  );
};
