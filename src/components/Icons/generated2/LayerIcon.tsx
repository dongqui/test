import React from 'react';
import { SvgIconProps } from '../index';
export const LayerIcon = React.memo<SvgIconProps>(
  ({ width = 20, height = 20, fillColor = '#000', viewBox = '0 0 22 22', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M11 1L1 6l10 5 10-5-10-5zM1 16l10 5 10-5M1 11l10 5 10-5"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
);
