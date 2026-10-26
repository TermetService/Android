import React from 'react';

import { HandWorkScreenView } from '../../components/HandWork/HandWorkScreenView';
import { useHandWorkScreen } from '../../hooks/useHandWorkScreen';

interface HandWorkScreenProps {
  onTaskCompleted: () => void;
}

export const HandWorkScreen: React.FC<HandWorkScreenProps> = ({
  onTaskCompleted,
}) => {
  const model = useHandWorkScreen({ onTaskCompleted });

  return <HandWorkScreenView {...model} />;
};
