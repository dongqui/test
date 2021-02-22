import React from 'react';
import { SvgIconProps } from '../index';
export const Playarrow = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M10.52 6.136a1 1 0 010 1.728l-9.016 5.259A1 1 0 010 12.259V1.741A1 1 0 011.504.877l9.015 5.26z"
        fill={fillColor}
        fillRule="nonzero"
      />
    </svg>
  ),
);
