import React from 'react';
import classNames from 'classnames/bind';
import styles from './TrackList.module.scss';

interface Props {}

const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = () => {
  return (
    <>
      <div className={cx('tracklist-wrapper')}>track list</div>
    </>
  );
};

export default TrackList;
