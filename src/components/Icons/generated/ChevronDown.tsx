import React from 'react';
import { SvgIconProps } from '../index';
export const ChevronDown = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path d="M9 1L5 5 1 1" stroke={fillColor} fill="none" fillRule="evenodd" />
    </svg>
  ),
);
