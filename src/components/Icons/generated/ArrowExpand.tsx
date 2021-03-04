import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowExpand = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <g stroke="#000" strokeWidth={2} fill="none" fillRule="evenodd" strokeLinecap="round">
        <path d="M10 1h5v5M6 15H1v-5" />
      </g>
    </svg>
  ),
);
