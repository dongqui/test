import React from 'react';
import { SvgIconProps } from '../index';
export const IconviewIcon = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <rect width={5.455} height={5.455} rx={1} fill={fillColor} />
      <rect x={6.545} width={5.455} height={5.455} rx={1} fill={fillColor} />
      <rect y={6.545} width={5.455} height={5.455} rx={1} fill={fillColor} />
      <rect x={6.545} y={6.545} width={5.455} height={5.455} rx={1} fill={fillColor} />
    </svg>
  ),
);
