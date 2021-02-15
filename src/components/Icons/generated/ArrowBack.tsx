import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowBack = React.memo<SvgIconProps>(
  ({ size = 24, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path d="M5 1L1 5l4 4" stroke="#A7A7A7" strokeLinecap="round" />
    </svg>
  ),
);
