import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowDown = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M5.47 12.53a.75.75 0 001.06 0l4.773-4.773a.75.75 0 00-1.06-1.06L6 10.939 1.757 6.697a.75.75 0 10-1.06 1.06L5.47 12.53zM5.25 0v12h1.5V0h-1.5z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
