/* eslint-disable max-len */
import React from 'react';

export interface GoogleLogoProps {
  width: number;
  height: number;
  style?: React.CSSProperties;
}

const GoogleLogoComponent: React.FC<GoogleLogoProps> = ({ width, height, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <g clipPath="url(#clip0)">
      <path
        d="M23.766 12.2802C23.766 11.4644 23.6999 10.6443 23.5588 9.8418H12.24V14.4628H18.7217C18.4528 15.9531 17.5885 17.2715 16.323 18.1093V21.1076H20.19C22.4608 19.0176 23.766 15.9311 23.766 12.2802Z"
        fill="#4285F4"
      />
      <path
        d="M12.24 24.0052C15.4764 24.0052 18.2058 22.9426 20.1944 21.1083L16.3274 18.1099C15.2516 18.8419 13.8626 19.2564 12.2444 19.2564C9.11376 19.2564 6.45934 17.1443 5.50693 14.3047H1.51648V17.3956C3.55359 21.4478 7.70278 24.0052 12.24 24.0052V24.0052Z"
        fill="#34A853"
      />
      <path d="M5.50253 14.3046C4.99987 12.8143 4.99987 11.2004 5.50253 9.71008V6.61914H1.51649C-0.18551 10.0099 -0.18551 14.0048 1.51649 17.3955L5.50253 14.3046V14.3046Z" fill="#FBBC04" />
      <path
        d="M12.24 4.75357C13.9508 4.72711 15.6043 5.37087 16.8433 6.55257L20.2694 3.12652C18.1 1.08941 15.2207 -0.0305597 12.24 0.00471492C7.70277 0.00471492 3.55359 2.56213 1.51648 6.61871L5.50252 9.70966C6.45052 6.86564 9.10935 4.75357 12.24 4.75357V4.75357Z"
        fill="#EA4335"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="24" height="24" fill="white" transform="translate(0 0.00390625)" />
      </clipPath>
    </defs>
  </svg>
);

export const GoogleLogo = React.memo(GoogleLogoComponent);
