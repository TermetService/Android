// src/components/BurgerMenu/BurgerIcon.tsx
import React from 'react';
import Svg, { Line } from 'react-native-svg';

interface BurgerIconProps {
  size?: number;
  color?: string;
}

export const BurgerIcon: React.FC<BurgerIconProps> = ({ 
  size = 24, 
  color = '#333' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="3"
        y1="18"
        x2="21"
        y2="18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};