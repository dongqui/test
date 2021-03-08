import React from 'react';
import { SvgIconProps } from '../index';
export const SquareIcon = React.memo<SvgIconProps>(
  ({ width = 18, height = 18, fillColor = '#000', viewBox = '0 0 18 18', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <rect width={18} height={18} rx={2} fill="#fff" />
    </svg>
  ),
);
