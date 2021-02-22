import React from 'react';
import { SvgIconProps } from '../index';
export const CaretLeftSmall = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M.184 2.654a.2.2 0 010-.308L2.672.273A.2.2 0 013 .427v4.146a.2.2 0 01-.328.154L.184 2.654z"
        fill={fillColor}
        fillRule="nonzero"
      />
    </svg>
  ),
);
