import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowForwardIcon = React.memo<SvgIconProps>(
  ({ width = 5, height = 8, fillColor = '#000', viewBox = '0 0 5 8', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path d="M1 1l3 3-3 3" stroke="#A7A7A7" strokeLinecap="round" />
    </svg>
  ),
);
