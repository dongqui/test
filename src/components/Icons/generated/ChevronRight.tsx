import React from 'react';
import { SvgIconProps } from '../index';
export const ChevronRight = React.memo<SvgIconProps>(
  ({ size = 24, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path d="M1 1l4 4-4 4" stroke={fillColor} fill="none" fillRule="evenodd" />
    </svg>
  ),
);
