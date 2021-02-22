import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowBack = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path d="M5 1L1 5l4 4" stroke="#A7A7A7" strokeLinecap="round" />
    </svg>
  ),
);
