import React from 'react';
import { SvgIconProps } from '../index';
export const TimeBarIcon = React.memo<SvgIconProps>(
  ({ width = 28, height = 88, fillColor = '#000', viewBox = '0 0 28 88', style }) => (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 16.9639L13 88H15L15 16.6444L27.5 1.64433C28.0428 0.993007 27.5797 0.0041498 26.7318 0.00414972L15 0.00414868V0H13V0.0041485L1.00191 0.00414744C0.154072 0.00414736 -0.309082 0.993007 0.23369 1.64433L13 16.9639Z"
        fill="#E2E2E2"
      />
    </svg>
  ),
);
