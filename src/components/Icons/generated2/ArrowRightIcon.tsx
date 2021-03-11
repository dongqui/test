import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowRightIcon = React.memo<SvgIconProps>(
  ({ width = 4, height = 8, fillColor = '#000', viewBox = '0 0 4 8', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M3.717 3.717a.4.4 0 010 .566L.683 7.317A.4.4 0 010 7.034V.966A.4.4 0 01.683.683l3.034 3.034z"
        fill="#fff"
      />
    </svg>
  ),
);
