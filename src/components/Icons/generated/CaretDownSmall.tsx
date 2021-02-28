import React from 'react';
import { SvgIconProps } from '../index';
export const CaretDownSmall = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M2.846 3.316a.2.2 0 00.308 0L5.227.828A.2.2 0 005.073.5H.927a.2.2 0 00-.154.328l2.073 2.488z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
