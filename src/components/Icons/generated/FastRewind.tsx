import React from 'react';
import { SvgIconProps } from '../index';
export const Fastrewind = React.memo<SvgIconProps>(
  ({ width = 10, height = 10, fillColor = '#000', viewBox = '0 0 24 24', style }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      viewBox={viewBox}
    >
      <g fill="#000" fillRule="nonzero">
        <path d="M6.715 2.571a.5.5 0 000 .858l3.528 2.117a.5.5 0 00.757-.43V.884a.5.5 0 00-.757-.429L6.715 2.571zM.715 2.571a.5.5 0 000 .858l3.528 2.117A.5.5 0 005 5.116V.884a.5.5 0 00-.757-.429L.715 2.571z" />
      </g>
    </svg>
  ),
);
