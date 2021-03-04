import React from 'react';
import { SvgIconProps } from '../index';
export const Camera = React.memo<SvgIconProps>(
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
        d="M23 17a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
        stroke="#A7A7A7"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a4 4 0 100-8 4 4 0 000 8z"
        stroke="#A7A7A7"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
);
