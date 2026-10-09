import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import { ExpectedScanType } from './expectedScan';

import { styles } from './styles';
import { ManualWorkModal } from './Modal/ManualWorkModal';

export const HandWorkScreen = () => {
  const [showManualModal, setShowManualModal] = useState(false);

  const [expectedScan, setExpectedScan] = useState<ExpectedScanType | null>(
    null,
  );

  const startHandWork = () => {
    setShowManualModal(true);
  };

  const stopHandWork = () => {
    setShowManualModal(false);
  };

  useEffect(() => {
    startHandWork();
  }, []);

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Ручная работа</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startHandWork}
              activeOpacity={0.7}
            >
              <Text style={styles.startButtonText}>Начать ручную работу</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ManualWorkModal
        visible={showManualModal}
        onClose={stopHandWork}
        expectedScan={expectedScan}
        onExpectedScanChange={setExpectedScan}
      />
    </>
  );
};
