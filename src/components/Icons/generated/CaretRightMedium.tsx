import React from 'react';
import { SvgIconProps } from '../index';
export const CaretRightMedium = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M4.217 3.717a.4.4 0 010 .566L1.183 7.317A.4.4 0 01.5 7.034V.966a.4.4 0 01.683-.283l3.034 3.034z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
