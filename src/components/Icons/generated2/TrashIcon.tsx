import React from 'react';
import { SvgIconProps } from '../index';
export const TrashIcon = React.memo<SvgIconProps>(
  ({ width = 18, height = 20, fillColor = '#000', viewBox = '0 0 20 22', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M1 5h18M6 5V3a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5h14z"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
);
