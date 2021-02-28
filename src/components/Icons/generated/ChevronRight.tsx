import React from 'react';
import { SvgIconProps } from '../index';
export const ChevronRight = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path d="M1 1l4 4-4 4" stroke="#000" fill="none" fillRule="evenodd" />
    </svg>
  ),
);
