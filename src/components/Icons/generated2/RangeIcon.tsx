import React from 'react';
import { SvgIconProps } from '../index';
export const RangeIcon = React.memo<SvgIconProps>(
  ({ width = 36, height = 36, fillColor = '#000', viewBox = '0 0 36 36', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M22 9h2a3 3 0 013 3v12a3 3 0 01-3 3h-1.615M14 9h-2a3 3 0 00-3 3v12a3 3 0 003 3h1.615"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  ),
);
