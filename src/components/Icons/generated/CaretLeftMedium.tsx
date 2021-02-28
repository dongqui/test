import React from 'react';
import { SvgIconProps } from '../index';
export const CaretLeftMedium = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M.783 3.717a.4.4 0 000 .566l3.034 3.034a.4.4 0 00.683-.283V.966a.4.4 0 00-.683-.283L.783 3.717z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
