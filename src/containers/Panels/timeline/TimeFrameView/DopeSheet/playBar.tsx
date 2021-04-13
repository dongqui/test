import React, { useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import { storeCurrentVisualizedData } from 'lib/store';
import styles from './index.module.scss';

interface Props {}

const cx = classNames.bind(styles);
const PLAY_BAR_COLOR = '#ECEDEE';

const PlayBar: React.FC<Props> = () => {
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  return (
    <>
      {currentVisualizedData && (
        <svg
          width="20"
          height="240"
          viewBox="0 0 20 24"
          className={cx('play-bar-wrapper')}
          id="play-bar-wrapper"
        >
          <g>
            <rect
              x="0.1"
              y="-0.1"
              width="1.2"
              height="432.2"
              transform="matrix(-1 0 0 1 1.7 1)"
              fill={PLAY_BAR_COLOR}
              strokeWidth="0.2"
            />
            <path
              d="M0 1C0 0.447716 0.447715 0 1 0H19C19.5523 0 20 0.447715 20 1V14.4114C20 14.692 19.8821 14.9598 19.675 15.1492L10.675 23.3825C10.2929 23.7321 9.70712 23.7321 9.32502 23.3825L0.325019 15.1492C0.11794 14.9598 0 14.692 0 14.4114V1Z"
              fill={PLAY_BAR_COLOR}
            />
          </g>
        </svg>
      )}
    </>
  );
};

export default PlayBar;
