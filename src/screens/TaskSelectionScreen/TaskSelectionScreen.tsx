import React from 'react';

import { TaskSelectionView } from '../../components/TaskSelection/TaskSelectionView';
import { useTaskSelection } from '../../hooks/useTaskSelection';

interface TaskSelectionScreenProps {
  onTaskSelected: (taskId: number) => void;
}

export const TaskSelectionScreen: React.FC<TaskSelectionScreenProps> = ({
  onTaskSelected,
}) => {
  const model = useTaskSelection(onTaskSelected);

  return <TaskSelectionView {...model} />;
};
