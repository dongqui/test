import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowRightBIcon = React.memo<SvgIconProps>(
  ({ width = 7, height = 10, fillColor = '#000', viewBox = '0 0 7 10', style }) => (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 9L5 5L1 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
);
