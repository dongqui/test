import React from 'react';
import { SvgIconProps } from '../index';
export const Listview = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <g stroke="#3785F7" fill="none" fillRule="evenodd" strokeLinecap="round">
        <path d="M.5.5h11M3.5 3.5h8M.5 6.5h11M3.5 9.5h8" />
      </g>
    </svg>
  ),
);
