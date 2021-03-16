import React, { useCallback, useState } from 'react';
import classNames from 'classnames/bind';
import _ from 'lodash';
import Track from './Track';
import styles from './TrackList.module.scss';

interface Props {
  trackListRef: React.RefObject<HTMLDivElement>;
}

const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = ({ trackListRef }) => {
  const [trackInputText, settrackInputText] = useState('');

  // 트랙 인풋 텍스트 변경
  const changeTrackInputText = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    settrackInputText(event.target.value);
  }, []);

  return (
    <>
      <div className={cx('track-list-container')} ref={trackListRef}>
        <div className={cx('track-input-wrapper')}>
          {/* To Do
              돋보기 아이콘 적용
          */}
          <input type="text" onChange={changeTrackInputText} value={trackInputText} />
        </div>
        <div className={cx('track-list-wrapper')}>
          <Track
            title="Summary"
            trackNumber={1}
            tempData={[
              {
                title: 'Bone',
                tempData: [
                  { title: '111', tempData: [{ title: '111111' }] },
                  { title: '222' },
                  { title: '333' },
                  { title: '444' },
                  { title: '555' },
                  { title: '666' },
                  { title: '777' },
                  { title: '888' },
                  { title: '999' },
                ],
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default TrackList;
