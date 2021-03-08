import React from 'react';
import { SvgIconProps } from '../index';
export const PlusIcon = React.memo<SvgIconProps>(
  ({ width = 12, height = 12, fillColor = '#000', viewBox = '0 0 12 12', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path stroke="#A7A7A7" strokeLinecap="round" d="M5.955.5v11M11.5 5.955H.5" />
    </svg>
  ),
);
