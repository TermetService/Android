import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { ExpectedScanType } from './expectedScan';
import { ManualWorkModal } from './Modal/ManualWorkModal';


export const HandWorkScreen: React.FC = () => {
  const [expectedScan, setExpectedScan] = useState<ExpectedScanType | null>(
    null,
  );

  return (
    <View style={screenStyles.container}>
      <ManualWorkModal
        expectedScan={expectedScan}
        onExpectedScanChange={setExpectedScan}
      />
    </View>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

})