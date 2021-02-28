import React from 'react';
import { SvgIconProps } from '../index';
export const CaretRightSmall = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M2.816 2.654a.2.2 0 000-.308L.328.273A.2.2 0 000 .427v4.146a.2.2 0 00.328.154l2.488-2.073z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
