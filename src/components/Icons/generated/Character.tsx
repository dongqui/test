import React from 'react';
import { SvgIconProps } from '../index';
export const Character = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={12} cy={9} r={2} fill="#000" />
      <path
        d="M11.584 11.624a.5.5 0 01.832 0l3.066 4.599a.5.5 0 01-.416.777H8.934a.5.5 0 01-.416-.777l3.066-4.599z"
        fill="#000"
      />
    </svg>
  ),
);
