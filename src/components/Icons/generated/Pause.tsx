import React from 'react';
import { SvgIconProps } from '../index';
export const Pause = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <rect x={29} y={8} width={4} height={20} rx={1} fill="#fff" />
      <rect x={39} y={8} width={4} height={20} rx={1} fill="#fff" />
    </svg>
  ),
);
