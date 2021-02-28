import React from 'react';
import { SvgIconProps } from '../index';
export const Folder = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M9.5 8h-9a.5.5 0 01-.5-.5v-7A.5.5 0 01.5 0h3.208a.5.5 0 01.435.255l.714 1.268a.5.5 0 00.435.255H9.5a.5.5 0 01.5.5V7.5a.5.5 0 01-.5.5z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
