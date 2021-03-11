import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowDownIcon = React.memo<SvgIconProps>(
  ({ width = 8, height = 4, fillColor = '#000', viewBox = '0 0 8 4', style }) => (
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
