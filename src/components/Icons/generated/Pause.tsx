import React from 'react';
import { SvgIconProps } from '../index';
export const Pause = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <g fill={fillColor} fillRule="nonzero">
        <rect width={2} height={12} rx={1} />
        <rect x={6} width={2} height={12} rx={1} />
      </g>
    </svg>
  ),
);
