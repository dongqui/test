import React from 'react';
import { SvgIconProps } from '../index';
export const PlayForwardIcon = React.memo<SvgIconProps>(
  ({ width = 20, height = 16, fillColor = '#000', viewBox = '0 0 16 20', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M1.357 9.152a1 1 0 000 1.696l13.113 8.196a1 1 0 001.53-.848V1.804a1 1 0 00-1.53-.848L1.357 9.152z"
        fill="#fff"
      />
    </svg>
  ),
);
