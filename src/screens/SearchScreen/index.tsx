import React from 'react';

import { SearchScreenView } from '../../components/Search/SearchScreenView';
import { useSearchScreen } from '../../hooks/useSearchScreen';

export const SearchScreen: React.FC = () => {
  const model = useSearchScreen();

  return <SearchScreenView {...model} />;
};
