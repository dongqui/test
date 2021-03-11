import React from 'react';
import { SvgIconProps } from '../index';
export const HorizontalBarIcon = React.memo<SvgIconProps>(
  ({ width = 22, height = 8, fillColor = '#000', viewBox = '0 0 24 10', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M12 9a4 4 0 100-8 4 4 0 000 8zM1.05 5H7M17.01 5h5.95"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
);
