import React from 'react';
import { SvgIconProps } from '../index';
export const CheckSquareChecked = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <g fill="none" fillRule="evenodd">
        <rect fill="#000" fillRule="nonzero" width={12} height={12} rx={2} />
        <path
          stroke="#FFF"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.263 6.042l1.912 2.21 3.458-4.573"
        />
      </g>
    </svg>
  ),
);
