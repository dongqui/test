import React from 'react';
import { SvgIconProps } from '../index';
export const CaretUpMedium = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M3.717.283a.4.4 0 01.566 0l3.034 3.034A.4.4 0 017.034 4H.966a.4.4 0 01-.283-.683L3.717.283z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
