import React from 'react';
import { SvgIconProps } from '../index';
export const PlayIcon = React.memo<SvgIconProps>(
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
        d="M14.643 9.152a1 1 0 010 1.696L1.53 19.044A1 1 0 010 18.196V1.804A1 1 0 011.53.956l13.113 8.196z"
        fill="#fff"
      />
    </svg>
  ),
);
