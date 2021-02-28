import React from 'react';
import { SvgIconProps } from '../index';
export const ArrowRight = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <path
        d="M12.53 6.53a.75.75 0 000-1.06L7.757.697a.75.75 0 00-1.06 1.06L10.939 6l-4.242 4.243a.75.75 0 001.06 1.06L12.53 6.53zM0 6.75h12v-1.5H0v1.5z"
        fill="#000"
        fillRule="nonzero"
      />
    </svg>
  ),
);
