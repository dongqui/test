import React from 'react';
import { SvgIconProps } from '../index';
export const CaretUpSmall = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M2.846.684a.2.2 0 01.308 0l2.073 2.488a.2.2 0 01-.154.328H.927a.2.2 0 01-.154-.328L2.846.684z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
