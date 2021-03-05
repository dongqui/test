import React from 'react';
import { SvgIconProps } from '../index';
export const CircleMotionIcon = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 12 12', style }) => (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="6" fill="white" />
    </svg>
  ),
);
