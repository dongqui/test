/* eslint-disable max-len */
import React from 'react';

export interface ArrowRightProps {
  width: number;
  height: number;
  color?: string;
  style?: React.CSSProperties;
}

const ArrowRightComponent: React.FC<ArrowRightProps> = ({ width, height, color = 'white', style = {} }) => (
  <svg width={width} height={height} viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path
      d="M27.4142 16.4142C28.1953 15.6332 28.1953 14.3668 27.4142 13.5858L14.6863 0.857866C13.9052 0.0768168 12.6389 0.0768167 11.8579 0.857865C11.0768 1.63891 11.0768 2.90524 11.8579 3.68629L23.1716 15L11.8579 26.3137C11.0768 27.0948 11.0768 28.3611 11.8579 29.1421C12.6389 29.9232 13.9052 29.9232 14.6863 29.1421L27.4142 16.4142ZM-1.74846e-07 17L26 17L26 13L1.74846e-07 13L-1.74846e-07 17Z"
      fill={color}
    />
  </svg>
);

export const ArrowRight = React.memo(ArrowRightComponent);
