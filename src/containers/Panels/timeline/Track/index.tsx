import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { ArrowRight } from 'components/Icons/generated/ArrowRight';
import styles from './index.module.scss';

interface TrackProps {
  children?: React.ReactNode;
  isChildTrackOpen?: boolean; // 자식 트랙이 열려있는 상태로 출력여부
  isLeafTrack?: boolean; // 말단 트랙 확인(말단 트랙인 경우 true)
  title: 'Summary' | 'Base' | string; // 트랙 이름
  paddingLeft?: number; // 트랙 좌측 패딩 값
}

const cx = classNames.bind(styles);

const Track: React.FC<TrackProps> = ({
  children,
  isChildTrackOpen = false,
  isLeafTrack = false,
  title,
  paddingLeft = 10,
}) => {
  // 화살표 토글 버튼(true면 하위 트랙 open)
  const [toggleArrowButton, setToggleArrowButton] = useState(false);

  // 토글 화살표 버튼 클릭
  const clickToggleArrowButton = useCallback(() => {
    setToggleArrowButton((prev) => !prev);
  }, []);

  // 트랙 마우스 우클릭
  const clickRightMouse = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // 자식 트랙 open 여부 변경
  useEffect(() => {
    setToggleArrowButton(isChildTrackOpen);
  }, [isChildTrackOpen]);

  return (
    <>
      <div className={cx('track-wrapper')} onContextMenu={clickRightMouse}>
        <div className={cx('track-body')} style={{ paddingLeft: `${paddingLeft}px` }}>
          {!isLeafTrack && (
            <button
              className={cx('track-button', 'arrow-button', { opened: toggleArrowButton })}
              onClick={clickToggleArrowButton}
            >
              <ArrowRight width="0.75rem" height="0.75rem" viewBox={'0 0 4 8'} />
            </button>
          )}
          <span>{title}</span>
          <div className={cx('track-button-wrapper')}>
            {/* To Do...
              아이콘 3종 적용
             */}
          </div>
        </div>
        <div
          className={cx('children-track-list')}
          style={{ display: toggleArrowButton ? 'block' : 'none' }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default Track;
