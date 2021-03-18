import React, { useCallback, useState } from 'react';
import classNames from 'classnames/bind';
import { ArrowRight } from 'components/Icons/generated/ArrowRight';
import styles from './index.module.scss';

interface TrackProps {
  title: string; // 트랙 이름
  trackNumber: number; // 트랙 번호
  paddingLeft?: number; // 트랙 좌측 패딩 값
  tempData?: any[];
}

const cx = classNames.bind(styles);

const Track: React.FC<TrackProps> = ({ title, trackNumber, paddingLeft = 10, tempData }) => {
  const [toggleArrowButton, setToggleArrowButton] = useState(false); // 화살표 토글 버튼(true면 하위 트랙 open)

  // 토글 화살표 버튼 클릭
  const clickToggleArrowButton = useCallback(() => {
    setToggleArrowButton((prev) => !prev);
  }, []);

  // 트랙 마우스 우클릭
  const clickRightMouse = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <>
      <div
        className={cx('track-wrapper')}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onContextMenu={clickRightMouse}
      >
        <div className={cx('track-body')}>
          {tempData?.length && (
            <button
              className={cx('track-button', 'arrow-button', { opened: toggleArrowButton })}
              onClick={clickToggleArrowButton}
            >
              <ArrowRight width="0.75rem" height="0.75rem" viewBox={'0 0 4 8'} />
            </button>
          )}
          <span>{title}</span>
          <div className={cx('track-button-wrapper')}>
            {/* 
              To Do...
              아이콘 3종 적용
            */}
          </div>
        </div>
      </div>
      {toggleArrowButton &&
        tempData?.map((value, index) => (
          <Track
            key={value.title}
            title={value.title}
            trackNumber={trackNumber + 1 + index}
            tempData={value.tempData}
            paddingLeft={paddingLeft + 10}
          />
        ))}
    </>
  );
};

export default Track;
