import React from 'react';
import { SvgIconProps } from '../index';
export const ModelCircle = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={12} cy={12} r={6} fill="#fff" />
    </svg>
  ),
);
