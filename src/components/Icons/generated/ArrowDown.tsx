import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowDown = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M3.717 3.717a.4.4 0 00.566 0L7.317.683A.4.4 0 007.034 0H.966a.4.4 0 00-.283.683l3.034 3.034z"
        fill="#fff"
      />
    </svg>
  ),
);
