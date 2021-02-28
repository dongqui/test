import React from 'react';
import { SvgIconProps } from '../index';
export const Circle = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={9} cy={9} r={9} fill="#fff" />
    </svg>
  ),
);
