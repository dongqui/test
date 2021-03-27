import React from 'react';
import { SvgIconProps } from '../index';
export const DropdownArrowDownIcon = React.memo<SvgIconProps>(
  ({ width = 10, height = 15, fillColor = '#000', viewBox = '0 0 6 4', style }) => (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 1L3 3L5 1" stroke="white" strokeLinecap="round" />
    </svg>
  ),
);
