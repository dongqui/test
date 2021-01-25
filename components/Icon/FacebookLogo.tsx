/* eslint-disable max-len */
import React from 'react';

export interface FacebookLogoProps {
  width: number;
  height: number;
  style?: React.CSSProperties;
}

const FacebookLogoComponent: React.FC<FacebookLogoProps> = ({ width, height, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path
      d="M24 12.002C24 5.37453 18.6274 0.00195312 12 0.00195312C5.37258 0.00195312 0 5.37453 0 12.002C0 17.9914 4.3882 22.9559 10.125 23.8562V15.4707H7.07812V12.002H10.125V9.3582C10.125 6.3507 11.9166 4.68945 14.6576 4.68945C15.9701 4.68945 17.3438 4.92383 17.3438 4.92383V7.87695H15.8306C14.34 7.87695 13.875 8.80203 13.875 9.75195V12.002H17.2031L16.6711 15.4707H13.875V23.8562C19.6118 22.9559 24 17.9914 24 12.002Z"
      fill="#1877F2"
    />
  </svg>
);

export const FacebookLogo = React.memo(FacebookLogoComponent);
