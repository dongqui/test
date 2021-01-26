import React from 'react';

export interface CloseIconProps {
  width: number;
  height: number;
  style?: React.CSSProperties;
}

const CloseIconComponent: React.FC<CloseIconProps> = ({ width, height, style = {} }) => (
  <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M1 1L19 19M19 1L1 19" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CloseIcon = React.memo(CloseIconComponent);
