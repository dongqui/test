import React from 'react';
import { SvgIconProps } from '../index';
export const ChevronUp = React.memo<SvgIconProps>(
  ({ size = 24, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path d="M9 5L5 1 1 5" stroke={fillColor} fill="none" fillRule="evenodd" />
    </svg>
  ),
);
