import React from 'react';
import { SvgIconProps } from '../index';
export const Record = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={6} cy={6} r={6} fill={fillColor} fillRule="nonzero" />
    </svg>
  ),
);
