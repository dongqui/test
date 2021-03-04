import React from 'react';
import { SvgIconProps } from '../index';
export const Motion = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={13} cy={12} transform="rotate(180 13 12)" fill="#fff" r={4} />
      <path d="M8 9s-1 1.125-1 3 1 3 1 3" stroke="#fff" strokeLinecap="round" />
    </svg>
  ),
);
