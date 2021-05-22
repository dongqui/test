import React, { memo } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

interface Props {}

const cx = classNames.bind(styles);
const PLAY_BAR_COLOR = '#ECEDEE';

const PlayBar: React.FC<Props> = () => {
  return (
    <>
      <svg width="20" height="480" className={cx('play-bar')} id="play-bar">
        <g>
          <line x1="0" y1="480" x2="0" y2="0" />
          <path
            d="M0 1C0 0.447716 0.447715 0 1 0H19C19.5523 0 20 0.447715 20 1V14.4114C20 14.692 19.8821 14.9598 19.675 15.1492L10.675 23.3825C10.2929 23.7321 9.70712 23.7321 9.32502 23.3825L0.325019 15.1492C0.11794 14.9598 0 14.692 0 14.4114V1Z"
            fill={PLAY_BAR_COLOR}
          />
        </g>
      </svg>
    </>
  );
};

export default memo(PlayBar);
