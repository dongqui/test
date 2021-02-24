import React from 'react';
import { SvgIconProps } from '../index';
export const ModelCharacter = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <circle cx={10} cy={7.4} r={2.4} fill="#fff" />
      <path
        d="M9.646 11.354a.5.5 0 01.708 0l4.792 4.792a.5.5 0 01-.353.854H5.207a.5.5 0 01-.353-.854l4.792-4.792z"
        fill="#fff"
      />
      <circle cx={16} cy={15} r={3.5} fill="#fff" stroke="#151515" />
    </svg>
  ),
);
