import React from 'react';
import { SvgIconProps } from '../index';
export const ModelIcon = React.memo<SvgIconProps>(
  ({ width = 12, height = 12, fillColor = '#000', viewBox = '0 0 12 12', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={6} cy={2.4} r={2.4} fill="#fff" />
      <path
        d="M5.646 6.354a.5.5 0 01.708 0l4.792 4.792a.5.5 0 01-.353.854H1.207a.5.5 0 01-.353-.854l4.792-4.792z"
        fill="#fff"
      />
    </svg>
  ),
);
