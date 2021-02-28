import React from 'react';
import { SvgIconProps } from '../index';
export const Rectangle = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
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
