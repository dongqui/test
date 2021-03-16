import React from 'react';
import { SvgIconProps } from '../index';
export const CircleIcon = React.memo<SvgIconProps>(
  ({ width = 18, height = 18, fillColor = '#fff', viewBox = '0 0 18 18', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={9} cy={9} r={9} fill={fillColor} />
    </svg>
  ),
);
